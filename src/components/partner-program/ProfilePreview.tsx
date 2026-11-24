"use client";

import { ArrowRight, CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import Link from "@/components/ui/link";
import { buttonClass, eyebrowClass, h2Class } from "@/components/partner-program/shared";
import { joinCopy } from "@/data/partner-program";
import { partners } from "@/data/partners";
import { useLanguage } from "@/context/LanguageContext";
import { cityName } from "@/lib/site";

function Callout({ n }: { n: number }) {
  return (
    <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sun text-[13px] font-extrabold text-ink">
      {n}
    </span>
  );
}

function PreviewLine({ n, children }: { n: number; children: ReactNode }) {
  return (
    <span className="flex flex-wrap items-center gap-2 text-sm text-text-2">
      <Callout n={n} />
      {children}
    </span>
  );
}

/** "What families will see": numbered callouts next to a schematic profile card (decorative). */
export function ProfilePreview() {
  const { locale } = useLanguage();
  const t = joinCopy[locale].preview;
  return (
    <section aria-labelledby="join-preview-heading" className="bg-page py-14 md:py-24">
      <div className="container mx-auto grid items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className={eyebrowClass(locale)}>{t.eyebrow}</p>
          <h2 id="join-preview-heading" className={h2Class}>{t.title}</h2>
          <p className="mt-4 max-w-[68ch] text-[17px] leading-relaxed text-text-2 md:text-[19px]">{t.lead}</p>
          <ol className="mt-6 grid gap-3">
            {t.points.map((point, index) => (
              <li key={point} className="flex items-start gap-3 text-text">
                <Callout n={index + 1} />
                {point}
              </li>
            ))}
          </ol>
          <Link href={`/partners/${partners[0].slug}`} className={`${buttonClass.outline} mt-6`}>
            {t.live}
            <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" />
          </Link>
        </div>

        <div aria-hidden="true" className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_48px_-20px_rgba(15,59,76,0.28)]">
          <div className="flex aspect-[16/10] items-center justify-center gap-2 bg-[repeating-linear-gradient(135deg,var(--color-sky-tint)_0_12px,var(--color-page)_12px_24px)] text-sm font-semibold text-text-2">
            <Callout n={1} />
            {t.card.photos}
          </div>
          <div className="grid gap-2.5 px-6 pb-6 pt-5">
            <span className="font-serif text-[22px] font-bold text-ink">{t.card.name}</span>
            <PreviewLine n={2}>
              <ShieldCheck aria-hidden="true" className="h-[18px] w-[18px] text-link" />
              {t.card.license} ·
              <MapPin aria-hidden="true" className="h-[18px] w-[18px] text-link" />
              {cityName("Sunnyvale", locale)}
            </PreviewLine>
            <PreviewLine n={3}>
              <CalendarDays aria-hidden="true" className="h-[18px] w-[18px] text-link" />
              {t.card.tours}
            </PreviewLine>
            <PreviewLine n={4}>{t.card.languages}</PreviewLine>
            <span className="mt-2 flex min-h-12 items-center justify-center rounded-xl bg-ink font-semibold text-white">{t.card.book}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
