import { NextRequest, NextResponse } from "next/server";
import { cancelBooking, notifyDaycareOfCancellation } from "@/lib/bookings";

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    const result = await cancelBooking(bookingId, { cancelledBy: "parent" });

    if (result.status === "not_found") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (result.status === "already_cancelled") {
      return NextResponse.json({ message: "Booking already cancelled" });
    }

    // Notify the daycare. Email problems are logged but never fail the cancellation.
    if (result.booking) {
      await notifyDaycareOfCancellation(result.booking);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Cancellation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
