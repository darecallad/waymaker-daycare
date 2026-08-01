import { NextRequest, NextResponse } from "next/server";
import { requireAccess } from "@/lib/auth";
import { getAuditLog } from "@/lib/audit";
import { DATE_PATTERN } from "@/lib/tour-slots";
import type { AuditAction } from "@/lib/types";

const ACTIONS: AuditAction[] = [
  "login.code_requested",
  "login.succeeded",
  "login.failed",
  "logout",
  "schedule.updated",
  "dates.blocked",
  "dates.unblocked",
  "booking.cancelled",
];

/**
 * Read the administrator audit trail, newest first.
 *
 * Query parameters (all optional):
 * - `slug`   — limit to one daycare
 * - `actor`  — limit to one administrator email
 * - `action` — limit to one action type
 * - `from` / `to` — inclusive `YYYY-MM-DD` bounds
 * - `limit` / `offset` — paging (limit defaults to 100, max 500)
 *
 * The trail is read-only: there is no endpoint that edits or deletes entries.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || undefined;

  // Passing a slug also checks the caller may manage that location
  const { session, error } = await requireAccess(request, slug);
  if (error) return error;

  // Without a slug the trail spans every location, including other administrators' activity,
  // so that view stays with the Super Admin even if an account is later scoped to one daycare.
  if (!slug && session.role !== "super_admin") {
    return NextResponse.json(
      { error: "Select a location to view its activity log." },
      { status: 403 }
    );
  }

  try {
    const action = searchParams.get("action") || undefined;
    if (action && !ACTIONS.includes(action as AuditAction)) {
      return NextResponse.json({ error: "Unknown action filter." }, { status: 400 });
    }

    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    for (const [label, value] of [["from", from], ["to", to]] as const) {
      if (value && !DATE_PATTERN.test(value)) {
        return NextResponse.json(
          { error: `Invalid \`${label}\` date. Use YYYY-MM-DD.` },
          { status: 400 }
        );
      }
    }

    const parseNumber = (value: string | null) => {
      if (!value) return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const { entries, total } = await getAuditLog({
      slug,
      actor: searchParams.get("actor") || undefined,
      action: action as AuditAction | undefined,
      from,
      to,
      limit: parseNumber(searchParams.get("limit")),
      offset: parseNumber(searchParams.get("offset")),
    });

    return NextResponse.json({ entries, total, role: session.role });
  } catch (err) {
    console.error("❌ Failed to read audit log:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
