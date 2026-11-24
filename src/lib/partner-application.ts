/**
 * The partner application: field rules, the server-side parser and the on-device draft.
 * Pure, so the form, the API route and the tests run exactly the same checks.
 */
import {
  AGE_GROUPS, BEST_TIMES, DRAFT_MAX_AGE_DAYS, HEARD_FROM, LICENSED_TYPES, LICENSE_DIGITS, LIMITS, OPENINGS,
  PROGRAM_TYPES, ROLES, SPOKEN, TOUR_DAYS,
  type AgeGroup, type BestTime, type HeardFrom, type LicensedType, type Openings, type Role, type Spoken,
} from "@/data/partner-program/options";
import { isLocale, type Locale } from "@/lib/i18n";
import { SERVICE_AREAS } from "@/lib/site";

export type Step = 1 | 2 | 3 | 4;
export const STEPS: readonly Step[] = [1, 2, 3, 4];

export const CITY_OPTIONS = [...SERVICE_AREAS, "other"] as const;
export type CityOption = (typeof CITY_OPTIONS)[number];

/** The form while it is being filled: values as typed, none of them trusted yet. */
export interface ApplicationForm {
  programType: string;
  daycareName: string;
  licenseNumber: string;
  capacity: string;
  city: string;
  cityOther: string;
  zip: string;
  ages: string[];
  languages: string[];
  openings: string;
  openingsByAge: Partial<Record<AgeGroup, string>>;
  tourDays: number[];
  tourTime: string;
  website: string;
  about: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  replyLanguage: string;
  bestTime: string;
  heardFrom: string;
  consentAuthorised: boolean;
  consentVerify: boolean;
}

export type FormField = keyof ApplicationForm;
/** A field that can be invalid. Openings are checked per age group. */
export type FieldName = Exclude<FormField, "openingsByAge"> | `openingsByAge.${AgeGroup}`;

/** A validated application, as the API receives it. */
export interface PartnerApplication {
  programType: LicensedType;
  daycareName: string;
  /** Digits only. */
  licenseNumber: string;
  capacity: number;
  city: CityOption;
  cityOther?: string;
  zip?: string;
  ages: AgeGroup[];
  languages: Spoken[];
  openings: Openings;
  openingsByAge: Partial<Record<AgeGroup, number>>;
  /** 0 = Sunday ... 6 = Saturday, Monday first. */
  tourDays: number[];
  tourTime: string;
  website?: string;
  about?: string;
  contactName: string;
  role: Role;
  email: string;
  phone: string;
  replyLanguage: Locale;
  bestTime?: BestTime;
  heardFrom?: HeardFrom;
  consentAuthorised: true;
  consentVerify: true;
  /** Language the form was filled in. */
  locale: Locale;
}

export const STEP_FIELDS: Record<Step, readonly FormField[]> = {
  1: ["programType", "daycareName", "licenseNumber", "capacity", "city", "cityOther", "zip", "ages", "languages"],
  2: ["openings", "openingsByAge", "tourDays", "tourTime", "website", "about"],
  3: ["contactName", "role", "email", "phone", "replyLanguage", "bestTime", "heardFrom"],
  4: ["consentAuthorised", "consentVerify"],
};

export const FIELD_STEP = Object.fromEntries(
  STEPS.flatMap((step) => STEP_FIELDS[step].map((field) => [field, step])),
) as Record<FormField, Step>;

/** The step a field (including `openingsByAge.infant`) is asked on. */
export function stepOfField(field: string): Step | null {
  return FIELD_STEP[field.split(".")[0] as FormField] ?? null;
}

type Input = Record<string, unknown>;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const blank = (value: unknown) => value === undefined || value === null || (typeof value === "string" && value.trim() === "");
const between = (value: unknown, min: number, max: number) =>
  typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
const oneOf = (value: unknown, options: readonly unknown[]) => options.includes(value);
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const subsetOf = (value: unknown, options: readonly unknown[]) =>
  Array.isArray(value) && value.length <= options.length && new Set(value).size === value.length && value.every((v) => options.includes(v));
const wholeNumber = (value: unknown, min: number, max: number) => {
  const s = typeof value === "number" ? String(value) : text(value);
  return /^\d{1,4}$/.test(s) && Number(s) >= min && Number(s) <= max;
};

/** Facility numbers are typed with spaces or dashes; the number is the digits. */
export const licenseDigits = (value: unknown) => text(value).replace(/[\s-]/g, "");
const phoneDigits = (value: unknown) => text(value).replace(/\D/g, "");

// Deliberately loose, same as the consulting inquiry: the reply landing is the real check.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEB_LINK = /^https?:\/\/\S+$/i;

