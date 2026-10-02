/**
 * Puts tour bookings on the Waymaker Google Calendar automatically.
 *
 * Ported from sunny-next: the API acts as one Google account through an OAuth 2.0 refresh
 * token, so events land on that account's own calendar with no service account and no
 * calendar sharing. Two things differ on purpose, both so a booking can never hang on Google:
 *
 * - Plain `fetch` with an abort timeout on every call instead of `googleapis`, which sets no
 *   request timeout of its own (and is a 115 MB dependency for two endpoints).
 * - Callers hand the work to {@link runAfterResponse}: the parent gets the confirmation
 *   without waiting for Google, while Vercel keeps the function alive until the call is done.
 *
 * Everything here is best-effort. Failures are logged and swallowed, because the booking is
 * already stored by the time the calendar is touched.
 *
 * Environment variables (the sync is skipped, with a warning, until the first three are set):
 *   GOOGLE_OAUTH_CLIENT_ID         OAuth 2.0 client ID
 *   GOOGLE_OAUTH_CLIENT_SECRET     OAuth 2.0 client secret
 *   GOOGLE_CALENDAR_REFRESH_TOKEN  Refresh token of the account whose calendar receives the tours
 *   GOOGLE_CALENDAR_ID             Optional; defaults to that account's main calendar
 *
 * @module google-calendar
 */

import crypto from "crypto";
import { after } from "next/server";
import { DATE_PATTERN } from "@/lib/tour-slots";
import { getTimeZoneName } from "@/lib/utils-date";
import type { Booking } from "@/lib/types";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API_URL = "https://www.googleapis.com/calendar/v3";
const TIME_ZONE = "America/Los_Angeles";

/** Ceiling for any single HTTP call to Google, response body included. */
const REQUEST_TIMEOUT_MS = 8_000;
/** Ceiling for one whole calendar job (token, API call, retry, follow-up check). */
export const CALENDAR_JOB_BUDGET_MS = 15_000;
/** Ceiling for the Redis check that runs after an event is created. */
const BOOKING_CHECK_TIMEOUT_MS = 3_000;
/** Attempts per Calendar call; the second one only runs for failures that can clear up. */
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 500;
/** Events removed in parallel when a closure cancels several tours at once. */
const DELETE_CONCURRENCY = 4;
/** Event length when the booked time is a single start time rather than a range. */
const DEFAULT_TOUR_MINUTES = 60;
/** Renew the cached access token this long before Google expires it. */
const TOKEN_RENEW_MARGIN_MS = 60_000;

/** What the calendar event needs to know about a new booking. */
export interface TourCalendarDetails {
  bookingId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  daycareName: string;
  daycareSlug: string;
  daycareAddress?: string;
  /** YYYY-MM-DD */
  date: string;
  /** "6:00 PM" or "4:00 PM - 6:00 PM", Pacific time */
  time: string;
  /** Free text the parent submitted with the booking. */
  message?: string;
}

interface CalendarConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
}

/** A failed call to Google, flagged with whether trying again could help. */
class GoogleApiError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "GoogleApiError";
    this.retryable = retryable;
  }
}

function getConfig(): CalendarConfig | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim();

  const missing: string[] = [];
  if (!clientId) missing.push("GOOGLE_OAUTH_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_OAUTH_CLIENT_SECRET");
  if (!refreshToken) missing.push("GOOGLE_CALENDAR_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn(`📅 Google Calendar sync skipped — missing env vars: ${missing.join(", ")}`);
    return null;
  }

  return {
    clientId,
    clientSecret,
    refreshToken,
    calendarId: process.env.GOOGLE_CALENDAR_ID?.trim() || "primary",
  };
}

// ---------------------------------------------------------------------------
// Time limits
// ---------------------------------------------------------------------------

/**
 * Settle with `fallback` once `ms` elapses, for work that cannot be aborted (Redis) or as a
 * last line of defence around a whole job.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), Math.max(ms, 0));
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** `fetch` that is aborted at the per-call limit or the job deadline, whichever comes first. */
async function fetchBeforeDeadline(url: string, init: RequestInit, deadline: number): Promise<Response> {
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    throw new GoogleApiError("calendar job ran out of time", false);
  }

  return fetch(url, {
    ...init,
    // Also covers reading the body, so a response that stalls half way is cut off too
    signal: AbortSignal.timeout(Math.min(REQUEST_TIMEOUT_MS, remaining)),
  });
}

