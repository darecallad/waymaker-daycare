"use client";

import { eyebrowClass, h2Class, h3Class } from "@/components/partner-program/shared";
import { PROGRAM_TERMS, fill, joinCopy, plural } from "@/data/partner-program";
import { useLanguage } from "@/context/LanguageContext";

export function HowItWorks() {
  const { locale } = useLanguage();
  const t = joinCopy[locale].how;
  const days = (n: number | null) => (n ? plural(t.days, n) : null);
  const reply = days(PROGRAM_TERMS.replyBusinessDays);
  const profile = days(PROGRAM_TERMS.profileBusinessDays);
  // A step's time chip is shown only when the owner has given that time.
  const chips = [t.applyTime, reply && fill(t.within, { days: reply }), profile && fill(t.about, { days: profile }), null];

  return (
    <section id="how" aria-labelledby="join-how-heading" className="scroll-mt-20 bg-page py-14 md:scroll-mt-[100px] md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <p className={eyebrowClass(locale)}>{t.eyebrow}</p>
          <h2 id="join-how-heading" className={h2Class}>{t.title}</h2>
        </div>
        <ol className="mt-8 grid gap-3 md:mt-12 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {t.steps.map((step, index) => (
            <li key={step.title} className="rounded-3xl bg-white px-6 py-7 shadow-sm">
              <span aria-hidden="true" className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-ink font-bold text-white">
                {index + 1}
              </span>
              <h3 className={h3Class}>{step.title}</h3>
              <p className="mt-2 text-text-2">{step.body}</p>
              {chips[index] && (
                <p className="mt-3 inline-block rounded-lg bg-sun-soft px-2 py-0.5 text-sm font-semibold text-amber">{chips[index]}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
