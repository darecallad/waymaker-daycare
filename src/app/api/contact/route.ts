import { NextRequest, NextResponse } from "next/server";
import { getTransporter, getSender } from "@/lib/email";
import redis from "@/lib/redis";
import { generateGoogleCalendarLink } from "@/lib/calendar";
import { partners } from "@/data/partners";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // IP Rate Limiting
    // Use request.ip if available (Next.js/Vercel), otherwise fallback to x-forwarded-for
    let ip = (request as any).ip;
    if (!ip) {
      const forwardedFor = request.headers.get("x-forwarded-for");
      if (forwardedFor) {
        // Use the rightmost IP in the x-forwarded-for chain (most trusted proxy)
        const ips = forwardedFor.split(',').map(s => s.trim());
        ip = ips[ips.length - 1];
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
    if (!name || !email || !message || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isDaycare = category === "Daycare";
    const bookingId = crypto.randomUUID();
    
    // 1. Redis Logic for Daycare Bookings with Transaction Protection
    if (isDaycare && preferredDate && daycareSlug) {
      const maxRetries = 3;
      let bookingSaved = false;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const client = redis.duplicate();
        
        try {
          await client.connect();
          
          const countKey = `daycare:${daycareSlug}:date:${preferredDate}:count`;
          
          // Watch the count key to ensure atomic check-and-increment
          await client.watch(countKey);
          
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
        
        // Construct date in UTC to ensure the ISO string matches expected wall-clock time
        // This is necessary because Calendar Link generator strips 'Z' and applies local timezone
        const [year, month, day] = preferredDate.split('-').map(Number);
        
        const startDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
        const endDateTime = new Date(Date.UTC(year, month - 1, day, hours + 1, minutes, 0));

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
        <p><strong>Time:</strong> ${tourTime}</p>
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
          <p><strong>Time:</strong> ${tourTime}</p>
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
