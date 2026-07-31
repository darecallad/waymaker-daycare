import { NextRequest, NextResponse } from "next/server";
import { generateAvailableSlots, getTourSettings } from "@/lib/tour-schedule";

/** Availability changes as soon as an owner saves, so this must never be cached. */
export const dynamic = "force-dynamic";

/**
 * Public endpoint powering the booking form's date picker.
 *
 * Returns the live (owner-managed) tour hours, closures and bookable slots for a daycare.
 */
export async function GET(request: NextRequest) {
  try {
    const slug = new URL(request.url).searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Missing daycare slug." }, { status: 400 });
    }

    const settings = await getTourSettings(slug);
    if (!settings) {
      return NextResponse.json({ error: "Daycare not found." }, { status: 404 });
    }

    return NextResponse.json({
      slug: settings.slug,
      tourHours: settings.tourHours,
      blockedDates: settings.blockedDates,
      slots: generateAvailableSlots(settings),
    });
  } catch (error) {
    console.error("❌ Failed to load tour availability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