/** Release a response body that will not be read, so the connection can be reused. */
async function discard(response: Response): Promise<void> {
  await response.body?.cancel().catch(() => undefined);
}

async function describeFailure(response: Response): Promise<string> {
  const text = await response.text().catch(() => "");
  return `HTTP ${response.status}${text ? ` ${text.replace(/\s+/g, " ").slice(0, 300)}` : ""}`;
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.name === "TimeoutError" ? "request to Google timed out" : error.message;
  }
  return String(error);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Access tokens last an hour, so a warm function reuses one instead of refreshing per booking. */
let cachedToken: { value: string; expiresAt: number; refreshToken: string } | null = null;

async function getAccessToken(config: CalendarConfig, deadline: number): Promise<string> {
  if (
    cachedToken &&
    cachedToken.refreshToken === config.refreshToken &&
    cachedToken.expiresAt > Date.now()
  ) {
    return cachedToken.value;
  }

  const response = await fetchBeforeDeadline(
    TOKEN_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: "refresh_token",
      }),
    },
    deadline
  );

  const data = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    // "invalid_grant" means the refresh token was revoked or has expired (consent screens left
    // in "Testing" expire them after 7 days) — retrying cannot fix that, a new token is needed
    throw new GoogleApiError(
      `token refresh failed: HTTP ${response.status} ${data.error ?? ""} ${data.error_description ?? ""}`.trim(),
      response.status === 429 || response.status >= 500
    );
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 - TOKEN_RENEW_MARGIN_MS,
    refreshToken: config.refreshToken,
  };
  return cachedToken.value;
}

/**
 * Call the Calendar API, retrying once on failures that can clear up on their own.
 *
 * Returns any HTTP response for the caller to interpret; throws on network failures,
 * timeouts and token problems.
 */
