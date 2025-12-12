import { NextRequest, NextResponse } from "next/server";
import { getTransporter, getSender } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, locale, category, preferredDate, organization } = body;

    // 基本驗證
    if (!name || !email || !message || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine target email
    const isDaycare = category === "Daycare";
    const targetEmail = isDaycare ? "daycare@waymakerbiz.com" : "info@waymakerbiz.com";
    const emailType = isDaycare ? "daycare" : "waymaker";
    const bookingId = crypto.randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.waymakerbiz.com";
    const cancellationLink = preferredDate 
      ? `${baseUrl}/booking/cancel?id=${bookingId}&date=${preferredDate}`
      : "";

    // 準備郵件內容 - HTML 格式
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2F4858; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #2F4858; }
            .value { margin-left: 10px; }
            .message-box { background-color: white; padding: 20px; border-left: 4px solid #2F4858; margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 新的聯絡訊息</h1>
              <p>New Contact Message</p>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">姓名 / Name:</span>
                <span class="value">${name}</span>
              </div>
              <div class="field">
                <span class="label">Email:</span>
                <span class="value">${email}</span>
              </div>
              <div class="field">
                <span class="label">聯絡單位 / Organization:</span>
                <span class="value">${category}</span>
              </div>
              <div class="field">
                <span class="label">語言 / Language:</span>
                <span class="value">${locale === "en" ? "English" : "繁體中文"}</span>
              </div>
              <div class="message-box">
                <div class="label">訊息內容 / Message:</div>
                <div style="margin-top: 10px; white-space: pre-wrap;">${message}</div>
              </div>
            </div>
            <div class="footer">
              <p>此郵件由 Waymaker CPR 網站自動發送</p>
              <p>This email was automatically sent from Waymaker CPR website</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 準備純文字版本
    const textContent = `
新的聯絡訊息 / New Contact Message
============================================

姓名 / Name: ${name}
Email: ${email}
聯絡單位 / Organization: ${category}
語言 / Language: ${locale === "en" ? "English" : "繁體中文"}

訊息內容 / Message:
--------------------------------------------
${message}
--------------------------------------------

============================================
此郵件由 Waymaker CPR 網站自動發送
This email was automatically sent from Waymaker CPR website
    `;

    // 發送郵件
    const transporter = getTransporter(emailType);
    const sender = getSender(emailType);

    const mailOptions = {
      from: `"Waymaker CPR Contact" <${sender}>`,
      to: targetEmail,
      replyTo: email, // 可以直接回覆給客戶
      subject: `📧 新聯絡訊息 / New Contact - ${name}`,
      text: textContent,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to user
    const userSubject = locale === "en" 
      ? "We received your message - Waymaker CPR" 
      : "我們已收到您的訊息 - Waymaker CPR";


    // Generate Google Calendar Link if date is present
    let calendarLink = "";
    if (preferredDate && organization) {
      const dateStr = preferredDate.replace(/-/g, "");
      // Assuming 1 hour duration for tour
      const startTime = dateStr + "T100000"; 
      const endTime = dateStr + "T110000";
      const details = encodeURIComponent("Tour at " + organization);
      const location = encodeURIComponent(organization);
      calendarLink = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent("Daycare Tour: " + organization) + "&dates=" + startTime + "/" + endTime + "&details=" + details + "&location=" + location;
    }

    let userHtmlContent = "";
    if (locale === "en") {
      userHtmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2F4858; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
            .btn { display: inline-block; background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Message Received</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for contacting Waymaker CPR. We have received your message and will get back to you as soon as possible.</p>
              <p><strong>Your Message:</strong></p>
              <p style="background-color: white; padding: 15px; border-left: 4px solid #2F4858;">${message}</p>
              
              ${calendarLink ? `<p><strong>Upcoming Tour:</strong><br><a href="${calendarLink}" class="btn" target="_blank">Add to Google Calendar</a></p>` : ''}
              
              ${cancellationLink ? `
              <div style="margin-top: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="font-size: 14px; color: #666;">Need to cancel?</p>
                <a href="${cancellationLink}" style="color: #dc2626; text-decoration: underline;">Cancel Booking</a>
              </div>
              ` : ""}
            </div>
            <div class="footer">
              <p>&copy; Waymaker CPR</p>
            </div>
          </div>
        </body>
      </html>`;
    } else {
      userHtmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2F4858; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
            .btn { display: inline-block; background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>我們已收到您的訊息</h1>
            </div>
            <div class="content">
              <p>親愛的 ${name} 您好，</p>
              <p>感謝您聯繫 Waymaker CPR。我們已收到您的訊息，將盡快回覆您。</p>
              <p><strong>您的訊息：</strong></p>
              <p style="background-color: white; padding: 15px; border-left: 4px solid #2F4858;">${message}</p>

              ${calendarLink ? `<p><strong>即將到來的參觀：</strong><br><a href="${calendarLink}" class="btn" target="_blank">加入 Google 行事曆</a></p>` : ''}

              ${cancellationLink ? `
              <div style="margin-top: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="font-size: 14px; color: #666;">需要取消預約？</p>
                <a href="${cancellationLink}" style="color: #dc2626; text-decoration: underline;">取消預約</a>
              </div>
              ` : ""}
            </div>
            <div class="footer">
              <p>&copy; Waymaker CPR</p>
            </div>
          </div>
        </body>
      </html>`;
    }

    const userTextContent = locale === "en"
      ? `Dear ${name},\n\nThank you for contacting Waymaker CPR. We have received your message.\n\nYour Message:\n${message}\n\nWe will get back to you shortly.`
      : `親愛的 ${name} 您好，\n\n感謝您聯繫 Waymaker CPR。我們已收到您的訊息。\n\n您的訊息：\n${message}\n\n我們將盡快回覆您。`;

    const userMailOptions = {
      from: `"Waymaker CPR" <${sender}>`,
      to: email,
      subject: userSubject,
      text: userTextContent,
      html: userHtmlContent,
    };

    await transporter.sendMail(userMailOptions);

    return NextResponse.json({
      success: true,
      message: "Contact email sent successfully",
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
