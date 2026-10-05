"use client";

import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/data/faq";

interface FaqSectionProps {
  eyebrow: string;
  title: string;
  /** Pass the same list that feeds the page's FAQPage JSON-LD, so the two never drift. */
  items: FaqItem[];
  id?: string;
}

/** Visible FAQ accordion. Answers stay in the DOM when collapsed, so crawlers read them. */
export function FaqSection({ eyebrow, title, items, id = "faq" }: FaqSectionProps) {
  const t = { eyebrow, title };

  return (
    <section aria-labelledby={`${id}-heading`} id={id} className="bg-white py-20 md:py-24">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-[#0F6C8C]">{t.eyebrow}</p>
        <h2 id={`${id}-heading`} className="mb-12 text-center font-serif text-3xl font-bold text-[#0F3B4C] md:text-4xl">
          {t.title}
        </h2>
        <div className="space-y-4">
          {items.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-stone-200 bg-[#F8FAF9] open:border-[#73BBD1] open:bg-white open:shadow-md"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-6 py-4 font-semibold text-[#0F3B4C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6C8C] [&::-webkit-details-marker]:hidden">
                <h3 className="text-base md:text-lg">{item.question}</h3>
                <ChevronDown
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <p className="px-6 pb-6 leading-relaxed text-stone-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
