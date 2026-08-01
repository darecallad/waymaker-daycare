/**
 * Server-side tour schedule storage.
 *
 * The static `partners.ts` file is the source of truth for daycare identity, but Vercel's
 * filesystem is read-only at runtime, so any owner-authored change is stored in Redis as an
 * *override layer* (`daycare:{slug}:schedule`) and merged on read.
 *
 * The pure rules (parsing, validation, slot generation) live in {@link module:tour-slots}
 * and are re-exported here for convenience.
 *
 * @module tour-schedule
 */

import redis, { isWatchConflict } from "@/lib/redis";
import { partners } from "@/data/partners";
import { getBookingsForDaycare } from "@/lib/bookings";
import { getPSTDate } from "@/lib/utils-date";
import {
  BOOKING_WINDOW_DAYS,
  DATE_PATTERN,
  generateAvailableSlots,
  parseTourHours,
} from "@/lib/tour-slots";
import type { Booking, TourScheduleOverride, TourSettings } from "@/lib/types";

export {
  BOOKING_WINDOW_DAYS,
  DAY_NAMES,
  TOUR_START_DATE,
  TourValidationError,
  US_HOLIDAYS,
  formatTourHours,
  generateAvailableSlots,
  isValidTimeRange,
  parseTourHours,
  validateBlockedDates,
  validateWeeklySchedule,
} from "@/lib/tour-slots";

/**
 * Redis key holding the owner-authored override for a daycare.
 *
 * @param slug - Daycare slug
 */
export const scheduleKey = (slug: string) => `daycare:${slug}:schedule`;

/** Attempts before a concurrent schedule save gives up. */
const SAVE_RETRIES = 3;

/**
 * Read the merged tour settings (static partner data + Redis override) for a daycare.
 *
 * Falls back to the static definition when Redis is unavailable so that the public booking
 * page never breaks because of an infrastructure hiccup.
 *
 * @param slug - Daycare slug
 * @returns Merged settings, or null when the slug is unknown
 */
export async function getTourSettings(slug: string): Promise<TourSettings | null> {
  const partner = partners.find((p) => p.slug === slug);
  if (!partner) return null;

  let override: TourScheduleOverride | null = null;

  try {
    const raw = await redis.get(scheduleKey(slug));
    if (raw) override = JSON.parse(raw) as TourScheduleOverride;
  } catch (error) {
    console.error(`❌ Failed to load schedule override for ${slug}:`, error);
  }

  const tourHours = override?.tourHours ?? partner.tourHours;

  return {
    slug,
    name: partner.name,
    name_zh: partner.name_zh,
    tourHours,
    weeklySchedule: parseTourHours(tourHours),
    // Static closures stay in effect; owners can only extend the list at runtime.
    blockedDates: [
      ...new Set([...(partner.blockedDates || []), ...(override?.blockedDates || [])]),
    ].sort(),
    ownerBlockedDates: override?.blockedDates || [],
    staticBlockedDates: partner.blockedDates || [],
    updatedAt: override?.updatedAt,
    updatedBy: override?.updatedBy,
  };
}

/**
 * Persist an override for a daycare, merging with whatever is already stored.
 *
 * Four administrators share every location, so two of them can easily save at the same
 * moment. The read/merge/write therefore runs inside WATCH/MULTI (the same pattern as
 * {@link module:bookings.cancelBooking}) and retries on conflict; without it the later
 * write would silently discard the earlier one's closure while still reporting success.
 *
 * @param slug - Daycare slug
 * @param patch - Fields to change
 * @param actor - Email of the authenticated user performing the change (audit trail)
 * @returns The refreshed merged settings
 */
export async function saveTourSettings(
  slug: string,
  patch: { tourHours?: string; blockedDates?: string[] },
  actor: string
): Promise<TourSettings> {
  return mutateTourSettings(slug, actor, (existing) => ({ ...existing, ...patch }));
}

/**
 * Atomically change the owner-managed closed dates.
 *
 * The merge itself runs *inside* the transaction: computing the new list from a read that
 * happened earlier in the request would let two administrators who block different dates at
 * the same time each write a list built from the same stale value, so one closure would be
 * silently dropped while its author was told it succeeded.
 *
 * @param slug - Daycare slug
 * @param actor - Email of the authenticated user performing the change
 * @param mutate - Receives the currently stored closures and returns the new list
 * @returns The refreshed merged settings
 */
export async function updateBlockedDates(
  slug: string,
  actor: string,
  mutate: (current: string[]) => string[]
): Promise<TourSettings> {
  return mutateTourSettings(slug, actor, (existing) => ({
    ...existing,
    blockedDates: mutate(existing.blockedDates || []),
  }));
}

