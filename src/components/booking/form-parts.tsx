import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared input look: 1.5px #8A847E border (3.70:1), red when invalid, 3px focus ring. */
export const fieldClass = (invalid?: boolean) =>
  cn(
    "w-full scroll-mb-24 rounded-xl border-[1.5px] bg-white px-3.5 text-base text-[#1C1917] placeholder:text-[#78716C] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0F6C8C]",
    invalid ? "border-[#B91C1C]" : "border-[#8A847E]",
  );

/** Inline validation message referenced by the field's aria-describedby. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-semibold text-[#B91C1C]">
      {message}
    </p>
  );
}

interface StepCardProps {
  step: 1 | 2;
  title: string;
  /** Label of the following step, shown as an outlined dot (step 1 only). */
  next?: string;
  headingId: string;
  children: ReactNode;
}

/** White card with the "1 Tour Details — 2 Parent Information" indicator and an <h2>. */
export function StepCard({ step, title, next, headingId, children }: StepCardProps) {
  return (
    <section
      aria-labelledby={headingId}
      className="scroll-mt-28 rounded-3xl border border-[#E7E5E4] bg-white p-5 shadow-[0_10px_30px_-12px_rgba(15,59,76,0.18)] md:p-8"
    >
      <div className="mb-4 flex items-center gap-3 text-sm font-bold text-[#57534E]">
        <StepDot n={step} />
        <h2 id={headingId} className="font-serif text-xl font-bold text-[#0F3B4C] md:text-2xl">{title}</h2>
        {next && (
          <span className="ml-auto hidden items-center gap-2 sm:flex" aria-hidden="true">
            <span className="h-px w-8 bg-[#E7E5E4]" />
            <StepDot n={2} outline />
            <span>{next}</span>
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function StepDot({ n, outline }: { n: number; outline?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
        outline ? "bg-white text-[#0F3B4C] ring-[1.5px] ring-inset ring-[#0F3B4C]" : "bg-[#0F3B4C] text-white",
      )}
    >
      {n}
    </span>
  );
}
