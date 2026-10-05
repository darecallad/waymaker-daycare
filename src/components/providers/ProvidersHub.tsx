"use client";

import { ArrowRight, Building2, Check, Clock, Home, Languages, MapPin, Rocket, Sparkles, TrendingUp, Users } from "lucide-react";
import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/shared/FaqSection";
import { ConsultationSection, ConsultCta, HonestLimits, NetworkShowcase, PageHero, SourcesSection, eyebrowClass, h2Class } from "@/components/providers/sections";
import { useLanguage } from "@/context/LanguageContext";
import { PATHS, PATH_ROUTES, TIMELINE_ROUTE, getConsultingFaq, hubCopy, pathCopy, priceLine } from "@/data/consulting";

const PATH_ICONS = { family: Home, center: Building2 } as const;
const WHY_ICONS = [Languages, MapPin, Users, Sparkles];

export function ProvidersHub() {
  const { locale } = useLanguage();
  const t = hubCopy[locale];
  const paths = pathCopy[locale];

  return (
    <>
      <PageHero eyebrow={t.hero.eyebrow} title={t.hero.title} lead={t.hero.lead}>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-semibold text-[#0F3B4C] shadow-sm">
          <Check aria-hidden="true" className="h-5 w-5 text-[#2E7D5B]" />{t.hero.stat}
        </p>
      </PageHero>

      {/* Two journeys: start vs grow */}
      <section aria-labelledby="journeys-heading" className="bg-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 id="journeys-heading" className={`${h2Class} mb-10 text-center`}>{t.journeys.title}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {([
              { key: "start", icon: Rocket, data: t.journeys.start, href: "#types" },
              { key: "grow", icon: TrendingUp, data: t.journeys.grow, href: "#grow" },
            ] as const).map(({ key, icon: Icon, data, href }) => (
              <a key={key} href={href} className="group flex flex-col rounded-3xl border-2 border-stone-200 bg-[#F8FAF9] p-8 transition-colors hover:border-[#0F6C8C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6C8C]">
                <Icon aria-hidden="true" className="mb-4 h-10 w-10 text-[#0F6C8C]" />
                <h3 className="mb-2 font-serif text-2xl font-bold text-[#0F3B4C]">{data.title}</h3>
                <p className="mb-6 flex-1 text-stone-600">{data.body}</p>
                <span className="inline-flex items-center font-semibold text-[#0F6C8C]">
                  {data.cta}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Start: two types */}
      <section id="types" aria-labelledby="types-heading" className="scroll-mt-24 bg-[#F5F7FA] py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className={eyebrowClass}>{t.types.eyebrow}</p>
            <h2 id="types-heading" className={h2Class}>{t.types.title}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {PATHS.map((path) => {
              const Icon = PATH_ICONS[path];
              const p = paths[path];
              return (
                <article key={path} aria-labelledby={`${path}-type`} className="flex flex-col rounded-3xl bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F3B4C] text-white"><Icon aria-hidden="true" className="h-7 w-7" /></span>
                    <div>
                      <h3 id={`${path}-type`} className="font-serif text-2xl font-bold text-[#0F3B4C]">{p.name}</h3>
                      <p className="text-stone-600">{p.short}</p>
                    </div>
                  </div>
                  <dl className="mb-8 flex-1 space-y-4">
                    <div><dt className="text-sm font-semibold text-stone-500">{t.types.capacity}</dt><dd className="text-2xl font-bold text-[#0F3B4C]">{p.capacityHeadline}</dd></div>
                    <div><dt className="text-sm font-semibold text-stone-500">{t.types.where}</dt><dd className="text-stone-700">{p.where}</dd></div>
                    <div><dt className="text-sm font-semibold text-stone-500">{t.types.price}</dt><dd className="text-xl font-bold text-[#0F3B4C]">{priceLine(path, locale)}</dd></div>
                  </dl>
                  <Button asChild className="h-12 rounded-xl bg-[#0F3B4C] font-semibold text-white hover:bg-[#092530]">
                    <Link href={PATH_ROUTES[path]}>{t.types.learnMore}: {p.name}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </article>
              );
            })}
          </div>
          <p className="mt-6 text-center text-sm text-stone-600">{t.pricingNote} {t.types.sourceNote}</p>

          {/* Timeline teaser */}
          <div className="mt-12 flex flex-col items-center gap-6 rounded-3xl border border-[#73BBD1]/40 bg-white p-8 text-center md:flex-row md:text-left">
            <Clock aria-hidden="true" className="h-12 w-12 shrink-0 text-[#0F6C8C]" />
            <div className="flex-1">
              <h3 className="mb-2 font-serif text-2xl font-bold text-[#0F3B4C]">{t.timeline.title}</h3>
              <p className="text-stone-600">{t.timeline.body}</p>
            </div>
            <Button asChild variant="outline" className="h-12 shrink-0 rounded-xl border-[#0F3B4C]/30 font-semibold text-[#0F3B4C]">
              <Link href={TIMELINE_ROUTE}>{t.timeline.cta}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Grow: already licensed */}
      <section id="grow" aria-labelledby="grow-heading" className="relative scroll-mt-24 overflow-hidden bg-[#0F3B4C] py-20 text-white">
        <div aria-hidden="true" className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#73BBD1] opacity-20 blur-[120px]" />
        <div className="container relative mx-auto px-4 md:px-6">
          <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-[#A9DDEC]">{t.grow.eyebrow}</p>
          <h2 id="grow-heading" className="mb-12 text-center font-serif text-3xl font-bold md:text-4xl">{t.grow.title}</h2>
          <ul className="mb-10 grid gap-6 md:grid-cols-3">
            {t.grow.items.map((item) => (
              <li key={item.title} className="rounded-2xl bg-white/10 p-6">
                <h3 className="mb-2 flex items-start gap-2 text-lg font-bold"><Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#FFD166]" />{item.title}</h3>
                <p className="leading-relaxed text-white/85">{item.body}</p>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <Button asChild className="h-12 rounded-xl bg-[#FFD166] px-6 font-semibold text-[#0F3B4C] hover:bg-[#ffc94a]">
              <a href="#consultation">{t.grow.cta}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></a>
            </Button>
          </div>
        </div>
      </section>

      <NetworkShowcase />

      <section aria-labelledby="why-heading" className="bg-[#F5F7FA] py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <p className={eyebrowClass}>{t.why.eyebrow}</p>
            <h2 id="why-heading" className={h2Class}>{t.why.title}</h2>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.why.items.map((item, index) => {
              const Icon = WHY_ICONS[index];
              return (
                <li key={item.title} className="rounded-2xl bg-white p-6">
                  <Icon aria-hidden="true" className="mb-4 h-8 w-8 text-[#0F6C8C]" />
                  <h3 className="mb-2 text-lg font-bold text-[#0F3B4C]">{item.title}</h3>
                  <p className="leading-relaxed text-stone-600">{item.body}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-12 text-center"><ConsultCta label={t.form.submit} /></div>
        </div>
      </section>

      <HonestLimits />
      <ConsultationSection />
      <FaqSection id="provider-faq" eyebrow={t.faq.eyebrow} title={t.faq.title} items={getConsultingFaq(locale)} />
      <SourcesSection />
    </>
  );
}