async function calendarRequest(
  config: CalendarConfig,
  request: { method: "POST" | "DELETE"; path: string; body?: unknown },
  deadline: number
): Promise<Response> {
  let lastError: unknown = new GoogleApiError("calendar request was not attempted", false);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      if (deadline - Date.now() <= RETRY_DELAY_MS) break;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }

    try {
      const token = await getAccessToken(config, deadline);
      const response = await fetchBeforeDeadline(
        `${CALENDAR_API_URL}${request.path}`,
        {
          method: request.method,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(request.body === undefined ? {} : { "Content-Type": "application/json" }),
          },
          body: request.body === undefined ? undefined : JSON.stringify(request.body),
        },
        deadline
      );

      // A 401 means the cached access token stopped working early; fetch a fresh one on retry
      if (response.status === 401) cachedToken = null;

      const transient = response.status === 401 || response.status === 429 || response.status >= 500;
      if (!transient || attempt === MAX_ATTEMPTS) return response;

      lastError = new GoogleApiError(`HTTP ${response.status}`, true);
      await discard(response);
    } catch (error) {
      lastError = error;
      // Network errors and per-call timeouts are worth one more try; token problems are not
      if (error instanceof GoogleApiError && !error.retryable) break;
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Event shape
// ---------------------------------------------------------------------------

/**
 * Calendar event id for a booking.
 *
 * Derived instead of stored: a cancellation can always find the event, and a retried insert
 * is rejected as a duplicate (409) instead of creating a second event. Google accepts 5–1024
 * characters of base32hex (0-9, a-v), which a hex digest satisfies. Hashing keeps the booking
 * id, which doubles as the parent's cancellation token, off the calendar.
 *
 * @param bookingId - Booking id
 */
export function tourEventId(bookingId: string): string {
  return crypto.createHash("sha256").update(`waymaker-tour:${bookingId}`).digest("hex");
}

/** "6:00 PM" → minutes after midnight, or null when the text is not a time. */
function minutesAfterMidnight(text: string | undefined): number | null {
  const match = text?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const hours = (parseInt(match[1], 10) % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  const minutes = parseInt(match[2], 10);
  return minutes < 60 ? hours * 60 + minutes : null;
}

/** Wall-clock "YYYY-MM-DDTHH:mm:ss" for a date plus minutes (may roll into the next day). */
function wallClock(date: string, minutes: number): string {
  const [year, month, day] = date.split("-").map(Number);
  // Date.UTC only does the calendar arithmetic; the result is read back as a plain local
  // time, and Google applies the Pacific zone itself, DST included
  return new Date(Date.UTC(year, month - 1, day, 0, minutes)).toISOString().slice(0, 19);
}

/**
 * Start and end of a tour as Pacific wall-clock times.
 *
 * A range ("4:00 PM - 6:00 PM") spans the whole window the parent was given; a single time
 * gets a one-hour event, like the "Add to Google Calendar" link in the emails.
 *
 * @param date - YYYY-MM-DD
 * @param time - "6:00 PM" or "4:00 PM - 6:00 PM"
 * @returns Start/end, or null when the time cannot be read
 */
export function tourEventWindow(date: string, time: string): { start: string; end: string } | null {
  if (!DATE_PATTERN.test(date)) return null;

  const [startText, endText] = String(time).split("-").map((part) => part.trim());
  const start = minutesAfterMidnight(startText);
  if (start === null) return null;

  const end = minutesAfterMidnight(endText);
  return {
    start: wallClock(date, start),
    end: wallClock(date, end !== null && end > start ? end : start + DEFAULT_TOUR_MINUTES),
  };
}

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function buildTourEvent(tour: TourCalendarDetails, window: { start: string; end: string }) {
  // The booking form indents its message block; keep the lines, drop the indentation
  const notes = clip(
    (tour.message ?? "")
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim(),
    2_000
  );

  const description = [
    `Parent: ${clip(tour.parentName, 200)}`,
    `Email: ${clip(tour.parentEmail, 200)}`,
    `Phone: ${clip(tour.parentPhone, 50)}`,
    "",
    `Daycare: ${tour.daycareName}`,
    ...(tour.daycareAddress ? [`Address: ${tour.daycareAddress}`] : []),
    `Tour: ${tour.date} ${tour.time} ${getTimeZoneName(tour.date)}`,
    ...(notes ? ["", notes] : []),
  ].join("\n");

  return {
    id: tourEventId(tour.bookingId),
    summary: clip(`${tour.daycareName} Tour - ${tour.parentName}`, 250),
    description,
    location: tour.daycareAddress ? `${tour.daycareName}, ${tour.daycareAddress}` : tour.daycareName,
    start: { dateTime: window.start, timeZone: TIME_ZONE },
    end: { dateTime: window.end, timeZone: TIME_ZONE },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 60 },
        { method: "popup", minutes: 24 * 60 },
      ],
    },
    colorId: "2",
    extendedProperties: { private: { source: "waymaker-daycare", daycareSlug: tour.daycareSlug } },
  };
}

