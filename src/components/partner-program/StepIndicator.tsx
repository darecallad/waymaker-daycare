"use client";

import { fill, joinCopy } from "@/data/partner-program";
import { useLanguage } from "@/context/LanguageContext";
import type { Step } from "@/lib/partner-application";
import { cn } from "@/lib/utils";

export const STEP_HEADING_ID = "pa-step-heading";
export const PROGRESS_WIDTHS = ["w-1/4", "w-1/2", "w-3/4", "w-full"] as const;

/**
 * Desktop: an <ol> of the four steps with aria-current="step". Mobile: "Step 2 of 4 · …" and a
 * bar. The "Step n of 4" heading is the focus target after every step change.
 */
export function StepIndicator({ step }: { step: Step }) {
  const { locale } = useLanguage();
  const t = joinCopy[locale].apply;
  return (
    <>
      <ol aria-label={t.progress} className="mb-8 hidden grid-cols-4 gap-2 md:grid">
        {t.steps.map((name, index) => {
          const n = index + 1;
          const done = n < step;
          const current = n === step;
          return (
            <li
              key={name}
              aria-current={current ? "step" : undefined}
              className={cn("grid content-start gap-2 text-sm", done ? "font-semibold text-ok" : current ? "font-bold text-ink" : "font-semibold text-text-2")}
            >
              <span aria-hidden="true" className={cn("h-1.5 rounded-full", done ? "bg-ok" : current ? "bg-ink" : "bg-stone-300")} />
              <span>
                {n}. {name}
                {done && <span className="sr-only"> {t.completed}</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <h2 id={STEP_HEADING_ID} tabIndex={-1} className="mb-2 scroll-mt-28 font-bold text-ink focus-visible:outline-none md:sr-only">
        {fill(t.stepOf, { n: step, name: t.steps[step - 1] })}
      </h2>
      <div aria-hidden="true" className="mb-6 h-1.5 overflow-hidden rounded-full bg-stone-300 md:hidden">
        <span className={cn("block h-full rounded-full bg-ink", PROGRESS_WIDTHS[step - 1])} />
      </div>
    </>
  );
}
