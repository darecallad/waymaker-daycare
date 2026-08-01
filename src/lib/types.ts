export interface Partner {
  name: string;
  name_zh?: string;
  slug: string;
  logo: string;
  license: string;
  address: string;
  address_zh?: string;
  owner: string;
  phone: string;
  email: string;
  ownerPhone?: string;
  ownerEmail?: string;
  tourHours: string;
  description: string;
  description_zh?: string;
  images: string[];
  type?: string;
  bookingUrl?: string;
  website?: string;
  googleReviewUrl?: string;
  blockedDates?: string[]; // Array of date strings in YYYY-MM-DD format
}

export interface BookingFormData {
  parentName: string;
  email: string;
  phone: string;
  childAge: string;
  preferredDate: string;
  message?: string;
}

/** A single weekday that accepts tours, plus the time (or time range) offered on that day. */
export interface WeeklyTourSchedule {
  /** 0 = Sunday ... 6 = Saturday */
  day: number;
  /** e.g. "6:00 PM" or "4:00 PM - 6:00 PM" */
  time: string;
}

/** Owner-authored override stored in Redis under `daycare:{slug}:schedule`. */
export interface TourScheduleOverride {
  tourHours?: string;
  blockedDates?: string[];
  updatedAt?: string;
  updatedBy?: string;
}

/** Static partner data merged with its Redis override. */
export interface TourSettings {
  slug: string;
  name: string;
  name_zh?: string;
  tourHours: string;
  weeklySchedule: WeeklyTourSchedule[];
  /** Everything that is closed: static + owner-added dates. */
  blockedDates: string[];
  /** Dates the owner added at runtime (removable from the dashboard). */
  ownerBlockedDates: string[];
  /** Dates baked into partners.ts (only a Super Admin can change these in code). */
  staticBlockedDates: string[];
  updatedAt?: string;
  updatedBy?: string;
}

/** A bookable date offered by the public booking form. */
export interface TourSlot {
  value: string;
  label: string;
  time: string;
}

/** A tour booking as stored in Redis under `booking:{id}`. */
export interface Booking {
  id: string;
  name: string;
  email: string;
  daycareName?: string;
  daycareSlug: string;
  date: string;
  time: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

export type UserRole = "admin" | "super_admin";

/** Authenticated dashboard session. */
export interface AdminSession {
  email: string;
  role: UserRole;
  /** Daycare slugs this session may manage. */
  slugs: string[];
  createdAt: string;
}

/** Every administrator action that is worth investigating later. */
export type AuditAction =
  | "login.code_requested"
  | "login.succeeded"
  | "login.failed"
  | "logout"
  | "schedule.updated"
  | "dates.blocked"
  | "dates.unblocked"
  | "booking.cancelled";

/**
 * A single append-only audit entry.
 *
 * Entries are never edited or deleted through the app, so they can be used as evidence of
 * who changed what.
 */
export interface AuditEntry {
  id: string;
  /** ISO timestamp (UTC). */
  at: string;
  /** Who performed the action. */
  actor: string;
  actorRole: UserRole | "unknown";
  action: AuditAction;
  /** Daycare the action applied to, when the action is location specific. */
  slug?: string;
  daycareName?: string;
  /** Whether the attempt actually succeeded. */
  outcome: "success" | "denied" | "error";
  /** Human readable one-line summary shown in the dashboard. */
  summary: string;
  /** Value before the change, for change actions. */
  before?: string;
  /** Value after the change, for change actions. */
  after?: string;
  /** Bookings affected by the action (ids). */
  affectedBookings?: string[];
  ip?: string;
  userAgent?: string;
}

