/**
 * Business terms of the partner network: the ONLY place for them. Every value comes from the
 * owner; `null` means "not decided yet" and every sentence, chip, row or FAQ answer that needs
 * it is hidden until it is filled. Never fill a value without recording where it came from.
 */
import type { Locale } from "@/lib/i18n";

export type Localized = Record<Locale, string>;

export interface ProgramTerms {
  /** Q1: what joining means. The landing page is written for "network". */
  model: "network" | "franchise" | "both" | null;
  /** Q2: one short display line per audience, e.g. the fee. */
  feeSummary: { family: Localized | null; center: Localized | null };
  /** Q3 */
  contractSummary: Localized | null;
  leaveSummary: Localized | null;
  /** Q4: minimum regular tour slots a week. */
  minTourSlotsPerWeek: number | null;
  /** Q4: e.g. insurance, years operating. Shown as an extra eligibility row. */
  extraRequirements: Localized[];
  /** Q5: applications from cities outside SERVICE_AREAS. */
  acceptOtherCities: boolean | null;
  /** Q6: business days until we call. */
  replyBusinessDays: number | null;
  /** Business days to build a profile after the call. */
  profileBusinessDays: number | null;
  /** Q7: true = Waymaker takes families' first calls and emails; false = the daycare does. */
  waymakerAnswersFirstContact: boolean | null;
  /** Q8: who takes the photos, and what it costs. */
  photoPolicy: Localized | null;
  /** Q9 */
  ownersCanEditTours: boolean | null;
  /** Q10: how one partnership covers several centers. */
  multiSite: Localized | null;
  /** Who providers should call or email with questions; null = the site-wide CONTACT. */
  providerContact: { email: string; phone: string; phoneE164: string } | null;
  /** Q11: where applications are sent. */
  inbox: string;
  /** Q12: email the applicant a copy, in the language they chose. */
  sendApplicantConfirmation: boolean;
  /** Q13: also keep each application in Redis (needed for a later status page). */
  storeApplications: boolean;
  /** Q14 */
  privacyUrl: string | null;
  /** Q15: a partner photo for the hero, with the partner's permission. */
  heroImage: { src: string; alt: Localized } | null;
  /** Option B (brand franchise) is not designed; it stays off. */
  franchise: { enabled: false };
  /** Evidence for the values above, e.g. "Owner, 2026-12 email". */
  source: string;
}

export const PROGRAM_TERMS: ProgramTerms = {
  model: null,
  feeSummary: { family: null, center: null },
  contractSummary: null,
  leaveSummary: null,
  minTourSlotsPerWeek: null,
  extraRequirements: [],
  acceptOtherCities: null,
  replyBusinessDays: null,
  profileBusinessDays: null,
  waymakerAnswersFirstContact: null,
  photoPolicy: null,
  ownersCanEditTours: null,
  multiSite: null,
  providerContact: null,
  inbox: "info@waymakerbiz.com",
  sendApplicantConfirmation: false,
  storeApplications: false,
  privacyUrl: null,
  heroImage: null,
  franchise: { enabled: false },
  source: "",
};