function eventsPath(config: CalendarConfig, suffix = ""): string {
  // sendUpdates=none: the calendar owner is the only one who should ever hear about these
  return `/calendars/${encodeURIComponent(config.calendarId)}/events${suffix}?sendUpdates=none`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

async function deleteTourEvent(
  config: CalendarConfig,
  booking: Pick<Booking, "id" | "daycareSlug" | "date">,
  deadline: number
): Promise<boolean> {
  const label = `booking ${booking.id} (${booking.daycareSlug} ${booking.date})`;

  try {
    const response = await calendarRequest(
      config,
      { method: "DELETE", path: eventsPath(config, `/${tourEventId(booking.id)}`) },
      deadline
    );

    // 404/410: never created (sync was off, or creation failed) or already deleted
    if (response.ok || response.status === 404 || response.status === 410) {
      await discard(response);
      console.log(
        response.ok
          ? `📅 Calendar event removed for ${label}`
          : `📅 No calendar event to remove for ${label}`
      );
      return true;
    }

    console.error(`❌ Failed to remove calendar event for ${label}: ${await describeFailure(response)}`);
    return false;
  } catch (error) {
    console.error(`❌ Failed to remove calendar event for ${label}: ${describeError(error)}`);
    return false;
  }
}

/**
 * Add a new booking to the calendar.
 *
 * @param tour - Booking details for the event
 * @param options.isStillBooked - Checked after the event is created: a cancellation that ran
 *   while the event was being created found nothing to delete, so the event is removed here
 * @returns Whether the event is on the calendar afterwards; never throws
 */
export async function addTourToCalendar(
  tour: TourCalendarDetails,
  options: { isStillBooked?: () => Promise<boolean> } = {}
): Promise<boolean> {
  const deadline = Date.now() + CALENDAR_JOB_BUDGET_MS;
  const config = getConfig();
  if (!config) return false;

  const window = tourEventWindow(tour.date, tour.time);
  if (!window) {
    console.warn(`📅 Could not read the tour time for booking ${tour.bookingId}: "${tour.date} ${tour.time}"`);
    return false;
  }

  try {
    const response = await calendarRequest(
      config,
      { method: "POST", path: eventsPath(config), body: buildTourEvent(tour, window) },
      deadline
    );

    if (response.status === 409) {
      // Same derived id: an earlier attempt already created it
      await discard(response);
      console.log(`📅 Calendar event already exists for booking ${tour.bookingId}`);
    } else if (response.ok) {
      await discard(response);
      console.log(`📅 Calendar event created for booking ${tour.bookingId} (${tour.daycareSlug} ${tour.date})`);
    } else {
      console.error(
        `❌ Failed to create calendar event for booking ${tour.bookingId}: ${await describeFailure(response)}`
      );
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to create calendar event for booking ${tour.bookingId}: ${describeError(error)}`);
    return false;
  }

  if (options.isStillBooked) {
    // When in doubt (Redis slow or down) keep the event: a stray event is easy to delete by
    // hand, a missing one is a tour nobody shows up for
    const stillBooked = await withTimeout(
      options.isStillBooked().catch(() => true),
      Math.min(BOOKING_CHECK_TIMEOUT_MS, deadline - Date.now()),
      true
    );

    if (!stillBooked) {
      console.log(`📅 Booking ${tour.bookingId} was cancelled while its event was being created`);
      const removed = await deleteTourEvent(
        config,
        { id: tour.bookingId, daycareSlug: tour.daycareSlug, date: tour.date },
        deadline
      );
      return !removed;
    }
  }

  return true;
}

/**
 * Remove the events of cancelled bookings.
 *
 * Bookings that never got an event count as removed.
 *
 * @param bookings - Cancelled bookings
 * @returns Ids whose event may still be on the calendar; never throws
 */
export async function removeToursFromCalendar(
  bookings: Pick<Booking, "id" | "daycareSlug" | "date">[]
): Promise<string[]> {
  if (bookings.length === 0) return [];

  const deadline = Date.now() + CALENDAR_JOB_BUDGET_MS;
  const config = getConfig();
  if (!config) return [];

  const queue = [...bookings];
  const leftOver: string[] = [];

  const worker = async () => {
    for (let booking = queue.shift(); booking; booking = queue.shift()) {
      if (Date.now() >= deadline || !(await deleteTourEvent(config, booking, deadline))) {
        leftOver.push(booking.id);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(DELETE_CONCURRENCY, queue.length) }, worker));

  if (leftOver.length > 0) {
    console.warn(`⚠️ ${leftOver.length} cancelled tour(s) may still be on the calendar: ${leftOver.join(", ")}`);
  }
  return leftOver;
}

/**
 * Let calendar work finish after the response, without making the caller wait for it.
 *
 * Vercel stops a function once its response is sent, so a promise that is simply not awaited
 * gets dropped (the first sunny-next version lost events that way). `after()` hands it to the
 * platform's `waitUntil`, which keeps the invocation alive until the work settles; the time
 * cap means it can never hold the function open. Outside a request (scripts) `after()`
 * throws, and the work is awaited instead.
 *
 * Start the work before calling this so it runs alongside whatever the route still has to do.
 *
 * @param work - Calendar job, already started
 */
export async function runAfterResponse(work: Promise<unknown>): Promise<void> {
  const capped = withTimeout(
    work.catch((error) => console.error(`❌ Calendar sync failed: ${describeError(error)}`)),
    CALENDAR_JOB_BUDGET_MS + 2_000,
    undefined
  );

  try {
    after(capped);
  } catch {
    await capped;
  }
}
