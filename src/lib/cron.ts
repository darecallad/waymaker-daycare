import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export function validateCronRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  
  // 1. Validate Server Configuration
  if (!cronSecret) {
    console.error("CRON_SECRET is not defined in environment variables.");
    return NextResponse.json(
      { error: "Server Configuration Error" }, 
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization') || "";
  const expectedAuth = `Bearer ${cronSecret}`;

  // 2. Constant-time comparison
  // Ensure buffers are of same length before comparing to avoid errors
  // If lengths differ, we can't use timingSafeEqual directly on them, 
  // but we know it's invalid.
  let isAuthorized = false;
  
  if (authHeader.length === expectedAuth.length) {
    isAuthorized = crypto.timingSafeEqual(
      Buffer.from(authHeader), 
      Buffer.from(expectedAuth)
    );
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // Authorized
}
