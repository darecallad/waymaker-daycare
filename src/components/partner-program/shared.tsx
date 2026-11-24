import { Fragment, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Section eyebrow. Chinese is not uppercased and keeps a tighter letter-spacing. */
export const eyebrowClass = (locale: Locale) =>
  cn("mb-3 text-[13px] font-bold text-link", locale === "zh" ? "tracking-[0.04em]" : "uppercase tracking-[0.14em]");

export const h2Class = "font-serif text-[28px] font-bold leading-tight text-ink md:text-4xl";
export const h3Class = "font-serif text-xl font-bold leading-snug text-ink md:text-[22px]";

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-text-2 disabled:shadow-none";

export const buttonClass = {
  primary: cn(buttonBase, "min-h-12 rounded-xl bg-ink px-6 text-white hover:bg-ink-hover"),
  primaryLg: cn(buttonBase, "min-h-14 rounded-2xl bg-ink px-8 text-[17px] text-white hover:bg-ink-hover"),
  outline: cn(buttonBase, "min-h-12 rounded-xl bg-white px-6 text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] hover:bg-mint-tint"),
  outlineLg: cn(buttonBase, "min-h-14 rounded-2xl bg-white px-8 text-[17px] text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] hover:bg-mint-tint"),
  sunLg: cn(buttonBase, "min-h-14 rounded-2xl bg-sun px-8 text-[17px] text-ink hover:bg-sun-hover"),
};

/** A copy template such as "Call {phone} or email {email}." with React nodes in the slots. */
export function fillNodes(template: string, nodes: Record<string, ReactNode>): ReactNode {
  return template.split(/(\{\w+\})/).map((part, index) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    return <Fragment key={index}>{key && key in nodes ? nodes[key] : part}</Fragment>;
  });
}

/** External link that says it opens a new tab, so a half-filled form is never navigated away from. */
export function NewTabLink({ href, children, newTab, className }: { href: string; children: ReactNode; newTab: string; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn("font-semibold text-link underline underline-offset-4", className)}>
      {children}
      <ExternalLink aria-hidden="true" className="ml-1 inline h-4 w-4 align-[-2px]" />
      <span className="sr-only"> {newTab}</span>
    </a>
  );
}
