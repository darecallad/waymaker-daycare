import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getTransporter, getSender } from "@/lib/email";
import { maskEmail } from "@/lib/utils-date";

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

    // 1. Update Redis with Transaction Protection
    const maxRetries = 3;
    let cancelled = false;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const client = redis.duplicate();
      
      try {
        await client.connect();
        
        const countKey = `daycare:${booking.daycareSlug}:date:${booking.date}:count`;
        
        // Watch the booking key to ensure atomic deletion
        await client.watch(bookingKey);
        
        // Double-check booking still exists
        const currentBooking = await client.get(bookingKey);
        if (!currentBooking) {
          await client.quit();
          return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        
        // Execute transaction
        const multi = client.multi();
        multi.decr(countKey);
        multi.sRem(`bookings:date:${booking.date}`, bookingId);
        multi.sRem(`daycare:${booking.daycareSlug}:bookings`, bookingId);
        multi.del(bookingKey);
        
        const result = await multi.exec();
        
        if (result) {
          console.log(`✅ Booking ${bookingId} cancelled successfully`);
          cancelled = true;
          await client.quit();
          break;
        }
        
        // Transaction failed, retry
        console.warn(`⚠️ Cancellation retry ${attempt + 1}/${maxRetries}`);
        await client.quit();
        await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
        
      } catch (error) {
        console.error(`❌ Error cancelling booking (attempt ${attempt + 1}):`, error);
        if (client.isOpen) await client.quit();
        
        if (attempt === maxRetries - 1) {
          throw error;
        }
      }
    }
    
    if (!cancelled) {
      return NextResponse.json(
        { error: "Failed to cancel booking after multiple attempts. Please try again." },
        { status: 500 }
      );
    }

    // 2. Notify Daycare
    const transporter = getTransporter("daycare");
    const sender = getSender("daycare");

    try {
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
      console.log(`📧 Cancellation notification sent to daycare for ${maskEmail(booking.email)}`);
    } catch (emailError) {
      console.error(`❌ Failed to send cancellation email:`, emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Cancellation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
