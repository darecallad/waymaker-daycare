/**
 * Pure tour-slot rules shared by the server and the browser.
 *
 * These functions own the parsing/serialisation of the legacy `tourHours` string, the
 * validation of owner-submitted payloads and the slot generation that used to live inside
 * the booking page. Keeping them free of Redis imports lets client components reuse them.
 *
 * @module tour-slots
 */

import { getPSTDate } from "@/lib/utils-date";
import type { TourSlot, WeeklyTourSchedule } from "@/lib/types";

/** Number of days ahead the public booking form offers. */
export const BOOKING_WINDOW_DAYS = 14;

/** Earliest date tours are offered (kept in sync with the public booking page). */
export const TOUR_START_DATE = "2026-01-05";

/** US federal holidays where no daycare accepts tours. */
export const US_HOLIDAYS = [
  "2026-01-01", // New Year's Day
  "2026-01-19", // Martin Luther King Jr. Day
  "2026-02-16", // Presidents' Day
  "2026-05-25", // Memorial Day
  "2026-06-19", // Juneteenth
  "2026-07-04", // Independence Day
  "2026-09-07", // Labor Day
  "2026-10-12", // Columbus Day
  "2026-11-11", // Veterans Day
  "2026-11-26", // Thanksgiving Day
  "2026-12-25", // Christmas Day
];

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DAY_MAP: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

/** Matches a YYYY-MM-DD date string. */
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse a `tourHours` string (e.g. "Mon-Fri 6:00 PM | Sat 10:00 AM") into a weekly schedule.
 *
 * Supports pipe-separated segments, day ranges ("Mon-Fri") and day lists ("Mon, Tue").
 *
 * @param tourHours - Human readable schedule string
 * @returns One entry per weekday that accepts tours
 */
