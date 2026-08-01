import { NextRequest, NextResponse } from "next/server";
import { requireAccess } from "@/lib/auth";
import { getBookingsForDaycare } from "@/lib/bookings";
import { maskEmail, getPSTDate } from "@/lib/utils-date";

/**
 * Upcoming bookings for a daycare, used by the dashboard to show what a closure would break.
 *
 * Parent emails are masked: owners already receive the full details by email when a booking
 * is created, so the dashboard does not need to expose a bulk list of addresses.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { session, error } = await requireAccess(request, slug);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || getPSTDate();
    const dates = searchParams.get("dates")?.split(",").map((d) => d.trim()).filter(Boolean);

    const bookings = await getBookingsForDaycare(slug, {
      from: dates && dates.length > 0 ? undefined : from,
      dates: dates && dates.length > 0 ? dates : undefined,
    });

    return NextResponse.json({
      slug,
      role: session.role,
      bookings: bookings.map((booking) => ({
        id: booking.id,
        name: booking.name,
        email: maskEmail(booking.email),
        date: booking.date,
        time: booking.time,
        status: booking.status,
      })),
    });
  } catch (err) {
    console.error(`❌ Failed to list bookings for ${slug}:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
