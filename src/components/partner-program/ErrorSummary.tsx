"use client";

import type { MouseEvent } from "react";
import { fieldId } from "@/components/partner-program/fields";

export const SUMMARY_ID = "pa-error-summary";

/** Moves focus to a field and shows it with its label, clear of the sticky header. */
export function focusField(field: string) {
  const element = document.getElementById(fieldId(field));
  if (!element) return;
  element.scrollIntoView({ block: "center" });
  element.focus({ preventScroll: true });
}

/** Shown after a failed Continue. Receives focus, so screen readers hear what to fix first. */
export function ErrorSummary({ title, items }: { title: string; items: { field: string; message: string }[] }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>, field: string) => {
    event.preventDefault();
    focusField(field);
  };
  return (
    <div
      id={SUMMARY_ID}
      role="alert"
      tabIndex={-1}
      aria-labelledby={`${SUMMARY_ID}-title`}
      className="mb-6 scroll-mt-28 rounded-2xl border-2 border-error bg-error-soft px-5 py-4 text-error"
    >
      <h2 id={`${SUMMARY_ID}-title`} className="mb-1.5 text-[17px] font-bold leading-snug">{title}</h2>
      <ul className="list-disc space-y-1 pl-5">
        {items.map(({ field, message }) => (
          <li key={field}>
            <a href={`#${fieldId(field)}`} onClick={(event) => onClick(event, field)} className="font-semibold text-error underline underline-offset-2">
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