const RULES: Record<Exclude<FormField, "openingsByAge">, (input: Input) => boolean> = {
  programType: (i) => oneOf(i.programType, LICENSED_TYPES),
  daycareName: (i) => between(i.daycareName, 2, LIMITS.name),
  licenseNumber: (i) => text(i.licenseNumber).length <= 2 * LIMITS.license && /^\d+$/.test(licenseDigits(i.licenseNumber))
    && licenseDigits(i.licenseNumber).length <= LIMITS.license,
  capacity: (i) => wholeNumber(i.capacity, 1, 999),
  city: (i) => oneOf(i.city, CITY_OPTIONS),
  cityOther: (i) => i.city !== "other" || between(i.cityOther, 1, LIMITS.city),
  zip: (i) => blank(i.zip) || /^\d{5}$/.test(text(i.zip)),
  ages: (i) => list(i.ages).length > 0 && subsetOf(i.ages, AGE_GROUPS),
  languages: (i) => i.languages === undefined || subsetOf(i.languages, SPOKEN),
  openings: (i) => oneOf(i.openings, OPENINGS),
  tourDays: (i) => list(i.tourDays).length > 0 && subsetOf(i.tourDays, TOUR_DAYS),
  tourTime: (i) => between(i.tourTime, 2, LIMITS.tourTime),
  website: (i) => blank(i.website) || (between(i.website, 1, LIMITS.website) && WEB_LINK.test(text(i.website))),
  about: (i) => blank(i.about) || between(i.about, 1, LIMITS.about),
  contactName: (i) => between(i.contactName, 2, LIMITS.contact),
  role: (i) => oneOf(i.role, ROLES),
  email: (i) => between(i.email, 3, LIMITS.email) && EMAIL.test(text(i.email)),
  phone: (i) => between(i.phone, 1, LIMITS.phone) && phoneDigits(i.phone).length >= 10,
  replyLanguage: (i) => isLocale(i.replyLanguage),
  bestTime: (i) => blank(i.bestTime) || oneOf(i.bestTime, BEST_TIMES),
  heardFrom: (i) => blank(i.heardFrom) || oneOf(i.heardFrom, HEARD_FROM),
  consentAuthorised: (i) => i.consentAuthorised === true,
  consentVerify: (i) => i.consentVerify === true,
};

const openingsOf = (input: Input): Record<string, unknown> =>
  input.openingsByAge && typeof input.openingsByAge === "object" ? (input.openingsByAge as Record<string, unknown>) : {};

/** Openings only count for the ages chosen in step 1; each is optional, 0–99. */
function invalidOpenings(input: Input): FieldName[] {
  const openings = openingsOf(input);
  return AGE_GROUPS
    .filter((age) => list(input.ages).includes(age) && !blank(openings[age]) && !wholeNumber(openings[age], 0, 99))
    .map((age) => `openingsByAge.${age}` as const);
}

/** Every invalid field among `fields`, in form order. Accepts the typed form or a raw request body. */
export function invalidFields(input: object, fields: readonly FormField[]): FieldName[] {
  const values = input as Input;
  return fields.flatMap((field) => (field === "openingsByAge" ? invalidOpenings(values) : RULES[field](values) ? [] : [field]));
}

/** The first step before `step` that still has an invalid field, so a deep link cannot skip one. */
export function firstInvalidStepBefore(input: object, step: Step): Step | null {
  return STEPS.find((s) => s < step && invalidFields(input, STEP_FIELDS[s]).length > 0) ?? null;
}

/** Number of digits typed when it is not the usual 9, for a warning that does not block. */
export function licenseLengthWarning(value: unknown): number | null {
  const digits = licenseDigits(value);
  return /^\d+$/.test(digits) && digits.length !== LICENSE_DIGITS ? digits.length : null;
}

const ALL_FIELDS = STEPS.flatMap((step) => STEP_FIELDS[step]);
const optional = (value: unknown) => (blank(value) ? undefined : text(value));

/** @returns the cleaned application, or the first invalid field so the form can jump to its step */
export function parsePartnerApplication(body: unknown): { ok: true; value: PartnerApplication } | { ok: false; field: FieldName } {
  const input = (body && typeof body === "object" ? body : {}) as Input;
  const [invalid] = invalidFields(input, ALL_FIELDS);
  if (invalid) return { ok: false, field: invalid };

  const ages = AGE_GROUPS.filter((age) => list(input.ages).includes(age));
  const openings = openingsOf(input);
  return {
    ok: true,
    value: {
      programType: input.programType as LicensedType,
      daycareName: text(input.daycareName),
      licenseNumber: licenseDigits(input.licenseNumber),
      capacity: Number(typeof input.capacity === "number" ? input.capacity : text(input.capacity)),
      city: input.city as CityOption,
      ...(input.city === "other" ? { cityOther: text(input.cityOther) } : {}),
      zip: optional(input.zip),
      ages,
      languages: SPOKEN.filter((language) => list(input.languages).includes(language)),
      openings: input.openings as Openings,
      openingsByAge: Object.fromEntries(
        ages.filter((age) => !blank(openings[age])).map((age) => [age, Number(typeof openings[age] === "number" ? openings[age] : text(openings[age]))]),
      ),
      tourDays: TOUR_DAYS.filter((day) => list(input.tourDays).includes(day)),
      tourTime: text(input.tourTime),
      website: optional(input.website),
      about: optional(input.about),
      contactName: text(input.contactName),
      role: input.role as Role,
      email: text(input.email),
      phone: text(input.phone),
      replyLanguage: input.replyLanguage as Locale,
      bestTime: optional(input.bestTime) as BestTime | undefined,
      heardFrom: optional(input.heardFrom) as HeardFrom | undefined,
      consentAuthorised: true,
      consentVerify: true,
      locale: isLocale(input.locale) ? input.locale : "en",
    },
  };
}

