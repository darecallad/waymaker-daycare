"use client";

/**
 * Building blocks shared by the provider hub, the two path pages and the timeline page,
 * so the honest-limits notice, the sources list, the form section and the case studies
 * read the same everywhere and are edited in one place.
 */
import { ArrowRight, ExternalLink, ShieldAlert } from "lucide-react";
import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { ProviderInquiryForm } from "@/components/providers/ProviderInquiryForm";
import { useLanguage } from "@/context/LanguageContext";
import { FACTS_VERIFIED, OFFICIAL_SOURCES, hubCopy, type InquiryStage, type InquiryType, type SourceKey } from "@/data/consulting";
import { partners } from "@/data/partners";

export const eyebrowClass = "mb-3 text-sm font-semibold uppercase tracking-widest text-[#0F6C8C]";
export const h2Class = "font-serif text-3xl font-bold text-[#0F3B4C] md:text-4xl";

export function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-[#F5F7FA] pb-16 pt-16 md:pt-24">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_10%,#fff_40%,#73BBD1_100%)] opacity-20" />
      <div className="container mx-auto max-w-4xl px-4 text-center md:px-6">
        <p className={eyebrowClass}>{eyebrow}</p>
        <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-[#0F3B4C] md:text-5xl">{title}</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-stone-600">{lead}</p>
        {children}
      </div>
    </section>
  );
}

/** Primary CTA that jumps to the consultation form on the same page. */
export function ConsultCta({ label, className = "" }: { label: string; className?: string }) {
  return (
    <Button asChild size="lg" className={`h-14 rounded-2xl bg-[#0F3B4C] px-8 text-base font-semibold text-white hover:bg-[#092530] ${className}`}>
      <a href="#consultation">{label}<ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" /></a>
    </Button>
  );
}

/** Real partner daycares as case studies. Every one listed is an active partner. */
export function NetworkShowcase({ count = 3 }: { count?: number }) {
  const { locale } = useLanguage();
  const t = hubCopy[locale].network;
  return (
    <section aria-labelledby="network-heading" className="bg-white py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className={eyebrowClass}>{t.eyebrow}</p>
          <h2 id="network-heading" className={h2Class}>{t.title}</h2>
          <p className="mt-4 text-lg text-stone-600">{t.body}</p>
        </div>
        <ul className="grid gap-8 md:grid-cols-3">
          {partners.slice(0, count).map((partner) => (
            <li key={partner.slug} className="flex"><PartnerCard partner={partner} headingLevel="h3" /></li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <Link href="/partners" className="inline-flex min-h-11 items-center font-semibold text-[#0F6C8C] underline-offset-4 hover:underline">
            {t.cta}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HonestLimits() {
  const { locale } = useLanguage();
  const t = hubCopy[locale].honest;
  return (
    <section aria-labelledby="honest-heading" className="bg-[#FFF8E6] py-14">
      <div className="container mx-auto flex max-w-4xl gap-5 px-4 md:px-6">
        <ShieldAlert aria-hidden="true" className="mt-1 h-8 w-8 shrink-0 text-[#8A5A00]" />
        <div>
          <h2 id="honest-heading" className="mb-3 font-serif text-2xl font-bold text-[#0F3B4C]">{t.title}</h2>
          <p className="leading-relaxed text-stone-700">{t.body}</p>
        </div>
      </div>
    </section>
  );
}

export function ConsultationSection(props: { defaultType?: InquiryType; defaultStage?: InquiryStage }) {
  const { locale } = useLanguage();
  const t = hubCopy[locale].form;
  return (
    <section id="consultation" aria-labelledby="consultation-heading" className="scroll-mt-24 bg-[#F5F7FA] py-20">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <p className={eyebrowClass}>{t.eyebrow}</p>
          <h2 id="consultation-heading" className={h2Class}>{t.title}</h2>
          <p className="mt-4 text-lg text-stone-600">{t.intro}</p>
        </div>
        <ProviderInquiryForm {...props} />
      </div>
    </section>
  );
}

/** Link to one official source, for inline citations. */
export function SourceLink({ source, label }: { source: SourceKey; label?: string }) {
  const { locale } = useLanguage();
  const s = OFFICIAL_SOURCES[source];
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-medium text-[#0F6C8C] underline underline-offset-4">
      {label ?? s[locale]}<ExternalLink aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only"> {hubCopy[locale].sources.newTab}</span>
    </a>
  );
}

export function SourcesSection({ keys = Object.keys(OFFICIAL_SOURCES) as SourceKey[] }: { keys?: SourceKey[] }) {
  const { locale } = useLanguage();
  const t = hubCopy[locale].sources;
  return (
    <section id="sources" aria-labelledby="sources-heading" className="scroll-mt-24 border-t border-stone-200 bg-white py-14">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <h2 id="sources-heading" className="mb-4 font-serif text-2xl font-bold text-[#0F3B4C]">{t.title}</h2>
        <ul className="space-y-1">
          {keys.map((key) => <li key={key}><SourceLink source={key} /></li>)}
        </ul>
        <p className="mt-6 text-sm text-stone-600">{t.verified}: {FACTS_VERIFIED}</p>
      </div>
    </section>
  );
}
