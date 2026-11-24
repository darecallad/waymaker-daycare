/**
 * Product analytics events. No analytics library is installed yet, so `track()` does nothing
 * in production; wire it to Vercel Analytics or GA4 here once one is chosen.
 *
 * Never add personal data to an event: no names, emails, phones, licence numbers or daycare
 * names. The props below are the whole allowed vocabulary.
 */
import type { Audience } from "@/data/partner-program/options";
import type { Locale } from "@/lib/i18n";

type CtaLocation = "hero" | "band" | "partners_banner" | "home" | "footer" | "hub_card" | "hub_grow";

export interface AnalyticsEvents {
  pr_landing_view: { locale: Locale; type: Audience };
  pr_audience_switch: { to: Audience };
  pr_cta_click: { location: CtaLocation; type?: Audience };
  pr_apply_start: { type: Audience | "none"; resumed: boolean };
  pr_draft_resume: { step: number };
  pr_draft_restart: { step: number };
  pr_step_complete: { step: number; ms_on_step: number };
  pr_step_error: { step: number; fields: string[] };
  pr_not_licensed: Record<string, never>;
  pr_submit: { type: Audience; city_in_area: boolean };
  pr_submit_success: { type: Audience };
  pr_submit_error: { status: 400 | 429 | 500 | "network" };
}

export function track<E extends keyof AnalyticsEvents>(name: E, props: AnalyticsEvents[E]): void {
  if (process.env.NODE_ENV === "development") console.debug("[analytics]", name, props);
}
