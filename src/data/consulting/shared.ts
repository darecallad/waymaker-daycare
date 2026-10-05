/**
 * Facts shared by every provider page. Rules, because people spend real money on these:
 * - Regulatory facts come from an official CDSS source in `OFFICIAL_SOURCES`, phrased no
 *   more strongly than the source.
 * - Business claims (prices, track record) come from the owner and live ONLY here, so
 *   one edit updates every page, the JSON-LD and llms.txt. Keep evidence for them.
 * - Timelines are Waymaker estimates, deliberately generous, and always labelled as such.
 */
import type { Locale } from "@/lib/i18n";

/** When the regulatory facts were last checked against the official sources. */
export const FACTS_VERIFIED = "2026-10";

/** Owner-supplied (Oct 2026). Monthly partnership fee per path, USD. */
export const PRICING = {
  family: { monthly: 900 },
  center: { monthly: 2100 },
} as const;

/** Owner-supplied (Oct 2026): ~20 licensing projects; 20+ daycares worked with. */
export const TRACK_RECORD = { licensedHelped: 20, daycaresWorkedWith: 20 } as const;

export const formatUsd = (amount: number) => `$${amount.toLocaleString("en-US")}`;

export const OFFICIAL_SOURCES = {
  howTo: {
    url: "https://www.cdss.ca.gov/inforesources/child-care-licensing/how-to-become-licensed",
    en: "CDSS: How to become licensed",
    zh: "加州社會服務部（CDSS）：如何取得執照",
  },
  orientation: {
    url: "https://www.cdss.ca.gov/inforesources/child-care-licensing/how-to-become-licensed/register-for-an-orientation",
    en: "CDSS: Register for a licensing orientation",
    zh: "CDSS：報名執照說明會",
  },
  capacity: {
    url: "https://www.cdss.ca.gov/Portals/9/CCLD/CCP%20Documents/Capacity%20Requirements%20FCCHs.pdf",
    en: "CDSS: Family child care home capacity requirements (PDF)",
    zh: "CDSS：家庭托兒所收托人數規定（PDF）",
  },
  fcchSteps: {
    url: "https://www.cdss.ca.gov/Portals/9/CCLD/CCP%20Documents/family-child-care-home-application-steps.pdf",
    en: "CDSS: Family child care home application steps (PDF)",
    zh: "CDSS：家庭托兒所申請步驟（PDF）",
  },
  centerSteps: {
    url: "https://www.cdss.ca.gov/Portals/9/CCLD/CCP%20Documents/child-care-center-license-application-steps.pdf",
    en: "CDSS: Child care center application steps (PDF)",
    zh: "CDSS：托兒中心申請步驟（PDF）",
  },
  liveScan: {
    url: "https://www.cdss.ca.gov/inforesources/Community-Care/Caregiver-Background-Check/LiveScan",
    en: "CDSS: Live Scan background checks",
    zh: "CDSS：Live Scan 背景審查",
  },
  regulations: {
    url: "https://www.cdss.ca.gov/inforesources/Child-Care-Licensing/Resources-for-Providers/Laws-and-Regulations",
    en: "CDSS: Child care laws and regulations (Title 22)",
    zh: "CDSS：托育法規（Title 22）",
  },
} as const;
export type SourceKey = keyof typeof OFFICIAL_SOURCES;

/** The two licence paths. Ids are used in URLs, form values and anchors. */
export const PATHS = ["family", "center"] as const;
export type ProviderPath = (typeof PATHS)[number];
export const PATH_ROUTES: Record<ProviderPath, string> = {
  family: "/for-providers/family-daycare",
  center: "/for-providers/child-care-center",
};
export const TIMELINE_ROUTE = "/for-providers/licensing-timeline";

/** What the inquiry form asks for. Shared by the form and the API validator. */
export const INQUIRY_TYPES = ["family", "center", "not-sure"] as const;
export const INQUIRY_STAGES = ["exploring", "have-location", "applying", "licensed"] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];
export type InquiryStage = (typeof INQUIRY_STAGES)[number];

/** Per-locale "per month" and price line, so every page formats prices identically. */
export function priceLine(path: ProviderPath, locale: Locale): string {
  const amount = formatUsd(PRICING[path].monthly);
  return locale === "zh" ? `每月 ${amount}` : `${amount} / month`;
}
