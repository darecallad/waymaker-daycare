"use client";

import { SourceLink } from "@/components/providers/sections";
import { useLanguage } from "@/context/LanguageContext";
import { timelineCopy, type ProviderPath } from "@/data/consulting";

/** Ordered licensing steps for one path, each with its estimate and official source. */
export function TimelineList({ path, headingLevel: Heading = "h3" }: { path: ProviderPath; headingLevel?: "h3" | "h4" }) {
  const { locale } = useLanguage();
  const t = timelineCopy[locale];
  const steps = t.paths[path].steps;

  return (
    <ol className="relative space-y-6 border-l-2 border-sky/50 pl-8">
      {steps.map((step, index) => (
        <li key={step.title} className="relative">
          <span aria-hidden="true" className="absolute -left-[3.05rem] flex h-9 w-9 items-center justify-center rounded-full bg-sun font-bold text-ink">
            {index + 1}
          </span>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <Heading className="text-lg font-bold text-ink">{step.title}</Heading>
              <span className="rounded-full bg-mint-tint px-3 py-1 text-sm font-semibold text-ok">{step.duration}</span>
            </div>
            <p className="leading-relaxed text-stone-600">{step.body}</p>
            <p className="text-sm"><SourceLink source={step.source} label={t.officialLink} /></p>
          </div>
        </li>
      ))}
    </ol>
  );
}