const REFERENCE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
/** No 0/O, 1/I/L: easy to read out on the phone. */
export const REFERENCE_PATTERN = /^WM-P-[2-9A-HJKMNP-Z]{4}$/;

export function makeReference(): string {
  const random = crypto.getRandomValues(new Uint32Array(4));
  return `WM-P-${Array.from(random, (n) => REFERENCE_CHARS[n % REFERENCE_CHARS.length]).join("")}`;
}

export function emptyForm(replyLanguage: Locale, programType = ""): ApplicationForm {
  return {
    programType, daycareName: "", licenseNumber: "", capacity: "", city: "", cityOther: "", zip: "", ages: [], languages: [],
    openings: "", openingsByAge: {}, tourDays: [], tourTime: "", website: "", about: "",
    contactName: "", role: "", email: "", phone: "", replyLanguage, bestTime: "", heardFrom: "",
    consentAuthorised: false, consentVerify: false,
  };
}

/** What is kept on the device. Consents are not: they are given at submit time. */
export interface ApplicationDraft {
  v: 1;
  savedAt: string;
  step: Step;
  data: DraftData;
}

type DraftData = Omit<ApplicationForm, "consentAuthorised" | "consentVerify">;

function withoutConsents(form: ApplicationForm): DraftData {
  const data: Partial<ApplicationForm> = { ...form };
  delete data.consentAuthorised;
  delete data.consentVerify;
  return data as DraftData;
}

export function serializeDraft(form: ApplicationForm, step: Step, now = new Date()): string {
  return JSON.stringify({ v: 1, savedAt: now.toISOString(), step, data: withoutConsents(form) } satisfies ApplicationDraft);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A stored draft, or null when there is none, it cannot be read, or it is 30 days old.
 * Only known fields of the right type survive, so an edited or stale draft cannot break the form.
 */
export function parseDraft(raw: string | null, now = Date.now()): ApplicationDraft | null {
  if (!raw) return null;
  let draft: Input;
  try {
    draft = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!draft || draft.v !== 1 || typeof draft.savedAt !== "string") return null;
  const savedAt = Date.parse(draft.savedAt);
  if (!Number.isFinite(savedAt) || now - savedAt >= DRAFT_MAX_AGE_DAYS * DAY_MS) return null;

  const data = (draft.data && typeof draft.data === "object" ? draft.data : {}) as Input;
  const str = (key: string, max: number) => (typeof data[key] === "string" ? (data[key] as string).slice(0, max) : "");
  const pick = <T,>(value: unknown, options: readonly T[]) => list(value).filter((v): v is T => options.includes(v as T));
  const openings = openingsOf(data);
  const form: ApplicationForm = {
    ...emptyForm(isLocale(data.replyLanguage) ? data.replyLanguage : "en"),
    programType: oneOf(data.programType, PROGRAM_TYPES) ? (data.programType as string) : "",
    daycareName: str("daycareName", LIMITS.name),
    licenseNumber: str("licenseNumber", 2 * LIMITS.license),
    capacity: str("capacity", 4),
    city: oneOf(data.city, CITY_OPTIONS) ? (data.city as string) : "",
    cityOther: str("cityOther", LIMITS.city),
    zip: str("zip", 5),
    ages: pick(data.ages, AGE_GROUPS),
    languages: pick(data.languages, SPOKEN),
    openings: oneOf(data.openings, OPENINGS) ? (data.openings as string) : "",
    openingsByAge: Object.fromEntries(
      AGE_GROUPS.filter((age) => typeof openings[age] === "string").map((age) => [age, (openings[age] as string).slice(0, 2)]),
    ),
    tourDays: pick(data.tourDays, TOUR_DAYS),
    tourTime: str("tourTime", LIMITS.tourTime),
    website: str("website", LIMITS.website),
    about: str("about", LIMITS.about),
    contactName: str("contactName", LIMITS.contact),
    role: oneOf(data.role, ROLES) ? (data.role as string) : "",
    email: str("email", LIMITS.email),
    phone: str("phone", LIMITS.phone),
    bestTime: oneOf(data.bestTime, BEST_TIMES) ? (data.bestTime as string) : "",
    heardFrom: oneOf(data.heardFrom, HEARD_FROM) ? (data.heardFrom as string) : "",
  };
  const step = oneOf(draft.step, STEPS) ? (draft.step as Step) : 1;
  return { v: 1, savedAt: draft.savedAt, step, data: withoutConsents(form) };
}
