import { NextRequest, NextResponse } from "next/server";
import { maskEmail } from "@/lib/utils-date";
import { recordAuditEvent } from "@/lib/audit";
import {
  canAttemptLogin,
  isValidEmail,
  normalizeEmail,
  setSessionCookie,
  verifyLoginCode,
} from "@/lib/auth";

/**
 * Exchange a one-time code for a dashboard session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json({ error: "Please enter the 6-digit code." }, { status: 400 });
    }

    // Second line of defence behind the per-code attempt cap: stops an attacker from
    // requesting a fresh code every time the previous one locks out and guessing forever.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (!(await canAttemptLogin(ip))) {
      console.warn(`🚫 Login attempts throttled for ${ip}`);
      await recordAuditEvent({
        actor: normalizeEmail(email),
        action: "login.failed",
        outcome: "denied",
        summary: "Sign-in attempts throttled: too many code guesses from this address",
        request,
      });
      return NextResponse.json(
        { error: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    const result = await verifyLoginCode(email, code.trim());

    if (!result.ok) {
      console.warn(`🚫 Failed login attempt for ${maskEmail(email)}: ${result.reason}`);

      await recordAuditEvent({
        actor: normalizeEmail(email),
        action: "login.failed",
        outcome: "denied",
        summary: `Rejected sign-in attempt: ${result.reason}`,
        request,
      });

      return NextResponse.json({ error: result.reason }, { status: 401 });
    }

    console.log(`✅ ${maskEmail(result.session.email)} signed in as ${result.session.role}`);

    await recordAuditEvent({
      actor: result.session.email,
      actorRole: result.session.role,
      action: "login.succeeded",
      summary: `Signed in as ${result.session.role}`,
      request,
    });

    return setSessionCookie(
      NextResponse.json({
        success: true,
        session: {
          email: result.session.email,
          role: result.session.role,
          slugs: result.session.slugs,
        },
      }),
      result.token
    );
  } catch (error) {
    console.error("❌ Login verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
