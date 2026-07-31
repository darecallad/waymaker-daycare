import crypto from "crypto";
import redis from "@/lib/redis";
import { partners } from "@/data/partners";
import type { AuditAction, AuditEntry, UserRole } from "@/lib/types";

/**
 * Append-only audit trail for administrator actions.
 *
 * Every change made from the dashboard (tour hours, closed dates, cancelled bookings) plus
 * every login attempt is recorded with the acting email, so an unexpected change can always
 * be traced back to a person. There is deliberately no API that edits or deletes entries.
 *
 * Storage: a global Redis list plus one list per daycare, both newest-first and capped so the
 * log cannot grow without bound. Entries are also mirrored to `console.log` so they show up in
 * the Vercel runtime logs even if Redis is ever wiped.
 */

const GLOBAL_KEY = "audit:tour";
const daycareKey = (slug: string) => `audit:tour:daycare:${slug}`;

/** Roughly a few years of activity for this workload. */
const GLOBAL_MAX_ENTRIES = 10_000;
const DAYCARE_MAX_ENTRIES = 2_000;

/** Hard cap so one huge request cannot bloat the log. */
const MAX_FIELD_LENGTH = 500;

const truncate = (value: string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return value.length > MAX_FIELD_LENGTH ? `${value.slice(0, MAX_FIELD_LENGTH)}…` : value;
};

/**
 * Best-effort client fingerprint.
 *
 * Vercel puts the real client IP in `x-forwarded-for`; the first entry is the caller.
 */
function describeRequest(request?: Request): { ip?: string; userAgent?: string } {
  if (!request) return {};

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined;

  return { ip, userAgent: truncate(request.headers.get("user-agent") ?? undefined) };
}

export interface AuditInput {
  actor: string;
  actorRole?: UserRole | "unknown";
  action: AuditAction;
  slug?: string;
  outcome?: AuditEntry["outcome"];
  summary: string;
  before?: string;
  after?: string;
  affectedBookings?: string[];
  request?: Request;
}

/**
 * Write one entry to the audit trail.
 *
 * Never throws: losing an audit line must not roll back or break the action the
 * administrator actually asked for. Failures are reported loudly to the server log instead.
 *
 * @param input - Details of the action being recorded
 * @returns The stored entry, or null when it could not be persisted
 */
export async function recordAuditEvent(input: AuditInput): Promise<AuditEntry | null> {
  const { ip, userAgent } = describeRequest(input.request);

  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actor: input.actor,
    actorRole: input.actorRole ?? "unknown",
    action: input.action,
    outcome: input.outcome ?? "success",
    summary: truncate(input.summary) ?? "",
    ...(input.slug ? { slug: input.slug } : {}),
    ...(input.slug ? { daycareName: partners.find((p) => p.slug === input.slug)?.name } : {}),
    ...(input.before !== undefined ? { before: truncate(input.before) } : {}),
    ...(input.after !== undefined ? { after: truncate(input.after) } : {}),
    ...(input.affectedBookings?.length ? { affectedBookings: input.affectedBookings } : {}),
    ...(ip ? { ip } : {}),
    ...(userAgent ? { userAgent } : {}),
  };

  // Mirrored to the platform log so the trail survives even a full Redis loss
  console.log(
    `📋 AUDIT ${entry.at} ${entry.actor} ${entry.action} ${entry.slug ?? "-"} ${entry.outcome}: ${entry.summary}`
  );

  try {
    const payload = JSON.stringify(entry);
    const pipeline = redis.multi();

    pipeline.lPush(GLOBAL_KEY, payload);
    pipeline.lTrim(GLOBAL_KEY, 0, GLOBAL_MAX_ENTRIES - 1);

    if (entry.slug) {
      pipeline.lPush(daycareKey(entry.slug), payload);
      pipeline.lTrim(daycareKey(entry.slug), 0, DAYCARE_MAX_ENTRIES - 1);
    }

    await pipeline.exec();
    return entry;
  } catch (error) {
    console.error("❌ Failed to persist audit entry:", error, entry);
    return null;
  }
}

export interface AuditQuery {
  /** Limit to one daycare. */
  slug?: string;
  /** Limit to one acting email (case-insensitive). */
  actor?: string;
  /** Limit to one action type. */
  action?: AuditAction;
  /** Inclusive lower bound, `YYYY-MM-DD`. */
  from?: string;
  /** Inclusive upper bound, `YYYY-MM-DD`. */
  to?: string;
  /** Max entries to return (default 100, max 500). */
  limit?: number;
  /** How many matching entries to skip, for paging. */
  offset?: number;
}

/**
 * Read the audit trail, newest first.
 *
 * @param query - Optional filters
 * @returns Matching entries plus the total number of matches
 */
export async function getAuditLog(
  query: AuditQuery = {}
): Promise<{ entries: AuditEntry[]; total: number }> {
  const limit = Math.min(Math.max(query.limit ?? 100, 1), 500);
  const offset = Math.max(query.offset ?? 0, 0);
  const key = query.slug ? daycareKey(query.slug) : GLOBAL_KEY;

  let raw: string[];
  try {
    raw = await redis.lRange(key, 0, -1);
  } catch (error) {
    console.error("❌ Failed to read audit log:", error);
    return { entries: [], total: 0 };
  }

  const actor = query.actor?.trim().toLowerCase();

  const matches = raw
    .map((item) => {
      try {
        return JSON.parse(item) as AuditEntry;
      } catch {
        // A corrupt line must not hide the rest of the trail
        return null;
      }
    })
    .filter((entry): entry is AuditEntry => entry !== null)
    .filter((entry) => {
      if (actor && entry.actor.toLowerCase() !== actor) return false;
      if (query.action && entry.action !== query.action) return false;
      // `at` is ISO 8601, so a plain string compare against `YYYY-MM-DD` works
      if (query.from && entry.at.slice(0, 10) < query.from) return false;
      if (query.to && entry.at.slice(0, 10) > query.to) return false;
      return true;
    });

  return { entries: matches.slice(offset, offset + limit), total: matches.length };
}
