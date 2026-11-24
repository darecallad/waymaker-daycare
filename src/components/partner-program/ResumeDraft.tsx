"use client";

import { ArrowRight } from "lucide-react";
import { PROGRESS_WIDTHS } from "@/components/partner-program/StepIndicator";
import { buttonClass, fillNodes } from "@/components/partner-program/shared";
import { fill, joinCopy } from "@/data/partner-program";
import { useLanguage } from "@/context/LanguageContext";
import type { ApplicationDraft } from "@/lib/partner-application";
import { cn } from "@/lib/utils";

/** "Welcome back": continue the draft saved on this device, or clear it (shared computers). */
export function ResumeDraft({ draft, onContinue, onRestart }: { draft: ApplicationDraft; onContinue: () => void; onRestart: () => void }) {
  const { locale } = useLanguage();
  const t = joinCopy[locale];
  const date = new Intl.DateTimeFormat(locale === "zh" ? "zh-TW" : "en-US", { month: "short", day: "numeric" }).format(new Date(draft.savedAt));
  const name = draft.data.daycareName.trim();

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-[720px] px-4 pb-14 pt-5 md:px-6 md:pb-24 md:pt-10">
        <section
          aria-labelledby="pa-resume-title"
          className="rounded-[20px] border border-line bg-white px-5 py-6 shadow-[0_10px_30px_-12px_rgba(15,59,76,0.18)] md:rounded-3xl md:p-10"
        >
          <h1 id="pa-resume-title" className="font-serif text-[28px] font-bold leading-tight text-ink md:text-4xl">{t.resume.title}</h1>
          <p className="mt-2 text-[17px] leading-relaxed text-text-2 md:text-[19px]">
            {name
              ? fillNodes(t.resume.body, { name: <b className="font-semibold text-text">{name}</b>, date })
              : fill(t.resume.bodyNoName, { date })}
          </p>
          <p className="mt-5 font-bold text-ink">{fill(t.apply.stepOf, { n: draft.step, name: t.apply.steps[draft.step - 1] })}</p>
          <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-300">
            <span className={cn("block h-full rounded-full bg-ink", PROGRESS_WIDTHS[draft.step - 1])} />
          </div>
          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <button type="button" onClick={onContinue} className={buttonClass.primaryLg}>
              {t.resume.continue}
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </button>
            <button type="button" onClick={onRestart} className={buttonClass.outlineLg}>{t.resume.restart}</button>
          </div>
          <p className="mt-4 text-sm text-text-2">{t.resume.note}</p>
        </section>
      </div>
    </div>
  );
}
