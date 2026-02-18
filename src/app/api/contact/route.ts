import { NextRequest, NextResponse } from "next/server";
import { getTransporter, getSender } from "@/lib/email";
import redis from "@/lib/redis";
import { generateGoogleCalendarLink } from "@/lib/calendar";
import { getTimeZoneName } from "@/lib/utils-date";
import { partners } from "@/data/partners";
import crypto from "crypto";

/**
 * Convert PST/PDT datetime to UTC Date object
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day
 * @param hours - Hours in 24-hour format
 * @param minutes - Minutes
 * @returns Date object in UTC
 */
/**
 * Create a Date object from PST/PDT time components.
 * This function takes wall-clock time in America/Los_Angeles timezone and returns
 * the corresponding UTC Date object, automatically handling DST transitions.
 *
 * Uses Intl.DateTimeFormat.formatToParts() with explicit timezone to avoid
 * dependency on server locale, ensuring consistent behavior regardless of
 * where the code is deployed.
 *
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12, NOT 0-indexed)
 * @param day - Day of month (1-31)
 * @param hours - Hours in 24-hour format (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Date object representing the time in UTC
 */
function createPSTDate(year: number, month: number, day: number, hours: number, minutes: number): Date {
  // Start with a guess: assume PST (UTC-8)
  // We'll iterate to find the exact UTC time that produces our desired PST wall-clock time
  const targetPSTTime = {
    year,
    month,
    day,
    hours,
    minutes
  };

  // Try different UTC hour offsets (PST is UTC-8, PDT is UTC-7)
  // We check both to handle DST transitions correctly
  for (let utcHourOffset = 7; utcHourOffset <= 8; utcHourOffset++) {
    const candidateUTC = new Date(Date.UTC(year, month - 1, day, hours + utcHourOffset, minutes, 0));

    // Format this UTC time in PST timezone using formatToParts
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(candidateUTC);
    const pstParts = {
      year: parseInt(parts.find(p => p.type === 'year')?.value || '0'),
      month: parseInt(parts.find(p => p.type === 'month')?.value || '0'),
      day: parseInt(parts.find(p => p.type === 'day')?.value || '0'),
      hours: parseInt(parts.find(p => p.type === 'hour')?.value || '0'),
      minutes: parseInt(parts.find(p => p.type === 'minute')?.value || '0')
    };

    // Check if this UTC time produces our target PST time
    if (pstParts.year === targetPSTTime.year &&
        pstParts.month === targetPSTTime.month &&
        pstParts.day === targetPSTTime.day &&
        pstParts.hours === targetPSTTime.hours &&
        pstParts.minutes === targetPSTTime.minutes) {
      return candidateUTC;
    }
  }

  // Fallback: use UTC-8 offset (should rarely reach here)
  console.warn(`createPSTDate: Could not find exact match for ${year}-${month}-${day} ${hours}:${minutes}, using fallback`);
  return new Date(Date.UTC(year, month - 1, day, hours + 8, minutes, 0));
}

