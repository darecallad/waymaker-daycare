import { NextRequest, NextResponse } from "next/server";
import { consultingCopy } from "@/data/consulting";
import { escapeHtml, getSender, getTransporter } from "@/lib/email";
import { parseProviderInquiry } from "@/lib/provider-inquiry";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const INBOX = "info@waymakerbiz.com";

/** Consulting inquiry from /for-providers: one email to Waymaker, reply-to the sender. */
export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (!ip) return NextResponse.json({ error: "Unable to determine client IP address." }, { status: 400 });
    if (await isRateLimited(ip, "provider", 3, 3600)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const parsed = parseProviderInquiry(await request.json().catch(() => null));
    if (!parsed.ok) return NextResponse.json({ error: `Invalid field: ${parsed.field}` }, { status: 400 });
    const inquiry = parsed.value;

    // Labels in English for the team, whatever language the form was filled in.
    const labels = consultingCopy.en.form;
    const rows: [string, string][] = [
      ["Name", inquiry.name],
      ["Email", inquiry.email],
      ["Phone", inquiry.phone || "-"],
      ["City", inquiry.city],
      ["Planning", labels.types[inquiry.type]],
      ["Stage", labels.stages[inquiry.stage]],
      ["Reply in", labels.languages[inquiry.language]],
    ];
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0F3B4C;">New provider consulting inquiry</h2>
        ${rows.map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(v)}</p>`).join("")}
        ${inquiry.message ? `<div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:20px 0;">${escapeHtml(inquiry.message).replace(/\n/g, "<br>")}</div>` : ""}
      </div>`;

    await getTransporter("waymaker").sendMail({
      from: getSender("waymaker"),
      to: INBOX,
      replyTo: inquiry.email,
      // Strip CR/LF so a crafted name cannot inject mail headers through the subject.
      subject: `Consulting inquiry: ${labels.types[inquiry.type]} - ${inquiry.city} - ${inquiry.name}`.replace(/[\r\n]+/g, " "),
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Provider inquiry error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
