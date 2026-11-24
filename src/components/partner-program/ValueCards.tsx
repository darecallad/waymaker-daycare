"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "@/components/ui/link";
import { AUDIENCE_ICONS } from "@/components/partner-program/AudienceSwitch";
import { eyebrowClass, fillNodes, h2Class, h3Class } from "@/components/partner-program/shared";
import { PROGRAM_TERMS, joinCopy, plural, type Audience } from "@/data/partner-program";
import { useLanguage } from "@/context/LanguageContext";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function CheckList({ items, locale }: { items: { title?: string; body: string }[]; locale: Locale }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item.body} className="grid grid-cols-[22px_1fr] items-start gap-2.5">
          <Check aria-hidden="true" className="mt-1 h-5 w-5 text-ok" />
          <span className="text-text">
            {item.title && <b className="text-ink">{item.title}</b>}
            {item.title && locale === "en" && " "}
            {item.body}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** What the chosen audience gets, and what it needs. Lines that depend on an open owner decision are left out. */
export function ValueCards({ type }: { type: Audience }) {
  const { locale } = useLanguage();
  const t = joinCopy[locale].value;
  const terms = PROGRAM_TERMS;
  const card = t[type];
  const Icon = AUDIENCE_ICONS[type];
  const fee = terms.feeSummary[type]?.[locale];

  const benefits = [...card.benefits];
  if (type === "family" && terms.waymakerAnswersFirstContact) benefits.push(t.family.fewerCalls);
  if (type === "center" && terms.multiSite) benefits.push({ title: t.center.multiSite, body: terms.multiSite[locale] });

  const tours = terms.minTourSlotsPerWeek ? plural(t.minTourSlots, terms.minTourSlotsPerWeek) : t.tourSlots;
  const photos = (line: string) => (terms.photoPolicy ? `${line}${locale === "zh" ? "。" : ". "}${terms.photoPolicy[locale]}` : line);
  const needs = [...t.need[type].slice(0, 2), photos(t.need[type][2]), tours];

  return (
    <section aria-labelledby="join-value-heading" className="bg-white py-14 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10 text-center">
          <p className={eyebrowClass(locale)}>{t.eyebrow[type]}</p>
          <h2 id="join-value-heading" className={h2Class}>{t.title}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <article
            aria-labelledby="join-value-card"
            className={cn("flex flex-col gap-4 rounded-3xl p-6 md:p-8", type === "family" ? "bg-mint-tint" : "bg-sky-tint")}
          >
            <div className="flex items-center gap-4">
              <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white", type === "family" ? "bg-ok" : "bg-ink")}>
                <Icon aria-hidden="true" className="h-7 w-7" />
              </span>
              <div>
                <h3 id="join-value-card" className={h3Class}>{card.name}</h3>
                <p className="text-text-2">{card.sub}</p>
              </div>
            </div>
            <CheckList items={benefits} locale={locale} />
            {fee && (
              <p className="mt-auto pt-2 text-sm text-text-2">
                {t.terms} <b className="font-semibold text-ink">{fee}</b>
              </p>
            )}
          </article>

          <article aria-labelledby="join-need" className="flex flex-col gap-4 rounded-3xl border-[1.5px] border-line bg-white p-6 md:p-8">
            <h3 id="join-need" className={h3Class}>{t.needTitle}</h3>
            <CheckList items={needs.map((body) => ({ body }))} locale={locale} />
            <a href="#eligibility" className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-link underline-offset-4 hover:underline">
              {t.fullRequirements}
              <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" />
            </a>
          </article>
        </div>
        <p className="mt-6 text-center text-[15px] text-text-2">
          {fillNodes(t.consulting, {
            link: (
              <Link href="/for-providers" className="font-semibold text-link underline underline-offset-4">
                {t.consultingLink}
              </Link>
            ),
          })}
        </p>
      </div>
    </section>
  );
}
