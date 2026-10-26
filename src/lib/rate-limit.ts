import crypto from "crypto";
import type { NextRequest } from "next/server";
import redis from "@/lib/redis";

/** The original client IP: platform-provided first, else the leftmost x-forwarded-for hop. */
export function clientIp(request: NextRequest): string | null {
  const platformIp = (request as NextRequest & { ip?: string }).ip;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = platformIp || forwarded;
  return ip && ip !== "unknown" ? ip : null;
}

// INCR and EXPIRE in one atomic step, so a key can never be left without an expiry.
const INCR_WITH_EXPIRY = `
  local current = redis.call("INCR", KEYS[1])
  if tonumber(current) == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end
  return current
`;

/**
 * Fixed-window rate limit per client IP.
 *
 * @param bucket - Separates limits per form, e.g. `"ip"` (tour bookings) or `"provider"`
 * @returns `true` when the caller is over the limit
 */
export async function isRateLimited(ip: string, bucket: string, max: number, windowSeconds: number): Promise<boolean> {
  // Hash so a crafted header cannot inject into, or collide with, other Redis keys.
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
  const count = await redis.eval(INCR_WITH_EXPIRY, {
    keys: [`rate_limit:${bucket}:${ipHash}`],
    arguments: [String(windowSeconds)],
  });
  return typeof count === "number" && count > max;
}
