import { NextRequest, NextResponse } from "next/server";
import { requireAccess } from "@/lib/auth";
import { recordAuditEvent } from "@/lib/audit";
import { cancelBooking, notifyParentOfClosure } from "@/lib/bookings";
import {
  TourValidationError,
  findConflictingBookings,
  formatTourHours,
  getTourSettings,
  saveTourSettings,
  validateWeeklySchedule,
} from "@/lib/tour-schedule";
import { maskEmail } from "@/lib/utils-date";

/**
 * Read the merged tour settings for one daycare.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { error } = await requireAccess(request, slug);
  if (error) return error;

  try {
    const settings = await getTourSettings(slug);
    if (!settings) {
      return NextResponse.json({ error: "Daycare not found." }, { status: 404 });
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error(`❌ Failed to read schedule for ${slug}:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Replace the weekly tour hours for one daycare.
 *
 * Body:
 * - `weeklySchedule` — `[{ day: 0-6, time: "6:00 PM" }]`
 * - `force`          — proceed even though existing bookings fall outside the new hours
 * - `cancelConflicts`— cancel those bookings and email the parents (requires `force`)
 *
 * Without `force`, a conflict returns **409** with the affected bookings so the dashboard
 * can ask the owner what to do instead of silently dropping a parent's tour.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { session, error } = await requireAccess(request, slug);
  if (error) return error;

  try {
    const body = await request.json();
    const { weeklySchedule, force = false, cancelConflicts = false, reason } = body ?? {};

    const validated = validateWeeklySchedule(weeklySchedule);

    if (validated.length === 0) {
      return NextResponse.json(
        { error: "Select at least one day, otherwise no parent will be able to book a tour." },
        { status: 400 }
      );
    }

    const current = await getTourSettings(slug);
    if (!current) {
      return NextResponse.json({ error: "Daycare not found." }, { status: 404 });
    }

    const tourHours = formatTourHours(validated);
    const conflicts = await findConflictingBookings(slug, {
      tourHours,
      blockedDates: current.blockedDates,
    });

    if (conflicts.length > 0 && !force) {
      await recordAuditEvent({
        actor: session.email,
        actorRole: session.role,
        action: "schedule.updated",
        slug,
        outcome: "denied",
        summary: `Tried to set tour hours to "${tourHours}" but stopped: ${conflicts.length} booking(s) fall outside them.`,
        before: current.tourHours,
        after: tourHours,
        affectedBookings: conflicts.map((booking) => booking.id),
        request,
      });

      return NextResponse.json(
        {
          error: "CONFLICTING_BOOKINGS",
          message: `${conflicts.length} existing booking(s) fall outside the new tour hours.`,
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

    const settings = await saveTourSettings(slug, { tourHours }, session.email);

    const cancelled: string[] = [];
    const failed: string[] = [];

    if (conflicts.length > 0 && force && cancelConflicts) {
      for (const booking of conflicts) {
        try {
          const result = await cancelBooking(booking.id, {
            cancelledBy: session.email,
            reason: reason || "The daycare updated its tour hours.",
          });

          if (result.status === "cancelled" && result.booking) {
            await notifyParentOfClosure(result.booking, reason);
            cancelled.push(booking.id);
          }
        } catch (cancelError) {
          console.error(`❌ Failed to cancel conflicting booking ${booking.id}:`, cancelError);
          failed.push(booking.id);
        }
      }
    }

    console.log(`🗓️ ${session.email} updated tour hours for ${slug}: "${tourHours}"`);

    await recordAuditEvent({
      actor: session.email,
      actorRole: session.role,
      action: "schedule.updated",
      slug,
      summary:
        `Changed tour hours to "${tourHours}"` +
        (cancelled.length ? ` · cancelled ${cancelled.length} booking(s)` : ""),
      before: current.tourHours,
      after: tourHours,
      affectedBookings: cancelled,
      request,
    });

    return NextResponse.json({
      success: true,
      settings,
      cancelledBookings: cancelled,
      failedCancellations: failed,
      // Kept bookings the owner chose not to cancel — they still need a manual follow-up
      retainedConflicts: cancelConflicts
        ? conflicts.filter((b) => !cancelled.includes(b.id)).map((b) => b.id)
        : conflicts.map((b) => b.id),
    });
  } catch (err) {
    if (err instanceof TourValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    console.error(`❌ Failed to update schedule for ${slug}:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
