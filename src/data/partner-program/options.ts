/**
 * Routes and the answer options of the partner application. Shared by the form, the API
 * validator and the emails, so the three can never disagree.
 */

export const JOIN_ROUTE = "/for-providers/join";
export const APPLY_ROUTE = "/for-providers/join/apply";
export const THANKS_ROUTE = "/for-providers/join/thanks";

/** CDSS Community Care Facility Search: where providers and our reviewers look a licence up. */
export const CCLD_SEARCH_URL = "https://www.ccld.dss.ca.gov/carefacilitysearch/";

/** The landing page's two audiences, picked with `?type=`. */
export const AUDIENCES = ["family", "center"] as const;
export type Audience = (typeof AUDIENCES)[number];

export const PROGRAM_TYPES = ["family-small", "family-large", "center", "not-licensed"] as const;
export type ProgramType = (typeof PROGRAM_TYPES)[number];
/** "not-licensed" is never submitted: those visitors are sent to the consulting funnel. */
export type LicensedType = Exclude<ProgramType, "not-licensed">;
export const LICENSED_TYPES: readonly LicensedType[] = ["family-small", "family-large", "center"];

export const AGE_GROUPS = ["infant", "toddler", "preschool", "school-age"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];
export const OPENINGS = ["now", "soon", "waitlist", "not-sure"] as const;
export type Openings = (typeof OPENINGS)[number];
export const ROLES = ["owner", "director", "other"] as const;
export type Role = (typeof ROLES)[number];
export const SPOKEN = ["english", "mandarin", "cantonese", "spanish", "other"] as const;
export type Spoken = (typeof SPOKEN)[number];
export const BEST_TIMES = ["weekday-morning", "weekday-afternoon", "weekday-evening", "weekend", "any"] as const;
export type BestTime = (typeof BEST_TIMES)[number];
export const HEARD_FROM = ["search", "another-daycare", "cpr-class", "social", "other"] as const;
export type HeardFrom = (typeof HEARD_FROM)[number];

/** Tour days in display order, Monday first. 0 = Sunday, as in `WeeklyTourSchedule.day`. */
export const TOUR_DAYS = [1, 2, 3, 4, 5, 6, 0] as const;

export const LIMITS = {
  name: 120, contact: 100, email: 254, phone: 30, city: 80, license: 12, tourTime: 60, website: 300, about: 1000,
} as const;

/**
 * Every facility number in partners.ts has 9 digits, but that is not confirmed for every
 * California licence, so another length only shows a warning instead of blocking the form.
 */
export const LICENSE_DIGITS = 9;

/** The landing audience a program type belongs to. */
export function audienceOf(type: string): Audience | null {
  if (type === "family-small" || type === "family-large") return "family";
  return type === "center" ? "center" : null;
}

/** The step-1 program type that `?type=` preselects. */
export const AUDIENCE_PROGRAM: Record<Audience, LicensedType> = { family: "family-small", center: "center" };

/** localStorage draft, kept on this device only. */
export const DRAFT_KEY = "wm-partner-application:v1";
export const DRAFT_MAX_AGE_DAYS = 30;
export const DRAFT_DEBOUNCE_MS = 600;

/** sessionStorage hand-over to the thanks page: first name, email and reply language only. */
export const SENT_KEY = "wm-partner-application:sent";
