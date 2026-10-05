"use client";

import { ArrowRight, Building2, Check, ExternalLink, Home, Languages, MapPin, ShieldAlert, Sparkles, Users } from "lucide-react";
import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/shared/FaqSection";
import { ProviderInquiryForm } from "@/components/providers/ProviderInquiryForm";
import { useLanguage } from "@/context/LanguageContext";
import { FACTS_VERIFIED, OFFICIAL_SOURCES, consultingCopy, getConsultingFaq } from "@/data/consulting";

const WHY_ICONS = [Languages, MapPin, Users, Sparkles];
const eyebrowClass = "mb-3 text-sm font-semibold uppercase tracking-widest text-[#0F6C8C]";
const h2Class = "font-serif text-3xl font-bold text-[#0F3B4C] md:text-4xl";

export function ProvidersContent() {
  const { locale } = useLanguage();
  const t = consultingCopy[locale];
  const faqCopy = locale === "zh" ? { eyebrow: "開園常問", title: "常見問題" } : { eyebrow: "Questions owners ask", title: "Frequently Asked Questions" };
  const sourceLinkNote = locale === "zh" ? "（在新分頁開啟，英文網站）" : "(opens in a new tab)";

  const paths = [
    { id: "family", icon: Home, data: t.compare.family, services: t.services.family },
    { id: "center", icon: Building2, data: t.compare.center, services: t.services.center },
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#F5F7FA] pb-20 pt-16 md:pt-24">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_10%,#fff_40%,#73BBD1_100%)] opacity-20" />
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-6">
          <p className={eyebrowClass}>{t.hero.eyebrow}</p>
          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-[#0F3B4C] md:text-5xl">{t.hero.title}</h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-stone-600">{t.hero.lead}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 rounded-2xl bg-[#0F3B4C] px-8 text-base font-semibold text-white hover:bg-[#092530]">
              <a href="#consultation">{t.hero.primary}<ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" /></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-2xl border-[#0F3B4C]/30 px-8 text-base font-semibold text-[#0F3B4C]">
              <a href="#compare">{t.hero.secondary}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Family home vs center */}
      <section id="compare" aria-labelledby="compare-heading" className="scroll-mt-24 bg-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className={eyebrowClass}>{t.compare.eyebrow}</p>
            <h2 id="compare-heading" className={h2Class}>{t.compare.title}</h2>
            <p className="mt-4 text-lg text-stone-600">{t.compare.intro}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {paths.map(({ id, icon: Icon, data }) => (
              <article key={id} aria-labelledby={`${id}-card`} className="flex flex-col rounded-3xl border border-stone-200 bg-[#F8FAF9] p-8">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F3B4C] text-white"><Icon aria-hidden="true" className="h-7 w-7" /></span>
                  <h3 id={`${id}-card`} className="font-serif text-2xl font-bold text-[#0F3B4C]">{data.name}</h3>
                </div>
                <dl className="flex-1 space-y-5">
                  <div><dt className="font-semibold text-[#0F3B4C]">{t.compare.rowLabels.where}</dt><dd className="mt-1 text-stone-600">{data.where}</dd></div>
                  <div>
                    <dt className="font-semibold text-[#0F3B4C]">{t.compare.rowLabels.size}</dt>
                    {data.size.map((line) => <dd key={line} className="mt-1 text-stone-600">{line}</dd>)}
                  </div>
                  <div><dt className="font-semibold text-[#0F3B4C]">{t.compare.rowLabels.process}</dt><dd className="mt-1 text-stone-600">{data.process}</dd></div>
                  <div><dt className="font-semibold text-[#0F3B4C]">{t.compare.rowLabels.fits}</dt><dd className="mt-1 text-stone-600">{data.fits}</dd></div>
                </dl>
                <a href={`#${id}-services`} className="mt-8 inline-flex min-h-11 items-center font-semibold text-[#0F6C8C] underline-offset-4 hover:underline">
                  {data.cta}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-stone-600">
            {t.compare.sourceNote} <a href="#sources" className="font-semibold text-[#0F6C8C] underline">{t.sources.title}</a>
          </p>
        </div>
      </section>

      {/* Services per path */}
      <section aria-labelledby="services-heading" className="bg-[#F5F7FA] py-20">
        <div className="container mx-auto px-4 md:px-6">
          <p className={`${eyebrowClass} text-center`}>{t.services.eyebrow}</p>
          <h2 id="services-heading" className="sr-only">{t.services.eyebrow}</h2>
          <div className="space-y-16">
            {paths.map(({ id, icon: Icon, services }) => (
              <div key={id} id={`${id}-services`} className="scroll-mt-24">
                <h3 className="mb-8 flex items-center justify-center gap-3 font-serif text-3xl font-bold text-[#0F3B4C]">
                  <Icon aria-hidden="true" className="h-7 w-7 text-[#0F6C8C]" />{services.title}
                </h3>
                <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {services.items.map((item) => (
                    <li key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
                      <h4 className="mb-2 flex items-start gap-2 text-lg font-bold text-[#0F3B4C]">
                        <Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#2E7D5B]" />{item.title}
                      </h4>
                      <p className="leading-relaxed text-stone-600">{item.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* After licensing: the network */}
      <section aria-labelledby="after-heading" className="relative overflow-hidden bg-[#0F3B4C] py-20 text-white">
        <div aria-hidden="true" className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#73BBD1] opacity-20 blur-[120px]" />
        <div className="container relative mx-auto grid items-center gap-10 px-4 md:px-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A9DDEC]">{t.after.eyebrow}</p>
            <h2 id="after-heading" className="mb-6 font-serif text-3xl font-bold md:text-4xl">{t.after.title}</h2>
            <p className="text-lg leading-relaxed text-white/85">{t.after.body}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-8 backdrop-blur">
            <ul className="mb-8 space-y-4">
              {t.after.points.map((point) => (
                <li key={point} className="flex items-start gap-3"><Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#FFD166]" />{point}</li>
              ))}
            </ul>
            <Button asChild className="h-12 rounded-xl bg-[#FFD166] px-6 font-semibold text-[#0F3B4C] hover:bg-[#ffc94a]">
              <Link href="/partners">{t.after.cta}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why us + steps */}
      <section aria-labelledby="why-heading" className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <p className={eyebrowClass}>{t.why.eyebrow}</p>
            <h2 id="why-heading" className={h2Class}>{t.why.title}</h2>
          </div>
          <ul className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.why.items.map((item, index) => {
              const Icon = WHY_ICONS[index];
              return (
                <li key={item.title} className="rounded-2xl bg-[#F8FAF9] p-6">
                  <Icon aria-hidden="true" className="mb-4 h-8 w-8 text-[#0F6C8C]" />
                  <h3 className="mb-2 text-lg font-bold text-[#0F3B4C]">{item.title}</h3>
                  <p className="leading-relaxed text-stone-600">{item.body}</p>
                </li>
              );
            })}
          </ul>

          <div className="mb-12 text-center">
            <p className={eyebrowClass}>{t.steps.eyebrow}</p>
            <h2 className={h2Class}>{t.steps.title}</h2>
          </div>
          <ol className="grid gap-6 md:grid-cols-4">
            {t.steps.items.map((step, index) => (
              <li key={step.title} className="relative rounded-2xl border border-stone-200 p-6">
                <span aria-hidden="true" className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD166] font-bold text-[#0F3B4C]">{index + 1}</span>
                <h3 className="mb-2 text-lg font-bold text-[#0F3B4C]">{step.title}</h3>
                <p className="leading-relaxed text-stone-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Honest limits */}
      <section aria-labelledby="honest-heading" className="bg-[#FFF8E6] py-14">
        <div className="container mx-auto flex max-w-4xl gap-5 px-4 md:px-6">
          <ShieldAlert aria-hidden="true" className="mt-1 h-8 w-8 shrink-0 text-[#8A5A00]" />
          <div>
            <h2 id="honest-heading" className="mb-3 font-serif text-2xl font-bold text-[#0F3B4C]">{t.honest.title}</h2>
            <p className="leading-relaxed text-stone-700">{t.honest.body}</p>
          </div>
        </div>
      </section>

      {/* Consultation form */}
      <section id="consultation" aria-labelledby="consultation-heading" className="scroll-mt-24 bg-[#F5F7FA] py-20">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <div className="mb-10 text-center">
            <p className={eyebrowClass}>{t.form.eyebrow}</p>
            <h2 id="consultation-heading" className={h2Class}>{t.form.title}</h2>
            <p className="mt-4 text-lg text-stone-600">{t.form.intro}</p>
          </div>
          <ProviderInquiryForm />
        </div>
      </section>

      <FaqSection id="provider-faq" eyebrow={faqCopy.eyebrow} title={faqCopy.title} items={getConsultingFaq(locale)} />

      {/* Official sources */}
      <section id="sources" aria-labelledby="sources-heading" className="scroll-mt-24 border-t border-stone-200 bg-white py-14">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 id="sources-heading" className="mb-4 font-serif text-2xl font-bold text-[#0F3B4C]">{t.sources.title}</h2>
          <ul className="space-y-2">
            {OFFICIAL_SOURCES.map((source) => (
              <li key={source.key}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-medium text-[#0F6C8C] underline-offset-4 hover:underline">
                  {source[locale]}<ExternalLink aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only"> {sourceLinkNote}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-stone-600">{t.sources.verified}: {FACTS_VERIFIED}</p>
        </div>
      </section>
    </>
  );
}
