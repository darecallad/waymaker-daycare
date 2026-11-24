"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Check } from "lucide-react";
import Link from "@/components/ui/link";
import { safeStorage, useHydrated } from "@/components/partner-program/browser";
import { buttonClass, fillNodes } from "@/components/partner-program/shared";
import { PROGRAM_TERMS, SENT_KEY, fill, joinCopy, plural } from "@/data/partner-program";
import { useLanguage } from "@/context/LanguageContext";
import { isLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Sent {
  firstName: string;
  email: string;
  replyLanguage: Locale | null;
}

/** Name and email are handed over in this tab's sessionStorage, never in the URL. */
function readSent(): Sent | null {
  try {
    const value = JSON.parse(safeStorage.read("session", SENT_KEY) ?? "null");
    if (!value || typeof value.firstName !== "string" || typeof value.email !== "string") return null;
    return { firstName: value.firstName, email: value.email, replyLanguage: isLocale(value.replyLanguage) ? value.replyLanguage : null };
  } catch {
    return null;
  }
}

/** Confirmation after a submitted application. `reference` is already validated by the page. */
export function ApplicationThanks({ reference }: { reference: string | null }) {
  const { locale } = useLanguage();
  const copy = joinCopy[locale];
  const t = copy.thanks;
  const hydrated = useHydrated();
  const sent = useMemo(() => (hydrated ? readSent() : null), [hydrated]);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => heading.current?.focus(), []);

  const days = PROGRAM_TERMS.replyBusinessDays ? plural(copy.how.days, PROGRAM_TERMS.replyBusinessDays) : null;
  const language = sent?.replyLanguage ? t.languages[sent.replyLanguage] : null;
  const call = days && language ? fill(t.check.both, { days, lang: language })
    : days ? fill(t.check.days, { days })
    : language ? fill(t.check.lang, { lang: language })
    : null;
  const steps = [
    { title: t.received.title, body: t.received.body, done: true },
    { title: t.check.title, body: call, done: false },
    { title: t.profile.title, body: t.profile.body, done: false },
    { title: t.live.title, body: t.live.body, done: false },
  ];

  const sentences: ReactNode[] = [];
  if (sent) {
    sentences.push(fill(t.thankYou, { name: sent.firstName }));
    sentences.push(fillNodes(PROGRAM_TERMS.sendApplicantConfirmation ? t.sentCopy : t.willContact, { email: <b className="text-text [overflow-wrap:anywhere]">{sent.email}</b> }));
  }
  if (reference) sentences.push(fillNodes(t.reference, { ref: <b className="whitespace-nowrap text-text">{reference}</b> }));

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-[720px] px-4 pb-14 pt-5 md:px-6 md:pb-24 md:pt-10">
        <section className="rounded-[20px] border border-line bg-white px-5 py-8 text-center shadow-[0_10px_30px_-12px_rgba(15,59,76,0.18)] md:rounded-3xl md:p-10">
          <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-mint-soft motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:fade-in motion-safe:duration-300">
            <Check aria-hidden="true" className="h-9 w-9 text-ok" />
          </div>
          <h1 ref={heading} tabIndex={-1} className="font-serif text-[28px] font-bold leading-tight text-ink focus-visible:outline-none md:text-4xl">
            {t.title}
          </h1>
          {sentences.length > 0 && (
            <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-text-2 md:text-[19px]">
              {sentences.map((sentence, index) => (
                <span key={index}>
                  {index > 0 && locale === "en" ? " " : ""}
                  {sentence}
                </span>
              ))}
            </p>
          )}

          <div className="mx-auto mt-8 max-w-[460px] text-left">
            <h2 className="font-serif text-xl font-bold text-ink md:text-[22px]">{t.next}</h2>
            <ol className="mt-5">
              {steps.map((step, index) => (
                <li key={step.title} className="relative grid grid-cols-[32px_1fr] gap-4 pb-5 last:pb-0">
                  {index < steps.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-line" />}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                      step.done ? "bg-ok text-white" : "bg-sky-tint text-ink",
                    )}
                  >
                    {step.done ? <Check aria-hidden="true" className="h-4 w-4" /> : index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{step.title}</p>
                    {step.body && <p className="text-text-2">{step.body}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 md:flex-row">
            <Link href="/partners" className={buttonClass.primary}>{t.partners}</Link>
            <Link href="/" className={buttonClass.outline}>{t.home}</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
