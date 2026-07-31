import { NextRequest, NextResponse } from "next/server";
import { getTransporter, getSender } from "@/lib/email";
import { maskEmail } from "@/lib/utils-date";
import { recordAuditEvent } from "@/lib/audit";
import { isValidEmail, issueLoginCode, normalizeEmail, resolveAccess, discardLoginCode, canRequestLoginCode } from "@/lib/auth";

/**
 * Send a one-time login code to an allowlisted administrator.
 *
 * Always answers with the same success payload so the endpoint cannot be used to enumerate
 * which addresses are authorized administrators: the throttle is applied before the
 * allowlist check and being throttled looks exactly like success.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const normalized = normalizeEmail(email);

    // Counted for every address, allowlisted or not, so a 429 cannot single out an admin
    const withinLimit = await canRequestLoginCode(normalized);

    const access = resolveAccess(normalized);

    if (!access) {
      // Unknown address: pretend everything worked
      console.warn(`🚫 Login code requested for unrecognized address ${maskEmail(normalized)}`);
      await recordAuditEvent({
        actor: normalized,
        action: "login.code_requested",
        outcome: "denied",
        summary: "Login code requested by an address that is not on the administrator allowlist",
        request,
      });
      return NextResponse.json({ success: true });
    }

    if (!withinLimit) {
      console.warn(`🚫 Login code request throttled for ${maskEmail(normalized)}`);
      await recordAuditEvent({
        actor: normalized,
        actorRole: access.role,
        action: "login.code_requested",
        outcome: "denied",
        summary: "Login code request throttled (too many requests in 15 minutes)",
        request,
      });
      return NextResponse.json({ success: true });
    }

    const code = await issueLoginCode(normalized);

    const transporter = getTransporter("daycare");
    const sender = getSender("daycare");

    try {
      await transporter.sendMail({
        from: sender,
        to: normalized,
        subject: `Your Waymaker daycare login code: ${code}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0F3B4C;">Daycare Dashboard Login</h2>
            <p>Use the code below to sign in. It expires in 10 minutes.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #0F3B4C;">${code}</span>
            </div>
            <p style="font-size: 12px; color: #666;">If you did not request this code you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (sendError) {
      // Do not surface delivery failures: a different status here would reveal which
      // addresses are on the allowlist. Drop the code so it cannot linger unused.
      await discardLoginCode(normalized);
      console.error(`❌ Could not deliver login code to ${maskEmail(normalized)}:`, sendError);
      return NextResponse.json({ success: true });
    }

    console.log(`📧 Login code sent to ${maskEmail(normalized)} (${access.role})`);

    await recordAuditEvent({
      actor: normalized,
      actorRole: access.role,
      action: "login.code_requested",
      summary: "Login code sent",
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Login code error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