/**
 * Read-modify-write the stored override under WATCH/MULTI, retrying on conflict.
 *
 * Four administrators share every location, so two of them can easily save at the same
 * moment. Mirrors the pattern used by {@link module:bookings.cancelBooking}.
 *
 * @param slug - Daycare slug
 * @param actor - Email of the authenticated user performing the change (audit trail)
 * @param apply - Produces the next override from the one currently stored
 * @returns The refreshed merged settings
 */
async function mutateTourSettings(
  slug: string,
  actor: string,
  apply: (existing: TourScheduleOverride) => TourScheduleOverride
): Promise<TourSettings> {
  const key = scheduleKey(slug);

  for (let attempt = 0; attempt < SAVE_RETRIES; attempt++) {
    const client = redis.duplicate();

    try {
      await client.connect();
      await client.watch(key);

      const raw = await client.get(key);
      const existing: TourScheduleOverride = raw ? JSON.parse(raw) : {};

      const next: TourScheduleOverride = {
        ...apply(existing),
        updatedAt: new Date().toISOString(),
        updatedBy: actor,
      };

      const result = await client.multi().set(key, JSON.stringify(next)).exec();

      if (result) {
        const settings = await getTourSettings(slug);
        if (!settings) {
          throw new Error(`Daycare "${slug}" disappeared while saving its schedule.`);
        }
        return settings;
      }
    } catch (error) {
      // node-redis signals a lost WATCH race by throwing, so retry with a fresh read
      if (!isWatchConflict(error)) throw error;
      console.warn(`⚠️ Schedule save for ${slug} retried (attempt ${attempt + 1})`);
    } finally {
      await client.quit().catch(() => {});
    }
  }

  throw new Error(
    `Could not save the schedule for "${slug}" — another administrator is editing it. Please try again.`
  );
}

/**
 * Find future bookings that a prospective schedule change would invalidate.
 *
 * Tours happening today are ignored: they are about to take place, so the owner should call
 * the parent rather than silently cancelling.
 *
 * @param slug - Daycare slug
 * @param nextSettings - The schedule as it would look after the change
 * @returns Bookings that would no longer sit on an open slot
 */
export async function findConflictingBookings(
  slug: string,
  nextSettings: { tourHours: string; blockedDates: string[] }
): Promise<Booking[]> {
  const bookings = await getBookingsForDaycare(slug, { from: getPSTDate(1) });
  if (bookings.length === 0) return [];

  // Look far enough ahead to cover every stored booking, not just the public 14-day window
  const horizon = bookings.reduce((max, b) => (b.date > max ? b.date : max), getPSTDate(1));
  const daysAhead = Math.max(
    BOOKING_WINDOW_DAYS,
    Math.ceil((new Date(`${horizon}T00:00:00`).getTime() - Date.now()) / 86_400_000) + 2
  );

  // Keyed by date *and* time: moving Monday tours from 10:00 AM to 6:00 PM leaves the date
  // open but strands every existing 10:00 AM booking, so comparing dates alone would let
  // those parents keep a confirmation for a tour that no longer happens.
  const openSlots = new Map<string, Set<string>>();
  for (const slot of generateAvailableSlots(nextSettings, { days: daysAhead })) {
    const times = openSlots.get(slot.value) ?? new Set<string>();
    times.add(slot.time);
    openSlots.set(slot.value, times);
  }

  return bookings.filter((booking) => {
    const times = openSlots.get(booking.date);
    if (!times) return true;
    // A booking with no recorded time can only be checked at day granularity
    return booking.time ? !times.has(booking.time) : false;
  });
}

/**
 * Server-side guard used by the public booking endpoint.
 *
 * @param slug - Daycare slug
 * @param date - Requested date (YYYY-MM-DD)
 * @returns `{ available: true, time }` or `{ available: false, reason }`
 */
export async function checkDateAvailability(
  slug: string,
  date: string
): Promise<{ available: true; time: string } | { available: false; reason: string }> {
  if (typeof date !== "string" || !DATE_PATTERN.test(date)) {
    return { available: false, reason: "Invalid date format." };
  }

  const settings = await getTourSettings(slug);
  if (!settings) {
    return { available: false, reason: "Unknown daycare." };
  }

  const slot = generateAvailableSlots(settings).find((s) => s.value === date);
  if (!slot) {
    return {
      available: false,
      reason: "This date is no longer available for tours. Please pick another date.",
    };
  }

  return { available: true, time: slot.time };
}
