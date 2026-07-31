/**
 * Booking read/cancel helpers shared by the parent-facing cancellation endpoint and the
 * daycare admin dashboard.
 *
 * Redis layout (unchanged from the original booking flow):
 * - `booking:{id}`                              JSON booking record
 * - `bookings:date:{date}`                      Set of booking ids for a day
 * - `daycare:{slug}:bookings`                   Set of booking ids for a daycare
 * - `daycare:{slug}:date:{date}:count`          Daily capacity counter
 * - `booking:email:{emailHash}:date:{date}`     Duplicate-booking guard
 *
 * @module bookings
 */

import redis, { isWatchConflict } from "@/lib/redis";
import crypto from "crypto";
import { getTransporter, getSender } from "@/lib/email";
import { maskEmail, getTimeZoneName } from "@/lib/utils-date";
import { partners } from "@/data/partners";
import type { Booking } from "@/lib/types";

const MAX_RETRIES = 3;

/**
 * Key guarding duplicate bookings for the same parent on the same day.
 *
 * @param email - Parent email
 * @param date - Booking date
 */
function emailDateKey(email: string, date: string): string {
  const emailHash = crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return `booking:email:${emailHash}:date:${date}`;
}

/**
 * Load a single booking.
 *
 * @param bookingId - Booking id
 * @returns The booking, or null when it no longer exists
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  const raw = await redis.get(`booking:${bookingId}`);
  return raw ? (JSON.parse(raw) as Booking) : null;
}

/**
 * List every stored booking for a daycare, optionally restricted to a set of dates.
 *
 * Stale ids (already cleaned up by the nightly cron) are skipped rather than throwing.
 *
 * @param slug - Daycare slug
 * @param options.dates - Only return bookings falling on these dates
 * @param options.from - Only return bookings on/after this YYYY-MM-DD date
 * @returns Bookings sorted by date then time
 */
export async function getBookingsForDaycare(
  slug: string,
  options: { dates?: string[]; from?: string } = {}
): Promise<Booking[]> {
  const ids = await redis.sMembers(`daycare:${slug}:bookings`);
  if (!ids || ids.length === 0) return [];

  const dateFilter = options.dates ? new Set(options.dates) : null;
  const bookings: Booking[] = [];

  for (const id of ids) {
    const booking = await getBooking(id);
    if (!booking || booking.status === "cancelled") continue;
    if (dateFilter && !dateFilter.has(booking.date)) continue;
    if (options.from && booking.date < options.from) continue;
    bookings.push(booking);
  }

  return bookings.sort((a, b) =>
    a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
  );
}

/**
 * Cancel a booking and release its capacity, using the same WATCH/MULTI protection as the
 * public cancellation endpoint.
 *
 * @param bookingId - Booking id
 * @param options.cancelledBy - Who triggered the cancellation (email or "parent")
 * @param options.reason - Human readable reason surfaced in notification emails
 * @returns Outcome describing whether the booking was cancelled, missing or already gone
 */
export async function cancelBooking(
  bookingId: string,
  options: { cancelledBy: string; reason?: string } = { cancelledBy: "parent" }
): Promise<{ status: "cancelled" | "not_found" | "already_cancelled"; booking?: Booking }> {
  const bookingKey = `booking:${bookingId}`;
  const raw = await redis.get(bookingKey);

  if (!raw) return { status: "not_found" };

  const booking = JSON.parse(raw) as Booking;
  if (booking.status === "cancelled") {
    return { status: "already_cancelled", booking };
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const client = redis.duplicate();

    try {
      await client.connect();

      const countKey = `daycare:${booking.daycareSlug}:date:${booking.date}:count`;

      // Watch the booking key to ensure atomic deletion
      await client.watch(bookingKey);

      // Double-check booking still exists
      const currentBooking = await client.get(bookingKey);
      if (!currentBooking) {
        await client.quit();
        return { status: "not_found" };
      }

      const multi = client.multi();
      multi.decr(countKey);
      multi.sRem(`bookings:date:${booking.date}`, bookingId);
      multi.sRem(`daycare:${booking.daycareSlug}:bookings`, bookingId);
      multi.del(bookingKey);
      if (typeof booking.email === "string") {
        multi.del(emailDateKey(booking.email, booking.date));
      }

      const result = await multi.exec();

      if (result) {
        console.log(`✅ Booking ${bookingId} cancelled successfully by ${options.cancelledBy}`);
        await client.quit();
        return {
          status: "cancelled",
          booking: {
            ...booking,
            status: "cancelled",
            cancelledAt: new Date().toISOString(),
            cancelledBy: options.cancelledBy,
            cancellationReason: options.reason,
          },
        };
      }

      // Transaction failed, retry
      console.warn(`⚠️ Cancellation retry ${attempt + 1}/${MAX_RETRIES}`);
      await client.quit();
      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    } catch (error) {
      // node-redis throws when a watched key changed mid-transaction; that is a normal
      // concurrency outcome, not a failure, so retry it quietly with a fresh read.
      if (isWatchConflict(error)) {
        console.warn(`⚠️ Cancellation retry ${attempt + 1}/${MAX_RETRIES} (concurrent change)`);
        if (client.isOpen) await client.quit();
        await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
        continue;
      }

      console.error(`❌ Error cancelling booking (attempt ${attempt + 1}):`, error);
      if (client.isOpen) await client.quit();

      if (attempt === MAX_RETRIES - 1) {
        throw error;
      }
    }
  }

  throw new Error("Failed to cancel booking after multiple attempts.");
}

