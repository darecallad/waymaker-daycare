import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getTransporter, getSender } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    const bookingKey = `booking:${bookingId}`;
    const bookingDataStr = await redis.get(bookingKey);

    if (!bookingDataStr) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = JSON.parse(bookingDataStr);
    
    // If already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json({ message: "Booking already cancelled" });
    }

    // 1. Update Redis
    // Decrement count
    const countKey = `daycare:${booking.daycareSlug}:date:${booking.date}:count`;
    await redis.decr(countKey);
    
    // Remove from lists
    await redis.sRem(`bookings:date:${booking.date}`, bookingId);
    await redis.sRem(`daycare:${booking.daycareSlug}:bookings`, bookingId);
    
    // Delete booking or mark as cancelled (Deleting is requested by user: "系統會自己上去 Redis Storage 刪除那個預約id")
    await redis.del(bookingKey);

    // 2. Notify Daycare
    const transporter = getTransporter("daycare");
    const sender = getSender("daycare");

    await transporter.sendMail({
      from: sender,
      to: "daycare@waymakerbiz.com",
      subject: `Booking Cancelled: ${booking.name} - ${booking.date}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2 style="color: #d9534f;">Booking Cancelled</h2>
          <p>The following tour has been cancelled by the parent:</p>
          <p><strong>Parent:</strong> ${booking.name}</p>
          <p><strong>Daycare:</strong> ${booking.daycareName}</p>
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancellation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
