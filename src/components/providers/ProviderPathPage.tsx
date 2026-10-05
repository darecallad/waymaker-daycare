"use client";

import { ArrowRight, Check, Clock, Wallet } from "lucide-react";
import Link from "@/components/ui/link";
import { ConsultationSection, ConsultCta, HonestLimits, NetworkShowcase, PageHero, SourceLink, SourcesSection, eyebrowClass, h2Class } from "@/components/providers/sections";
import { TimelineList } from "@/components/providers/TimelineList";
import { useLanguage } from "@/context/LanguageContext";
import { PATHS, PATH_ROUTES, TIMELINE_ROUTE, hubCopy, pathCopy, priceLine, timelineCopy, type ProviderPath } from "@/data/consulting";

const LABELS = {
  en: { whoFor: "Who it is for", capacity: "How many children", budget: "Budget", services: "What we do", pricing: "Partnership", timeline: "Licensing timeline", fullTimeline: "Full timeline with sources", other: "Looking for the other path?", source: "Source" },
  zh: { whoFor: "適合誰", capacity: "可以收幾個孩子", budget: "預算", services: "我們做什麼", pricing: "合作費用", timeline: "執照時間表", fullTimeline: "完整時間表與官方來源", other: "想看另一種類型？", source: "來源" },
};

/** One licence path in depth. Used by /for-providers/family-daycare and /child-care-center. */
export function ProviderPathPage({ path }: { path: ProviderPath }) {
  const { locale } = useLanguage();
  const p = pathCopy[locale][path];
  const hub = hubCopy[locale];
  const timeline = timelineCopy[locale];
  const l = LABELS[locale];
  const other = PATHS.find((candidate) => candidate !== path)!;

  return (
    <>
      <PageHero eyebrow={p.slugLabel} title={p.meta.title} lead={p.meta.socialDescription}>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ConsultCta label={p.cta} />
          <p className="text-lg font-bold text-[#0F3B4C]">{priceLine(path, locale)}</p>
        </div>
      </PageHero>

      {/* Capacity + who it is for + budget */}
      <section aria-labelledby="fit-heading" className="bg-white py-20">
        <div className="container mx-auto grid gap-8 px-4 md:px-6 lg:grid-cols-3">
          <h2 id="fit-heading" className="sr-only">{l.whoFor}</h2>
          <div className="rounded-3xl bg-[#F8FAF9] p-8">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#0F6C8C]">{l.capacity}</h3>
            <p className="mb-4 font-serif text-3xl font-bold text-[#0F3B4C]">{p.capacityHeadline}</p>
            <ul className="space-y-2 text-sm leading-relaxed text-stone-600">
              {p.capacityDetail.map((line) => <li key={line}>{line}</li>)}
            </ul>
            {path === "family" && <p className="mt-3 text-sm">{l.source}: <SourceLink source="capacity" /></p>}
          </div>
          <div className="rounded-3xl bg-[#F8FAF9] p-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#0F6C8C]">{l.whoFor}</h3>
            <ul className="space-y-3">
              {p.whoFor.map((line) => (
                <li key={line} className="flex items-start gap-2 text-stone-700"><Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#2E7D5B]" />{line}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-[#F8FAF9] p-8">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F6C8C]"><Wallet aria-hidden="true" className="h-4 w-4" />{l.budget}</h3>
            <p className="mb-4 leading-relaxed text-stone-700">{p.budgetNote}</p>
            <p className="text-sm text-stone-600">{hub.pricingNote}</p>
          </div>
        </div>
      </section>

      {/* Services + price */}
      <section aria-labelledby="services-heading" className="bg-[#F5F7FA] py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <p className={eyebrowClass}>{p.name}</p>
            <h2 id="services-heading" className={h2Class}>{l.services}</h2>
          </div>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {p.services.map((item) => (
              <li key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-2 flex items-start gap-2 text-lg font-bold text-[#0F3B4C]"><Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#2E7D5B]" />{item.title}</h3>
                <p className="leading-relaxed text-stone-600">{item.body}</p>
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-12 max-w-2xl rounded-3xl bg-[#0F3B4C] p-8 text-center text-white">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#A9DDEC]">{l.pricing}</p>
            <p className="my-2 font-serif text-4xl font-bold">{priceLine(path, locale)}</p>
            <p className="mb-6 text-white/85">{p.included}</p>
            <a href="#consultation" className="inline-flex min-h-12 items-center rounded-xl bg-[#FFD166] px-6 font-semibold text-[#0F3B4C] hover:bg-[#ffc94a]">
              {p.cta}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Timeline for this path */}
      <section aria-labelledby="timeline-heading" className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <div className="mb-10 text-center">
            <p className={eyebrowClass}><Clock aria-hidden="true" className="mr-1 inline h-4 w-4" />{l.timeline}</p>
            <h2 id="timeline-heading" className={h2Class}>{timeline.totalLabel}: {timeline.paths[path].total}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-stone-600">{timeline.disclaimer}</p>
          </div>
          <TimelineList path={path} headingLevel="h3" />
          <p className="mt-8 text-center">
            <Link href={TIMELINE_ROUTE} className="inline-flex min-h-11 items-center font-semibold text-[#0F6C8C] underline-offset-4 hover:underline">
              {l.fullTimeline}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
            </Link>
          </p>
        </div>
      </section>

      <NetworkShowcase />
      <HonestLimits />
      <ConsultationSection defaultType={path} />

      <nav aria-label={l.other} className="bg-white py-10 text-center">
        <p className="mb-2 text-stone-600">{l.other}</p>
        <Link href={PATH_ROUTES[other]} className="inline-flex min-h-11 items-center font-semibold text-[#0F6C8C] underline-offset-4 hover:underline">
          {pathCopy[locale][other].name}: {pathCopy[locale][other].capacityHeadline}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
        </Link>
      </nav>

      <SourcesSection keys={path === "family" ? ["howTo", "orientation", "capacity", "fcchSteps", "liveScan", "regulations"] : ["howTo", "orientation", "centerSteps", "liveScan", "regulations"]} />
    </>
  );
}