/**
 * Email recipients for daycare-side notifications (Waymaker inbox + the owner).
 *
 * @param slug - Daycare slug
 */
export function getDaycareNotificationRecipients(slug?: string): string {
  let targetEmail = "daycare@waymakerbiz.com";
  if (slug) {
    const partner = partners.find((p) => p.slug === slug);
    if (partner?.ownerEmail) {
      targetEmail = `${targetEmail}, ${partner.ownerEmail}`;
    }
  }
  return targetEmail;
}

/**
 * Tell the daycare that a parent cancelled a tour.
 *
 * Email failures are logged but never bubble up: the cancellation itself already succeeded.
 *
 * @param booking - The cancelled booking
 */
export async function notifyDaycareOfCancellation(booking: Booking): Promise<void> {
  try {
    const transporter = getTransporter("daycare");
    const sender = getSender("daycare");
    const timeZone = getTimeZoneName(booking.date);

    await transporter.sendMail({
      from: sender,
      to: getDaycareNotificationRecipients(booking.daycareSlug),
      subject: `Booking Cancelled: ${booking.name} - ${booking.date}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2 style="color: #d9534f;">Booking Cancelled</h2>
          <p>The following tour has been cancelled by the parent:</p>
          <p><strong>Parent:</strong> ${booking.name}</p>
          <p><strong>Daycare:</strong> ${booking.daycareName}</p>
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time:</strong> ${booking.time} ${timeZone}</p>
        </div>
      `,
    });
    console.log(`📧 Cancellation notification sent to daycare for ${maskEmail(booking.email)}`);
  } catch (emailError) {
    console.error(`❌ Failed to send cancellation email:`, emailError);
  }
}

/**
 * Tell a parent that the daycare closed their tour date.
 *
 * @param booking - The cancelled booking
 * @param reason - Optional note from the daycare
 */
export async function notifyParentOfClosure(booking: Booking, reason?: string): Promise<boolean> {
  try {
    const transporter = getTransporter("daycare");
    const sender = getSender("daycare");
    const timeZone = getTimeZoneName(booking.date);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://daycare.waymakerbiz.com";

    await transporter.sendMail({
      from: sender,
      to: booking.email,
      subject: `Tour Cancelled: ${booking.daycareName} on ${booking.date}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d9534f;">Your Tour Has Been Cancelled</h2>
          <p>Dear ${booking.name},</p>
          <p>We are sorry — <strong>${booking.daycareName}</strong> is no longer able to host tours on the date below and your booking has been cancelled.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Date:</strong> ${booking.date}</p>
            <p style="margin: 0;"><strong>Time:</strong> ${booking.time} ${timeZone}</p>
          </div>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p>Please book another date at your convenience — we would still love to meet you.</p>
          <div style="margin: 30px 0;">
            <a href="${baseUrl}/book-tour?partner=${booking.daycareSlug}" style="display: inline-block; background: #0F3B4C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Choose a New Date</a>
          </div>
        </div>
      `,
    });
    console.log(`📧 Closure notice sent to ${maskEmail(booking.email)} for ${booking.date}`);
    return true;
  } catch (emailError) {
    console.error(`❌ Failed to notify parent of closure:`, emailError);
    return false;
  }
}
