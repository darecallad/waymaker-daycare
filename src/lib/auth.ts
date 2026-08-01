/**
 * Passwordless authentication + authorisation for the daycare admin dashboard.
 *
 * There is no user table. Access is limited to a fixed allowlist of administrator
 * addresses ({@link ADMIN_EMAILS}); nobody else can sign in, regardless of what is stored
 * in `partners.ts`. Login is a 6-digit one-time code delivered with the existing
 * nodemailer transports.
 *
 * Redis keys used:
 * - `auth:otp:{emailHash}`      hashed one-time code + attempt counter (10 min TTL)
 * - `auth:otp:rate:{emailHash}` code request throttle (15 min TTL)
 * - `auth:session:{tokenHash}`  active session (7 day TTL)
 *
 * @module auth
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import redis from "@/lib/redis";
import { partners } from "@/data/partners";
import { maskEmail } from "@/lib/utils-date";
import type { AdminSession, UserRole } from "@/lib/types";

export const SESSION_COOKIE = "wm_admin_session";

/**
 * The only addresses allowed to sign in and edit tour settings.
 *
 * Override with the `ADMIN_EMAILS` environment variable (comma separated) when the list
 * changes, so a redeploy is not required to add or remove an administrator.
 */
export const ADMIN_EMAILS = [
  "daycare@waymakerbiz.com",
  "darecallad0000@gmail.com",
  "center.admin@sunnychildcare.com",
  "lavi810102@gmail.com",
];

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const OTP_MAX_ATTEMPTS = 5;
const OTP_REQUEST_WINDOW = 15 * 60; // 15 minutes
const OTP_REQUEST_MAX = 5;
/** Guesses allowed per IP per window, on top of the per-code attempt cap. */
const OTP_VERIFY_WINDOW = 15 * 60;
const OTP_VERIFY_MAX = 20;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalise an email for comparison and key derivation.
 *
 * @param email - Raw email input
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Basic shape check for an email address.
 *
 * @param email - Raw email input
 */
export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && EMAIL_PATTERN.test(email.trim());
}

const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

/**
 * The administrator allowlist, overridable through `ADMIN_EMAILS`.
 *
 * @returns Normalised addresses allowed to sign in
 */
export function getAdminEmails(): string[] {
  const configured = process.env.ADMIN_EMAILS;
  const source = configured ? configured.split(",") : ADMIN_EMAILS;

  return source.map((entry) => normalizeEmail(entry)).filter(Boolean);
}

/**
 * Addresses treated as Super Admin. They keep the highest view/override rights; the
 * remaining allowlisted addresses are regular administrators.
 */
export function getSuperAdminEmails(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS || "daycare@waymakerbiz.com")
    .split(",")
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);
}

/**
 * Resolve what an email address is allowed to manage.
 *
 * Only allowlisted administrators get access, and they can manage every daycare. An
 * address that merely appears as an `ownerEmail` in `partners.ts` cannot sign in.
 *
 * @param email - Raw email input
 * @returns Role + manageable slugs, or null when the address is not an administrator
 */
export function resolveAccess(email: string): { role: UserRole; slugs: string[] } | null {
  const normalized = normalizeEmail(email);

  if (!getAdminEmails().includes(normalized)) {
    return null;
  }

  return {
    role: getSuperAdminEmails().includes(normalized) ? "super_admin" : "admin",
    slugs: partners.map((p) => p.slug),
  };
}

/**
 * Atomically consume one unit of a fixed-window rate limit.
 *
 * Uses a single Lua script so concurrent requests cannot all read the same counter and
 * bypass the cap.
 *
 * @param key - Redis key holding the counter
 * @param max - Requests allowed per window
 * @param windowSeconds - Window length
 * @returns True when the caller is still within the limit
 */
export async function consumeRateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  const script = `
    local current = redis.call("INCR", KEYS[1])
    if tonumber(current) == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end
    return current
  `;

  try {
    const used = await redis.eval(script, {
      keys: [key],
      arguments: [windowSeconds.toString()],
    });

    return typeof used === "number" ? used <= max : true;
  } catch (error) {
    // Fail open: Redis being down must not lock every administrator out
    console.error("❌ Rate limit check failed:", error);
    return true;
  }
}

/**
 * Whether the email is currently allowed to request another login code.
 *
 * Deliberately separate from {@link issueLoginCode} and called for *every* address, including
 * ones that are not on the allowlist, so the throttle cannot be used to tell them apart.
 *
 * @param email - Address requesting a code
 */
export async function canRequestLoginCode(email: string): Promise<boolean> {
  return consumeRateLimit(
    `auth:otp:rate:${hash(normalizeEmail(email))}`,
    OTP_REQUEST_MAX,
    OTP_REQUEST_WINDOW
  );
}

/**
 * Whether this client may make another code guess.
 *
 * Backs up the per-code attempt cap: without it an attacker could request a fresh code every
 * time the previous one locked out, and keep guessing indefinitely.
 *
 * @param ip - Client IP, or a fallback identifier
 */
export async function canAttemptLogin(ip: string): Promise<boolean> {
  return consumeRateLimit(`auth:verify:rate:${hash(ip)}`, OTP_VERIFY_MAX, OTP_VERIFY_WINDOW);
}

