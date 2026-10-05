"use client";

import { AlertTriangle, Building2, Home } from "lucide-react";
import Link from "@/components/ui/link";
import { ConsultationSection, ConsultCta, PageHero, SourcesSection, h2Class } from "@/components/providers/sections";
import { TimelineList } from "@/components/providers/TimelineList";
import { useLanguage } from "@/context/LanguageContext";
import { PATHS, PATH_ROUTES, pathCopy, timelineCopy } from "@/data/consulting";

const ICONS = { family: Home, center: Building2 } as const;

/** /for-providers/licensing-timeline: both paths side by side, every step sourced. */
export function TimelinePage() {
  const { locale } = useLanguage();
  const t = timelineCopy[locale];

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
        <p className="mx-auto mt-6 max-w-2xl rounded-2xl bg-[#FFF8E6] px-5 py-3 text-sm text-stone-700">{t.disclaimer}</p>
      </PageHero>

      <section aria-label={t.title} className="bg-white py-20">
        <div className="container mx-auto grid gap-16 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          {PATHS.map((path) => {
            const Icon = ICONS[path];
            const p = pathCopy[locale][path];
            return (
              <div key={path} id={path} className="scroll-mt-24">
                <h2 className={`${h2Class} mb-2 flex items-center gap-3`}><Icon aria-hidden="true" className="h-8 w-8 text-[#0F6C8C]" />{p.name}</h2>
                <p className="mb-8 text-lg text-stone-600">
                  {p.capacityHeadline} · {t.totalLabel}: <strong className="text-[#0F3B4C]">{t.paths[path].total}</strong>
                </p>
                <TimelineList path={path} headingLevel="h3" />
                <p className="mt-6">
                  <Link href={PATH_ROUTES[path]} className="inline-flex min-h-11 items-center font-semibold text-[#0F6C8C] underline-offset-4 hover:underline">{p.cta}</Link>
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="slow-heading" className="bg-[#F5F7FA] py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 id="slow-heading" className="mb-6 flex items-center gap-3 font-serif text-2xl font-bold text-[#0F3B4C]">
            <AlertTriangle aria-hidden="true" className="h-6 w-6 text-[#8A5A00]" />{t.slowDownTitle}
          </h2>
          <ul className="mb-10 list-disc space-y-2 pl-6 text-stone-700">
            {t.slowDown.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <ConsultCta label={t.cta} />
        </div>
      </section>

      <ConsultationSection />
      <SourcesSection />
    </>
  );
}
