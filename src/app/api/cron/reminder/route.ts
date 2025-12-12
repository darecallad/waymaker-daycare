import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getTransporter, getSender } from "@/lib/email";

export async function GET() {
  try {
    // Calculate "Tomorrow" in PST (San Jose)
    // We want to find bookings for the date: Now(PST) + 1 day
    const now = new Date();
    // Convert to PST
    const pstDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    pstDate.setDate(pstDate.getDate() + 1);
    
    const tomorrowStr = pstDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`Running reminders for date: ${tomorrowStr}`);

    const bookingIds = await redis.sMembers(`bookings:date:${tomorrowStr}`);
    
    if (!bookingIds || bookingIds.length === 0) {
      return NextResponse.json({ message: "No bookings for tomorrow" });
    }

    const transporter = getTransporter("daycare");
    const sender = getSender("daycare");

    let sentCount = 0;

    for (const id of bookingIds) {
      const bookingDataStr = await redis.get(`booking:${id}`);
      if (bookingDataStr) {
        const booking = JSON.parse(bookingDataStr);
        
        if (booking.status === 'confirmed') {
          await transporter.sendMail({
            from: sender,
            to: booking.email,
            subject: `Reminder: Your Daycare Tour Tomorrow at ${booking.daycareName}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0F3B4C;">Tour Reminder</h2>
                <p>Dear ${booking.name},</p>
                <p>This is a friendly reminder about your daycare tour tomorrow.</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Daycare:</strong> ${booking.daycareName}</p>
                  <p><strong>Date:</strong> ${booking.date}</p>
                  <p><strong>Time:</strong> ${booking.time}</p>
                </div>
                <p>We look forward to seeing you!</p>
              </div>
            `
          });
          sentCount++;
        }
      }
    }

    return NextResponse.json({ success: true, sent: sentCount, date: tomorrowStr });
  } catch (error) {
    console.error("Reminder Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
