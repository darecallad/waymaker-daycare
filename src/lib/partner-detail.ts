/**
 * Pure helpers for the daycare detail page (no React), so they can be unit-tested.
 */
import { DAY_NAMES, compactTime, parseTourHours } from "@/lib/tour-slots";

type Locale = "en" | "zh";

const DAY_NAMES_ZH = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"] as const;
/** Parents read a week Monday-first; Sunday goes last. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export interface TourRow {
  /** "Fri", "Mon, Tue", "Mon – Fri" (zh: "週五", "週一、週二", "週一至週五") */
  days: string;
  /** "6:00 PM" or "4:00 – 6:00 PM" */
  time: string;
}

const dayName = (day: number, locale: Locale) => (locale === "zh" ? DAY_NAMES_ZH : DAY_NAMES)[day];

function runLabel(days: number[], locale: Locale): string {
  const [first, last] = [dayName(days[0], locale), dayName(days[days.length - 1], locale)];
  if (days.length === 1) return first;
  if (days.length === 2) return locale === "zh" ? `${first}、${last}` : `${first}, ${last}`;
  return locale === "zh" ? `${first}至${last}` : `${first} – ${last}`;
}

/**
 * One row per run of consecutive weekdays that share the same time, Monday-first.
 * "Mon-Fri 6:00 PM" -> one row; "Mon, Wed, Thu, Fri 6:00 PM" -> "Mon" + "Wed – Fri".
 */
export function tourRows(tourHours: string, locale: Locale): TourRow[] {
  const timeByDay = new Map(parseTourHours(tourHours).map((s) => [s.day, s.time]));
  const runs: { days: number[]; time: string; lastIndex: number }[] = [];

  WEEK_ORDER.forEach((day, index) => {
    const time = timeByDay.get(day);
    if (!time) return;
    const run = runs.at(-1);
    if (run && run.time === time && run.lastIndex === index - 1) {
      run.days.push(day);
      run.lastIndex = index;
    } else {
      runs.push({ days: [day], time, lastIndex: index });
    }
  });

  return runs.map((run) => ({ days: runLabel(run.days, locale), time: compactTime(run.time, locale) }));
}

/** "Fri · Sat · Sun" for the meta line under the H1. */
export const tourDaysSummary = (rows: TourRow[]) => rows.map((row) => row.days).join(" · ");

/**
 * Official California CCLD facility page. Format confirmed from the state's own search
 * (carefacilitysearch -> FacDetail/<facility number>). Only for 9-digit facility numbers.
 */
export function ccldUrl(license: string): string | null {
  return /^\d{9}$/.test(license)
    ? `https://www.ccld.dss.ca.gov/carefacilitysearch/FacDetail/${license}`
    : null;
}

/** "(408) 590-3617" -> "tel:+14085903617" (US numbers). */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

export const mapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
