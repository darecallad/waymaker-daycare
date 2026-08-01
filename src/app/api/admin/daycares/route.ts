import { NextRequest, NextResponse } from "next/server";
import { requireAccess } from "@/lib/auth";
import { getBookingsForDaycare } from "@/lib/bookings";
import { getTourSettings } from "@/lib/tour-schedule";
import { getPSTDate } from "@/lib/utils-date";

/**
 * List every daycare the signed-in user may manage, with its merged tour settings and the
 * number of upcoming bookings (so the dashboard can warn before closing a date).
 *
 * Owners see only their own locations; Super Admins see all of them.
 */
export async function GET(request: NextRequest) {
  const { session, error } = await requireAccess(request);
  if (error) return error;

  try {
    const today = getPSTDate();

    const daycares = await Promise.all(
      session.slugs.map(async (slug) => {
        const settings = await getTourSettings(slug);
        if (!settings) return null;

        const upcoming = await getBookingsForDaycare(slug, { from: today });

        return {
          ...settings,
          upcomingBookings: upcoming.length,
        };
      })
    );

    return NextResponse.json({
      role: session.role,
      email: session.email,
      daycares: daycares.filter((entry) => entry !== null),
    });
  } catch (err) {
    console.error("❌ Failed to list daycares:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
