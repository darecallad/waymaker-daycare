import { NextRequest, NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/audit";
import { SESSION_COOKIE, destroySession, getSession, setSessionCookie } from "@/lib/auth";

/**
 * Destroy the current dashboard session.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      await destroySession(token);
    }

    if (session) {
      await recordAuditEvent({
        actor: session.email,
        actorRole: session.role,
        action: "logout",
        summary: "Signed out",
        request,
      });
    }

    return setSessionCookie(NextResponse.json({ success: true }), null);
  } catch (error) {
    console.error("❌ Logout error:", error);
    // Still clear the cookie so the browser cannot keep using a token we failed to delete
    return setSessionCookie(NextResponse.json({ success: true }), null);
  }
}
