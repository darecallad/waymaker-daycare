import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { validateCronRequest } from "@/lib/cron";
import { getPSTDate } from "@/lib/utils-date";

export async function GET(request: NextRequest) {
  const authError = validateCronRequest(request);
  if (authError) return authError;

  try {
    // Calculate "Yesterday" in PST using explicit timezone
    const yesterdayStr = getPSTDate(-1); // PST yesterday
    
    console.log(`🧹 Running cleanup for date: ${yesterdayStr} (PST)`);

    const bookingIds = await redis.sMembers(`bookings:date:${yesterdayStr}`);
    
    let deletedCount = 0;

    if (bookingIds && bookingIds.length > 0) {
      console.log(`🗑️ Deleting ${bookingIds.length} old bookings`);
      
      for (const id of bookingIds) {
        const bookingKey = `booking:${id}`;
        // Get booking to find daycare slug for cleanup
        const bookingDataStr = await redis.get(bookingKey);
        if (bookingDataStr) {
            const booking = JSON.parse(bookingDataStr);
            // Remove from daycare list
            if (booking.daycareSlug) {
                await redis.sRem(`daycare:${booking.daycareSlug}:bookings`, id);
            }
        }
        // Delete the booking object
        await redis.del(bookingKey);
        deletedCount++;
      }
    } else {
      console.log(`ℹ️ No old bookings to cleanup for ${yesterdayStr}`);
    }

    // Cleanup the daily list itself
    await redis.del(`bookings:date:${yesterdayStr}`);

    console.log(`✅ Cleanup completed: ${deletedCount} bookings deleted`);
    return NextResponse.json({ success: true, deleted: deletedCount, date: yesterdayStr });
  } catch (error) {
    console.error("❌ Cleanup Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
