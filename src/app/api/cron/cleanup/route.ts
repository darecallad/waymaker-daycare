import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Calculate "Yesterday" in PST
    const now = new Date();
    const pstDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    pstDate.setDate(pstDate.getDate() - 1);
    
    const yesterdayStr = pstDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`Running cleanup for date: ${yesterdayStr}`);

    const bookingIds = await redis.sMembers(`bookings:date:${yesterdayStr}`);
    
    let deletedCount = 0;

    if (bookingIds && bookingIds.length > 0) {
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
    }

    // Cleanup the daily list itself
    await redis.del(`bookings:date:${yesterdayStr}`);
    
    // Cleanup the count keys for all daycares for that date?
    // We don't have a list of all daycares easily here unless we fetch all partners.
    // But we can scan or just leave the count key (it's small).
    // To be thorough, we could iterate the bookings and find the unique daycares, then delete their count keys.
    // But since we already have the booking objects, we can do it inside the loop if we want, but multiple bookings might share the same daycare.
    // A simpler way is to just let the count keys expire if we set TTL, but we didn't set TTL.
    // For now, deleting the booking IDs is the main requirement.

    return NextResponse.json({ success: true, deleted: deletedCount, date: yesterdayStr });
  } catch (error) {
    console.error("Cleanup Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
