/**
 * Validation for the provider consulting inquiry. Pure so it is unit-tested without
 * Redis or SMTP, and shared field limits keep the form and the API in agreement.
 */
import { INQUIRY_STAGES, INQUIRY_TYPES, type InquiryStage, type InquiryType } from "@/data/consulting";
import { isLocale, type Locale } from "@/lib/i18n";

export const LIMITS = { name: 100, email: 254, phone: 30, city: 80, message: 2000 } as const;

export interface ProviderInquiry {
  name: string;
  email: string;
  phone: string;
  city: string;
  type: InquiryType;
  stage: InquiryStage;
  language: Locale;
  message: string;
}

// Deliberately loose: real validation is the reply landing. Rejects obvious junk only.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim().length <= max ? value.trim() : null;

const oneOf = <T extends string>(value: unknown, options: readonly T[]): T | null =>
  options.includes(value as T) ? (value as T) : null;

/** @returns the cleaned inquiry, or the name of the first invalid field */
export function parseProviderInquiry(body: unknown): { ok: true; value: ProviderInquiry } | { ok: false; field: string } {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const name = text(input.name, LIMITS.name);
  if (!name) return { ok: false, field: "name" };
  const email = text(input.email, LIMITS.email);
  if (!email || !EMAIL.test(email)) return { ok: false, field: "email" };
  const phone = text(input.phone ?? "", LIMITS.phone);
  if (phone === null) return { ok: false, field: "phone" };
  const city = text(input.city, LIMITS.city);
  if (!city) return { ok: false, field: "city" };
  const type = oneOf(input.type, INQUIRY_TYPES);
  if (!type) return { ok: false, field: "type" };
  const stage = oneOf(input.stage, INQUIRY_STAGES);
  if (!stage) return { ok: false, field: "stage" };
  const language = isLocale(input.language) ? input.language : null;
  if (!language) return { ok: false, field: "language" };
  const message = text(input.message ?? "", LIMITS.message);
  if (message === null) return { ok: false, field: "message" };

  return { ok: true, value: { name, email, phone, city, type, stage, language, message } };
}
