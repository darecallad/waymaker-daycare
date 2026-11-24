"use client";

import { Loader2 } from "lucide-react";
import { CONTACT } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { BookTourCopy } from "./book-tour-copy";
import { FieldError, StepCard, fieldClass } from "./form-parts";

export type ParentField = "name" | "phone" | "email" | "childAge";
export type ParentErrors = Partial<Record<ParentField, string>>;

interface ParentInfoStepProps {
  t: BookTourCopy;
  locale: "en" | "zh";
  errors: ParentErrors;
  /** Clears a field's error as soon as the parent edits it. */
  onEdit: (field: ParentField) => void;
  submitting: boolean;
}

const FIELDS: { id: ParentField; type: string; autoComplete?: string; inputMode?: "tel" | "email" }[] = [
  { id: "name", type: "text", autoComplete: "name" },
  { id: "phone", type: "tel", autoComplete: "tel", inputMode: "tel" },
  { id: "email", type: "email", autoComplete: "email", inputMode: "email" },
  { id: "childAge", type: "text" },
];

/** Step 2: contact details, preferred language, optional notes and the submit button. */
export function ParentInfoStep({ t, locale, errors, onEdit, submitting }: ParentInfoStepProps) {
  return (
    <StepCard step={2} title={t.sections.parent} headingId="step-parent">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {FIELDS.map(({ id, type, autoComplete, inputMode }) => (
          <div key={id}>
            <label htmlFor={id} className="mb-1.5 block font-semibold text-text">{t.form[id]}</label>
            <input
              id={id}
              name={id}
              type={type}
              autoComplete={autoComplete}
              inputMode={inputMode}
              aria-required="true"
              aria-invalid={errors[id] ? true : undefined}
              aria-describedby={errors[id] ? `${id}-error` : undefined}
              placeholder={id === "childAge" ? t.form.childAgePlaceholder : undefined}
              onChange={() => errors[id] && onEdit(id)}
              className={cn(fieldClass(Boolean(errors[id])), "h-12")}
            />
            <FieldError id={`${id}-error`} message={errors[id]} />
          </div>
        ))}
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 font-semibold text-text">{t.form.language}</legend>
        <div className="flex flex-wrap gap-2">
          {(["en", "zh", "both"] as const).map((value) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="language"
                value={value}
                defaultChecked={value === locale}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-field bg-white px-4 font-semibold text-text transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus motion-reduce:transition-none">
                {t.languages[value]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="notes" className="mb-1.5 block font-semibold text-text">
          {t.form.notes} <span className="text-sm font-medium text-text-3">{t.form.optional}</span>
        </label>
        <textarea id="notes" name="notes" rows={4} className={cn(fieldClass(), "min-h-24 resize-y py-3")} />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-lg font-bold text-white shadow-lg shadow-ink/20 transition-colors hover:bg-ink-hover disabled:opacity-70 motion-reduce:transition-none"
      >
        {submitting && <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" />}
        {submitting ? t.form.submitting : t.form.submit}
      </button>
      <p className="mt-3 text-center text-sm text-text-2">
        {t.form.confirm} {t.form.preferCall}{" "}
        <a href={`tel:${CONTACT.phoneE164}`} className="font-semibold text-link underline underline-offset-2">
          {CONTACT.phone}
        </a>
      </p>
    </StepCard>
  );
}
