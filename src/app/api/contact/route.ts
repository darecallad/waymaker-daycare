import { NextRequest, NextResponse } from "next/server";
import { getTransporter, getSender } from "@/lib/email";
import redis from "@/lib/redis";
import { generateGoogleCalendarLink } from "@/lib/calendar";
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
      } else {
        ip = "unknown";
      }
    }
    
    const ipLimitKey = `rate_limit:ip:${ip}`;
    const RATE_LIMIT_WINDOW = 7200; // 2 hours
    const RATE_LIMIT_MAX = 5;

    // Atomically set the key with expiry if it does not exist, otherwise increment
    // This prevents race conditions where the key is created but expiry is not set
    let ipCount: number;
    const setResult = await redis.set(ipLimitKey, 1, { NX: true, EX: RATE_LIMIT_WINDOW });
    
    if (setResult === "OK") {
      ipCount = 1;
    } else {
      ipCount = await redis.incr(ipLimitKey);
    }
    
    // Limit to 5 requests per 2 hours
    if (ipCount > RATE_LIMIT_MAX) {
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
    
    // 1. Redis Logic for Daycare Bookings
    if (isDaycare && preferredDate && daycareSlug) {
      // Check availability (Max 4 per day)
      const countKey = `daycare:${daycareSlug}:date:${preferredDate}:count`;
      const currentCount = await redis.get(countKey);
      
      if (currentCount && parseInt(currentCount) >= 4) {
        return NextResponse.json(
          { error: "This time slot is fully booked." },
          { status: 409 }
        );
      }

      // Save Booking
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

      await redis.set(bookingKey, JSON.stringify(bookingData));
      await redis.incr(countKey);
      // Add to daily list for reminders
      await redis.sAdd(`bookings:date:${preferredDate}`, bookingId);
      // Add to daycare specific list
      await redis.sAdd(`daycare:${daycareSlug}:bookings`, bookingId);
    }

    // 2. Prepare Email Data
    const targetEmail = isDaycare ? "daycare@waymakerbiz.com" : "info@waymakerbiz.com";
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
        
        const startDateTime = new Date(preferredDate);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(hours + 1, minutes, 0, 0); // Assume 1 hour duration

        calendarLink = generateGoogleCalendarLink({
          title: `Tour at ${organization}`,
          description: `Daycare tour for ${name}.`,
          location: organization || "Daycare",
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString()
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
