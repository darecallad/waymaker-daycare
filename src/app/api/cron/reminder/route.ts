import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getTransporter, getSender } from "@/lib/email";
import { validateCronRequest } from "@/lib/cron";
import { getPSTDate, maskEmail, getTimeZoneName } from "@/lib/utils-date";

export async function GET(request: NextRequest) {
  const authError = validateCronRequest(request);
  if (authError) return authError;

  try {
    // Calculate "Tomorrow" in PST (San Jose) using explicit timezone
    const tomorrowStr = getPSTDate(1); // PST tomorrow
    
    console.log(`🔔 Running reminders for date: ${tomorrowStr} (PST)`);

    const bookingIds = await redis.sMembers(`bookings:date:${tomorrowStr}`);
    
    if (!bookingIds || bookingIds.length === 0) {
      console.log(`ℹ️ No bookings found for ${tomorrowStr}`);
      return NextResponse.json({ message: "No bookings for tomorrow" });
    }

    console.log(`📧 Found ${bookingIds.length} bookings needing reminders`);

    const transporter = getTransporter("daycare");
    const sender = getSender("daycare");

    let sentCount = 0;

    for (const id of bookingIds) {
      const bookingDataStr = await redis.get(`booking:${id}`);
      if (bookingDataStr) {
        const booking = JSON.parse(bookingDataStr);

        if (booking.status === 'confirmed') {
          try {
            // Get timezone abbreviation for the booking date
            const timeZone = getTimeZoneName(booking.date);

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
                    <p><strong>Time:</strong> ${booking.time} ${timeZone}</p>
                  </div>
                  <p>We look forward to seeing you!</p>
                </div>
              `
            });
            sentCount++;
            console.log(`✅ Reminder sent to ${maskEmail(booking.email)} for booking ${id}`);
          } catch (emailError) {
            console.error(`❌ Failed to send reminder to ${maskEmail(booking.email)}:`, emailError);
          }
        }
      }
    }

    console.log(`✅ Reminder cron completed: ${sentCount} emails sent`);
    return NextResponse.json({ success: true, sent: sentCount, date: tomorrowStr });
  } catch (error) {
    console.error("❌ Reminder Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
