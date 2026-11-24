"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import Link from "@/components/ui/link";
import { FaqSection } from "@/components/shared/FaqSection";
import { AudienceSwitch } from "@/components/partner-program/AudienceSwitch";
import { EligibilityTable } from "@/components/partner-program/EligibilityTable";
import { HowItWorks } from "@/components/partner-program/HowItWorks";
import { ProfilePreview } from "@/components/partner-program/ProfilePreview";
import { ValueCards } from "@/components/partner-program/ValueCards";
import { buttonClass, eyebrowClass, fillNodes, h2Class } from "@/components/partner-program/shared";
import { APPLY_ROUTE, PROGRAM_TERMS, getJoinFaq, joinCopy, type Audience } from "@/data/partner-program";
import { useLanguage } from "@/context/LanguageContext";
import { track } from "@/lib/analytics";
import { CONTACT } from "@/lib/site";
import { cn } from "@/lib/utils";

/** The /for-providers/join landing page. `type` comes from `?type=` on the server. */
export function JoinLanding({ type }: { type: Audience }) {
  const { locale } = useLanguage();
  const t = joinCopy[locale];
  const applyHref = `${APPLY_ROUTE}?type=${type}`;
  const image = PROGRAM_TERMS.heroImage;
  const contact = PROGRAM_TERMS.providerContact ?? CONTACT;

  // One view per visit; switching audience re-renders with a new `type` but is not a new view.
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track("pr_landing_view", { locale, type });
  }, [locale, type]);

  return (
    <>
      <section aria-labelledby="join-hero-heading" className="relative overflow-hidden bg-page py-10 md:py-[72px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_10%,#fff_40%,var(--color-sky)_100%)] opacity-20" />
        <div
          className={cn(
            "container relative mx-auto px-4 md:px-6",
            image ? "grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14" : "max-w-3xl md:text-center",
          )}
        >
          <div>
            <p className={eyebrowClass(locale)}>{t.hero.eyebrow}</p>
            <h1 id="join-hero-heading" className="font-serif text-[34px] font-bold leading-[1.12] text-ink md:text-[52px]">
              {t.hero.title}
            </h1>
            <p className={cn("mt-5 max-w-[68ch] text-[17px] leading-relaxed text-text-2 md:text-[19px]", !image && "md:mx-auto")}>
              {t.hero.lead}
            </p>
            <div className="mt-7">
              <AudienceSwitch type={type} />
            </div>
            <div className={cn("mt-8 flex flex-col gap-3 md:flex-row", !image && "md:justify-center")}>
              <Link href={applyHref} onClick={() => track("pr_cta_click", { location: "hero", type })} className={buttonClass.primaryLg}>
                {t.hero.apply}
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
              <a href="#how" className={buttonClass.outlineLg}>{t.hero.how}</a>
            </div>
            <ul className={cn("mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-text-2", !image && "md:justify-center")}>
              {t.hero.trust.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check aria-hidden="true" className="h-[18px] w-[18px] text-ok" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {image && (
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-sky-tint shadow-[0_24px_48px_-20px_rgba(15,59,76,0.28)] lg:aspect-[4/3]">
              <Image src={image.src} alt={image.alt[locale]} fill priority sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </section>

      <ValueCards type={type} />
      <HowItWorks />
      <EligibilityTable />
      <ProfilePreview />
      <FaqSection id="join-faq" eyebrow={t.faq.eyebrow} title={t.faq.title} items={getJoinFaq(locale)} />

      <section aria-labelledby="join-band-heading" className="bg-page py-14 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="focus-on-dark grid items-center gap-8 rounded-3xl bg-ink px-6 py-8 text-white md:grid-cols-[1fr_auto] md:rounded-[32px] md:p-14">
            <div>
              <h2 id="join-band-heading" className={cn(h2Class, "text-white")}>{t.band.title}</h2>
              <p className="mt-3 text-lg leading-relaxed text-white/85">
                {fillNodes(t.band.body, {
                  phone: <a href={`tel:${contact.phoneE164}`} className="whitespace-nowrap font-semibold text-white underline underline-offset-4">{contact.phone}</a>,
                  email: <a href={`mailto:${contact.email}`} className="font-semibold text-white underline underline-offset-4 [overflow-wrap:anywhere]">{contact.email}</a>,
                })}
              </p>
            </div>
            <Link href={applyHref} onClick={() => track("pr_cta_click", { location: "band", type })} className={buttonClass.sunLg}>
              {t.band.cta}
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