export function parseTourHours(tourHours: string): WeeklyTourSchedule[] {
  if (!tourHours) return [];

  const schedules: WeeklyTourSchedule[] = [];
  const segments = tourHours.includes("|")
    ? tourHours.split("|").map((s) => s.trim())
    : [tourHours.trim()];

  segments.forEach((segment) => {
    const timeStartIndex = segment.search(/\d/);
    if (timeStartIndex === -1) return;

    const daysPart = segment.substring(0, timeStartIndex).trim();
    const time = segment.substring(timeStartIndex).trim();
    if (!time) return;

    daysPart.split(",").map((s) => s.trim()).forEach((daySeg) => {
      if (!daySeg) return;

      if (daySeg.includes("-")) {
        const [start, end] = daySeg.split("-").map((s) => s.trim());
        const startIdx = DAY_MAP[start];
        const endIdx = DAY_MAP[end];
        if (startIdx === undefined || endIdx === undefined) return;

        let current = startIdx;
        while (current !== endIdx) {
          schedules.push({ day: current, time });
          current = (current + 1) % 7;
        }
        schedules.push({ day: endIdx, time });
      } else {
        const idx = DAY_MAP[daySeg];
        if (idx !== undefined) schedules.push({ day: idx, time });
      }
    });
  });

  // De-duplicate identical day+time pairs produced by overlapping segments
  const seen = new Set<string>();
  return schedules.filter(({ day, time }) => {
    const key = `${day}|${time}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Serialise a weekly schedule back into the legacy `tourHours` string format so that
 * partner cards, structured data and emails keep working unchanged.
 *
 * @param weekly - Weekly schedule entries
 * @returns String such as "Mon 6:00 PM | Sat 10:00 AM"
 */
export function formatTourHours(weekly: WeeklyTourSchedule[]): string {
  return [...weekly]
    .sort((a, b) => a.day - b.day)
    .map(({ day, time }) => `${DAY_NAMES[day]} ${time.trim()}`)
    .join(" | ");
}

/**
 * Validate a weekly schedule submitted by an owner.
 *
 * @param weekly - Untrusted payload
 * @returns Sanitised schedule
 * @throws {TourValidationError} When a day index or time string is invalid
 */
export function validateWeeklySchedule(weekly: unknown): WeeklyTourSchedule[] {
  if (!Array.isArray(weekly)) {
    throw new TourValidationError("weeklySchedule must be an array.");
  }

  if (weekly.length > 21) {
    throw new TourValidationError("Too many schedule entries (max 21).");
  }

  const seen = new Set<number>();

  return weekly.map((entry) => {
    if (!entry || typeof entry !== "object") {
      throw new TourValidationError("Each schedule entry must be an object.");
    }

    const { day, time } = entry as { day?: unknown; time?: unknown };

    if (typeof day !== "number" || !Number.isInteger(day) || day < 0 || day > 6) {
      throw new TourValidationError("Schedule day must be an integer between 0 (Sun) and 6 (Sat).");
    }

    if (typeof time !== "string" || !isValidTimeRange(time)) {
      throw new TourValidationError(
        `Invalid time "${String(time)}". Use a format like "6:00 PM" or "4:00 PM - 6:00 PM".`
      );
    }

    if (seen.has(day)) {
      throw new TourValidationError(`Duplicate entry for ${DAY_NAMES[day]}. Use one time range per day.`);
    }
    seen.add(day);

    return { day, time: time.trim().replace(/\s+/g, " ") };
  });
}

/**
 * Check a time or time-range string, e.g. "10:00 AM" or "4:00 PM - 6:00 PM".
 *
 * @param time - Candidate string
 */
export function isValidTimeRange(time: string): boolean {
  const single = /^\d{1,2}:\d{2}\s*(AM|PM)$/i;
  const parts = time.split("-").map((s) => s.trim());
  if (parts.length > 2 || parts.some((p) => !single.test(p))) return false;

  return parts.every((part) => {
    const hours = parseInt(part.split(":")[0], 10);
    const minutes = parseInt(part.split(":")[1].slice(0, 2), 10);
    return hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59;
  });
}

/**
 * Validate a list of blocked dates.
 *
 * @param dates - Untrusted payload
 * @param options.allowPast - Allow dates before today (used when removing dates)
 * @returns Sorted, de-duplicated YYYY-MM-DD strings
 * @throws {TourValidationError} When a date is malformed, non-existent or in the past
 */
export function validateBlockedDates(dates: unknown, options: { allowPast?: boolean } = {}): string[] {
  if (!Array.isArray(dates)) {
    throw new TourValidationError("dates must be an array of YYYY-MM-DD strings.");
  }

  if (dates.length > 366) {
    throw new TourValidationError("Too many dates in a single request (max 366).");
  }

  const today = getPSTDate();

  const cleaned = dates.map((date) => {
    if (typeof date !== "string" || !DATE_PATTERN.test(date.trim())) {
      throw new TourValidationError(`Invalid date "${String(date)}". Expected format YYYY-MM-DD.`);
    }

    const value = date.trim();
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) {
      throw new TourValidationError(`"${value}" is not a real calendar date.`);
    }

    if (!options.allowPast && value < today) {
      throw new TourValidationError(`"${value}" is in the past and cannot be blocked.`);
    }

    return value;
  });

  return [...new Set(cleaned)].sort();
}

/** Error thrown for owner-supplied payloads that fail validation. */
export class TourValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourValidationError";
  }
}

/**
 * Format a UTC-anchored Date as YYYY-MM-DD.
 *
 * Slot dates are anchored at UTC midnight so the calendar day never shifts with the
 * runtime timezone; see {@link generateAvailableSlots}.
 *
 * @param date - Date to format
 */
function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Generate the bookable slots for a daycare over the rolling booking window.
 *
 * Pure function so it runs identically on the server (validation) and in the browser
 * (rendering the date picker).
 *
 * @param settings.tourHours - Merged schedule string
 * @param settings.blockedDates - Merged blocked dates
 * @param options.locale - Locale used for the human readable label
 * @param options.days - Size of the rolling window (defaults to {@link BOOKING_WINDOW_DAYS})
 */
export function generateAvailableSlots(
  settings: { tourHours: string; blockedDates: string[] },
  options: { locale?: string; days?: number } = {}
): TourSlot[] {
  const { locale = "en", days = BOOKING_WINDOW_DAYS } = options;
  const weekly = parseTourHours(settings.tourHours);
  if (weekly.length === 0) return [];

  const blocked = new Set([...settings.blockedDates, ...US_HOLIDAYS]);
  const slots: TourSlot[] = [];

  // The first bookable day is "tomorrow in California", not tomorrow wherever this code
  // happens to run. Vercel runs in UTC and browsers run in the visitor's zone, so deriving
  // the start from the raw local clock would shift the whole window by a day for part of
  // every day. Each cursor date is then anchored at UTC midnight and advanced with UTC
  // getters so the calendar day can never drift.
  const firstDate = [TOUR_START_DATE, getPSTDate(1)].sort().at(-1) as string;
  const current = new Date(`${firstDate}T00:00:00Z`);

  for (let i = 0; i < days; i++) {
    const dateStr = toDateString(current);

    if (!blocked.has(dateStr)) {
      const dayIdx = current.getUTCDay();
      weekly
        .filter((schedule) => schedule.day === dayIdx)
        .forEach((schedule) => {
          slots.push({
            value: dateStr,
            label: current.toLocaleDateString(locale === "zh" ? "zh-TW" : "en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            }),
            time: schedule.time,
          });
        });
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return slots;
}

