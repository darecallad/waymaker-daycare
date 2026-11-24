import { NextRequest, NextResponse } from "next/server";
import { PROGRAM_TERMS } from "@/data/partner-program/terms";
import { getSender, getTransporter } from "@/lib/email";
import { handlePartnerApplication } from "@/lib/partner-application-handler";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import redis from "@/lib/redis";

/** How long a stored application is kept. A suggestion until the owner decides (README Q13). */
const STORE_SECONDS = 60 * 60 * 24 * 180;

async function storeApplication(reference: string, record: string): Promise<boolean> {
  const saved = await redis.set(`partner-app:${reference}`, record, {
    condition: "NX",
    expiration: { type: "EX", value: STORE_SECONDS },
  });
  if (saved !== "OK") return false;
  await redis.lPush("partner-app:index", reference);
  return true;
}

/** Partner network application from /for-providers/join/apply: one email to Waymaker, reply-to the applicant. */
export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (!ip) return NextResponse.json({ error: "Unable to determine client IP address." }, { status: 400 });
    if (await isRateLimited(ip, "partner-app", 3, 3600)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const result = await handlePartnerApplication(await request.json().catch(() => null), {
      send: (mail) => getTransporter("waymaker").sendMail({ from: getSender("waymaker"), ...mail }),
      store: PROGRAM_TERMS.storeApplications ? storeApplication : undefined,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("Partner application error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
