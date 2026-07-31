import { NextRequest, NextResponse } from "next/server";
import { requireAccess } from "@/lib/auth";
import { recordAuditEvent } from "@/lib/audit";
import { cancelBooking, getBookingsForDaycare, notifyParentOfClosure } from "@/lib/bookings";
import {
  TourValidationError,
  getTourSettings,
  updateBlockedDates,
  validateBlockedDates,
} from "@/lib/tour-schedule";
import { maskEmail } from "@/lib/utils-date";

/**
 * Close one or more dates for tours.
 *
 * Body:
 * - `dates`          — `["2026-04-03", ...]`
 * - `force`          — proceed even though parents already booked those dates
 * - `cancelConflicts`— cancel those bookings and email the parents (requires `force`)
 * - `reason`         — optional note included in the parent notification
 *
 * Without `force`, existing bookings return **409** together with the affected list so the
 * dashboard can show the owner exactly who would be affected.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { session, error } = await requireAccess(request, slug);
  if (error) return error;

  try {
    const body = await request.json();
    const { dates, force = false, cancelConflicts = false, reason } = body ?? {};

    const validated = validateBlockedDates(dates);

    if (validated.length === 0) {
      return NextResponse.json({ error: "Select at least one date to block." }, { status: 400 });
    }

    const current = await getTourSettings(slug);
    if (!current) {
      return NextResponse.json({ error: "Daycare not found." }, { status: 404 });
    }

    const conflicts = await getBookingsForDaycare(slug, { dates: validated });

    if (conflicts.length > 0 && !force) {
      await recordAuditEvent({
        actor: session.email,
        actorRole: session.role,
        action: "dates.blocked",
        slug,
        outcome: "denied",
        summary: `Tried to close ${validated.join(", ")} but stopped: ${conflicts.length} booking(s) already exist.`,
        affectedBookings: conflicts.map((booking) => booking.id),
        request,
      });

      return NextResponse.json(
        {
          error: "CONFLICTING_BOOKINGS",
          message: `${conflicts.length} parent booking(s) already exist on the selected date(s).`,
          conflicts: conflicts.map((booking) => ({
            id: booking.id,
            name: booking.name,
            email: maskEmail(booking.email),
            date: booking.date,
            time: booking.time,
          })),
        },
        { status: 409 }
      );
    }

    const settings = await updateBlockedDates(slug, session.email, (stored) =>
      [...new Set([...stored, ...validated])].sort()
    );

    const cancelled: string[] = [];
    const notifyFailures: string[] = [];
    const failed: string[] = [];

    if (conflicts.length > 0 && force && cancelConflicts) {
      for (const booking of conflicts) {
        try {
          const result = await cancelBooking(booking.id, {
            cancelledBy: session.email,
            reason: reason || "The daycare closed this date for tours.",
          });

          if (result.status === "cancelled" && result.booking) {
            const notified = await notifyParentOfClosure(result.booking, reason);
            if (!notified) notifyFailures.push(booking.id);
            cancelled.push(booking.id);
          }
        } catch (cancelError) {
          console.error(`❌ Failed to cancel booking ${booking.id} while blocking date:`, cancelError);
          failed.push(booking.id);
        }
      }
    }

    console.log(`🚫 ${session.email} blocked ${validated.join(", ")} for ${slug}`);

    await recordAuditEvent({
      actor: session.email,
      actorRole: session.role,
      action: "dates.blocked",
      slug,
      summary:
        `Closed ${validated.length} date(s): ${validated.join(", ")}` +
        (cancelled.length ? ` · cancelled ${cancelled.length} booking(s)` : "") +
        (reason ? ` · reason: ${reason}` : ""),
      before: current.ownerBlockedDates.join(", ") || "(none)",
      after: settings.ownerBlockedDates.join(", ") || "(none)",
      affectedBookings: cancelled,
      request,
    });

    return NextResponse.json({
      success: true,
      settings,
      blocked: validated,
      cancelledBookings: cancelled,
      // Cancelled in Redis but the parent could not be emailed — needs a manual phone call
      notificationFailures: notifyFailures,
      failedCancellations: failed,
      retainedConflicts: conflicts
        .filter((booking) => !cancelled.includes(booking.id))
        .map((booking) => booking.id),
    });
  } catch (err) {
    if (err instanceof TourValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    console.error(`❌ Failed to block dates for ${slug}:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Re-open previously blocked dates.
 *
 * Only dates the owner added can be removed; dates baked into `partners.ts` require a code
 * change by the Super Admin and are reported back as `unremovable`.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { session, error } = await requireAccess(request, slug);
  if (error) return error;

  try {
    const body = await request.json();
    const validated = validateBlockedDates(body?.dates, { allowPast: true });

    if (validated.length === 0) {
      return NextResponse.json({ error: "Select at least one date to unblock." }, { status: 400 });
    }

    const current = await getTourSettings(slug);
    if (!current) {
      return NextResponse.json({ error: "Daycare not found." }, { status: 404 });
    }

    const removable = validated.filter((date) => current.ownerBlockedDates.includes(date));
    const unremovable = validated.filter((date) => !current.ownerBlockedDates.includes(date));

    if (removable.length === 0) {
      return NextResponse.json(
        {
          error: "These dates are not owner-managed closures and cannot be re-opened here.",
          unremovable,
        },
        { status: 409 }
      );
    }

    const settings = await updateBlockedDates(slug, session.email, (stored) =>
      stored.filter((date) => !removable.includes(date))
    );

    console.log(`✅ ${session.email} re-opened ${removable.join(", ")} for ${slug}`);

    await recordAuditEvent({
      actor: session.email,
      actorRole: session.role,
      action: "dates.unblocked",
      slug,
      summary: `Re-opened ${removable.length} date(s): ${removable.join(", ")}`,
      before: current.ownerBlockedDates.join(", ") || "(none)",
      after: settings.ownerBlockedDates.join(", ") || "(none)",
      request,
    });

    return NextResponse.json({ success: true, settings, unblocked: removable, unremovable });
  } catch (err) {
    if (err instanceof TourValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    console.error(`❌ Failed to unblock dates for ${slug}:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