/**
 * Create and store a one-time login code.
 *
 * The code is stored as a Redis hash so the attempt counter can be incremented atomically
 * during verification.
 *
 * @param email - Recipient address (already validated and rate limited)
 * @returns The plaintext code to email
 */
export async function issueLoginCode(email: string): Promise<string> {
  const emailHash = hash(normalizeEmail(email));
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  const otpKey = `auth:otp:${emailHash}`;

  const multi = redis.multi();
  multi.del(otpKey);
  multi.hSet(otpKey, { codeHash: hash(code), attempts: "0" });
  multi.expire(otpKey, OTP_TTL_SECONDS);
  await multi.exec();

  return code;
}

/**
 * Remove a pending login code.
 *
 * Used when the code could not actually be delivered, so a stale code is not left usable.
 *
 * @param email - Address the code was issued for
 */
export async function discardLoginCode(email: string): Promise<void> {
  await redis.del(`auth:otp:${hash(normalizeEmail(email))}`);
}

/**
 * Verify a submitted code and, on success, create a session.
 *
 * @param email - Address the code was sent to
 * @param code - Submitted 6-digit code
 * @returns The session token plus session payload, or an error reason
 */
export async function verifyLoginCode(
  email: string,
  code: string
): Promise<{ ok: true; token: string; session: AdminSession } | { ok: false; reason: string }> {
  const normalized = normalizeEmail(email);
  const emailHash = hash(normalized);
  const otpKey = `auth:otp:${emailHash}`;

  // The whole check-compare-increment must be one atomic step, otherwise concurrent guesses
  // all read the same attempt counter and the 5-attempt cap costs an attacker nothing.
  const script = `
    if redis.call("EXISTS", KEYS[1]) == 0 then
      return "expired"
    end
    local attempts = tonumber(redis.call("HGET", KEYS[1], "attempts")) or 0
    if attempts >= tonumber(ARGV[2]) then
      redis.call("DEL", KEYS[1])
      return "locked"
    end
    if redis.call("HGET", KEYS[1], "codeHash") == ARGV[1] then
      redis.call("DEL", KEYS[1])
      return "ok"
    end
    redis.call("HINCRBY", KEYS[1], "attempts", 1)
    return "wrong"
  `;

  // Comparing SHA-256 digests, so a non-constant-time compare inside Redis reveals nothing
  // about the code itself.
  const outcome = await redis.eval(script, {
    keys: [otpKey],
    arguments: [hash(String(code).trim()), String(OTP_MAX_ATTEMPTS)],
  });

  if (outcome === "expired") {
    return { ok: false, reason: "This code has expired. Please request a new one." };
  }

  if (outcome === "locked") {
    return { ok: false, reason: "Too many incorrect attempts. Please request a new code." };
  }

  if (outcome !== "ok") {
    return { ok: false, reason: "Incorrect code. Please try again." };
  }

  const access = resolveAccess(normalized);
  if (!access) {
    return { ok: false, reason: "This account is no longer authorized." };
  }

  await redis.del(`auth:otp:rate:${emailHash}`);

  const token = crypto.randomBytes(32).toString("hex");
  const session: AdminSession = {
    email: normalized,
    role: access.role,
    slugs: access.slugs,
    createdAt: new Date().toISOString(),
  };

  await redis.set(`auth:session:${hash(token)}`, JSON.stringify(session), {
    EX: SESSION_TTL_SECONDS,
  });

  return { ok: true, token, session };
}

/**
 * Load the session attached to a request.
 *
 * Access is re-resolved from `partners.ts` on every request so that removing an owner from
 * the data file immediately revokes their existing sessions.
 *
 * @param request - Incoming request
 * @returns The session, or null when unauthenticated/revoked
 */
export async function getSession(request: NextRequest): Promise<AdminSession | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const raw = await redis.get(`auth:session:${hash(token)}`);
    if (!raw) return null;

    const session = JSON.parse(raw) as AdminSession;
    const access = resolveAccess(session.email);
    if (!access) return null;

    return { ...session, role: access.role, slugs: access.slugs };
  } catch (error) {
    console.error("❌ Failed to read session:", error);
    return null;
  }
}

/**
 * Destroy a session.
 *
 * @param token - Raw session token from the cookie
 */
export async function destroySession(token: string): Promise<void> {
  await redis.del(`auth:session:${hash(token)}`);
}

/**
 * Attach (or clear) the session cookie on a response.
 *
 * @param response - Response to mutate
 * @param token - Session token, or null to clear the cookie
 */
export function setSessionCookie(response: NextResponse, token: string | null): NextResponse {
  if (token) {
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
  } else {
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}

/**
 * Guard for admin API routes.
 *
 * @param request - Incoming request
 * @param slug - Optional daycare the caller must be allowed to manage
 * @returns The session, or a ready-to-return 401/403 response
 */
export async function requireAccess(
  request: NextRequest,
  slug?: string
): Promise<{ session: AdminSession; error: null } | { session: null; error: NextResponse }> {
  const session = await getSession(request);

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  if (slug && !session.slugs.includes(slug)) {
    // The full address stays in the audit trail; the runtime log keeps the masked form so
    // administrators are treated like the parents whose addresses are already masked here.
    console.warn(`🚫 ${maskEmail(session.email)} attempted to manage ${slug} without permission`);
    return {
      session: null,
      error: NextResponse.json(
        { error: "You do not have permission to manage this daycare." },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}
