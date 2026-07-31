import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * Return the current dashboard session, used by the admin pages to decide whether to
 * render the login screen.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      session: { email: session.email, role: session.role, slugs: session.slugs },
    });
  } catch (error) {
    console.error("❌ Session lookup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