export async function POST(request: NextRequest) {
  try {
    // IP Rate Limiting
    // Use request.ip if available (Next.js/Vercel), otherwise fallback to x-forwarded-for
    let ip = (request as any).ip;
    if (!ip) {
      const forwardedFor = request.headers.get("x-forwarded-for");
      if (forwardedFor) {
        // Use the leftmost (first) IP - the original client IP
        const ips = forwardedFor.split(',').map(s => s.trim());
        ip = ips[0];
      }
    }

    if (!ip || ip === "unknown") {
      return NextResponse.json(
        { error: "Unable to determine client IP address." },
        { status: 400 }
      );
    }
    
    // Hash the IP to prevent injection/collision in Redis key
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    const ipLimitKey = `rate_limit:ip:${ipHash}`;
    const RATE_LIMIT_WINDOW = 7200; // 2 hours
    const RATE_LIMIT_MAX = 5;

    // Use a Lua script to atomically increment and set expiry
    // This handles the race condition where the key might expire between check and increment
    const script = `
      local current = redis.call("INCR", KEYS[1])
      if tonumber(current) == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end
      return current
    `;

    const ipCount = await redis.eval(script, {
      keys: [ipLimitKey],
      arguments: [RATE_LIMIT_WINDOW.toString()]
    });
    
    // Limit to 5 requests per 2 hours
    if (typeof ipCount === 'number' && ipCount > RATE_LIMIT_MAX) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, message, locale, category, preferredDate, organization, daycareSlug, tourTime } = body;

    // Basic Validation
    if (!name || typeof email !== "string" || !message || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isDaycare = category === "Daycare";
    const bookingId = crypto.randomUUID();
    
    // 1. Redis Logic for Daycare Bookings with Transaction Protection
    if (isDaycare && preferredDate && daycareSlug) {
      // Prevent same email from booking multiple tours on the same date
      const emailHash = crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
      const emailDateKey = `booking:email:${emailHash}:date:${preferredDate}`;

      const maxRetries = 3;
      let bookingSaved = false;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const client = redis.duplicate();

        try {
          await client.connect();

          const countKey = `daycare:${daycareSlug}:date:${preferredDate}:count`;

          // Watch both keys to ensure atomic check-and-set
          await client.watch(countKey);
          await client.watch(emailDateKey);

          // Check if this email already has a booking on this date
          const existingBooking = await client.get(emailDateKey);
          if (existingBooking) {
            await client.quit();
            return NextResponse.json(
              { error: "You already have a tour booked on this date. Please choose a different date." },
              { status: 409 }
            );
          }

          // Check availability (Max 4 per day)
          const currentCount = await client.get(countKey);

          if (currentCount && parseInt(currentCount) >= 4) {
            await client.quit();
            return NextResponse.json(
              { error: "This time slot is fully booked." },
              { status: 409 }
            );
          }

          // Prepare booking data
          const bookingKey = `booking:${bookingId}`;
          const bookingData = {
            id: bookingId,
            name,
            email,
            daycareName: organization,
            daycareSlug,
            date: preferredDate,
            time: tourTime,
            status: "confirmed",
            createdAt: new Date().toISOString()
          };

          // Execute transaction
          const multi = client.multi();
          multi.set(bookingKey, JSON.stringify(bookingData));
          multi.set(emailDateKey, bookingId);
          multi.expire(emailDateKey, 60 * 60 * 24 * 90); // 90-day TTL as safety net
          multi.incr(countKey);
          multi.sAdd(`bookings:date:${preferredDate}`, bookingId);
          multi.sAdd(`daycare:${daycareSlug}:bookings`, bookingId);
          
          const result = await multi.exec();
          
          if (result) {
            // Transaction successful
            console.log(`✅ Booking ${bookingId} created successfully`);
            bookingSaved = true;
            await client.quit();
            break;
          }
          
          // Transaction failed due to concurrent modification, retry
          console.warn(`⚠️ Booking creation retry ${attempt + 1}/${maxRetries} due to concurrent modification`);
          await client.quit();
          await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
          
        } catch (error) {
          console.error(`❌ Error creating booking (attempt ${attempt + 1}):`, error);
          if (client.isOpen) await client.quit();
          
          if (attempt === maxRetries - 1) {
            throw error;
          }
        }
      }
      
      if (!bookingSaved) {
        return NextResponse.json(
          { error: "Failed to create booking after multiple attempts. Please try again." },
          { status: 500 }
        );
      }
    }

    // 2. Prepare Email Data
    let targetEmail = isDaycare ? "daycare@waymakerbiz.com" : "info@waymakerbiz.com";
    if (isDaycare && daycareSlug) {
      const partner = partners.find(p => p.slug === daycareSlug);
      if (partner?.ownerEmail) {
        targetEmail = `${targetEmail}, ${partner.ownerEmail}`;
      }
    }
    const emailType = isDaycare ? "daycare" : "waymaker";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://daycare.waymakerbiz.com";
    
    // Calendar Link Generation
    let calendarLink = "";
    if (preferredDate && tourTime) {
      // Parse time (e.g., "10:00 AM - 11:00 AM")
      const [startTimeStr] = tourTime.split("-");
      const startTimeParts = startTimeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
      
      if (startTimeParts) {
        let hours = parseInt(startTimeParts[1]);
        const minutes = parseInt(startTimeParts[2]);
        const ampm = startTimeParts[3].toUpperCase();
        
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        
        // Create datetime in PST timezone
        const [year, month, day] = preferredDate.split('-').map(Number);
        
        // Use helper function to create PST datetime correctly converted to UTC
        const startDateTime = createPSTDate(year, month, day, hours, minutes);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Add 1 hour

        calendarLink = generateGoogleCalendarLink({
          title: `Tour at ${organization}`,
          description: `Daycare tour for ${name}.`,
          location: organization || "Daycare",
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          timeZone: "America/Los_Angeles"
        });
      }
    }

    const cancellationLink = (isDaycare && preferredDate)
      ? `${baseUrl}/booking/cancel?id=${bookingId}`
      : "";

    // Get timezone abbreviation for the booking date
    const timeZone = preferredDate ? getTimeZoneName(preferredDate) : getTimeZoneName();

    // 3. Send Email to Daycare/Admin
    const transporter = getTransporter(emailType);
    const sender = getSender(emailType);

    const adminHtmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0F3B4C;">New Tour Request</h2>
        <p><strong>Parent:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Daycare:</strong> ${organization}</p>
        <p><strong>Date:</strong> ${preferredDate}</p>
        <p><strong>Time:</strong> ${tourTime} ${timeZone}</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        ${calendarLink ? `<a href="${calendarLink}" style="display: inline-block; background: #0F3B4C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Add to Google Calendar</a>` : ''}
      </div>
    `;

    await transporter.sendMail({
      from: sender,
      to: targetEmail,
      subject: `New Tour Request: ${name} - ${preferredDate}`,
      html: adminHtmlContent,
      replyTo: email
    });

    // 4. Send Confirmation Email to Parent
    if (isDaycare) {
      const parentHtmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F3B4C;">Tour Confirmed!</h2>
          <p>Dear ${name},</p>
          <p>Your tour at <strong>${organization}</strong> has been scheduled.</p>
          <p><strong>Date:</strong> ${preferredDate}</p>
          <p><strong>Time:</strong> ${tourTime} ${timeZone}</p>
          <p>We look forward to meeting you!</p>

          <div style="margin: 30px 0;">
            ${calendarLink ? `<a href="${calendarLink}" style="display: inline-block; background: #0F3B4C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Add to Google Calendar</a>` : ''}
          </div>

          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            Need to reschedule? <a href="${cancellationLink}" style="color: #d9534f;">Cancel this booking</a>
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: sender,
        to: email,
        subject: `Tour Confirmation: ${organization}`,
        html: parentHtmlContent
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
