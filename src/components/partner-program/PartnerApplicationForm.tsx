"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CircleAlert, CloudCheck, Loader2 } from "lucide-react";
import Link from "@/components/ui/link";
import { ContactStep, DaycareStep, OpeningsStep, ReviewStep } from "@/components/partner-program/ApplicationSteps";
import { ErrorSummary, SUMMARY_ID } from "@/components/partner-program/ErrorSummary";
import { ResumeDraft } from "@/components/partner-program/ResumeDraft";
import { STEP_HEADING_ID, StepIndicator } from "@/components/partner-program/StepIndicator";
import { safeStorage, useHydrated } from "@/components/partner-program/browser";
import { buttonClass, fillNodes } from "@/components/partner-program/shared";
import {
  APPLY_ROUTE, AUDIENCES, AUDIENCE_PROGRAM, DRAFT_DEBOUNCE_MS, DRAFT_KEY, JOIN_ROUTE, PROGRAM_TERMS, SENT_KEY, THANKS_ROUTE,
  audienceOf, joinCopy, plural, type Audience,
} from "@/data/partner-program";
import { useLanguage } from "@/context/LanguageContext";
import { track } from "@/lib/analytics";
import { localizePath } from "@/lib/i18n";
import {
  STEPS, STEP_FIELDS, emptyForm, firstInvalidStepBefore, invalidFields, licenseLengthWarning, parseDraft, serializeDraft, stepOfField,
  type ApplicationForm, type FieldName, type FormField, type Step,
} from "@/lib/partner-application";
import { CONTACT } from "@/lib/site";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "error" | "rate-limited";

const toStep = (value: string | null): Step | null => STEPS.find((step) => String(step) === value) ?? null;

/** Page frame shared by the form and its loading state: back link, saved status, title. */
function ApplyShell({ saved = false, children }: { saved?: boolean; children: ReactNode }) {
  const { locale } = useLanguage();
  const t = joinCopy[locale].apply;
  return (
    <div className="bg-page">
      <div className="mx-auto max-w-[720px] px-4 pb-14 pt-5 md:px-6 md:pb-24 md:pt-10">
        <div className="mb-6 flex items-center justify-between gap-4 text-sm">
          <Link href={JOIN_ROUTE} className="-ml-1 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 font-semibold text-link hover:underline">
            <ArrowLeft aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
            {t.backToJoin}
          </Link>
          <p role="status" className="inline-flex items-center gap-1.5 text-right font-semibold text-ok">
            {saved && (
              <>
                <CloudCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
                {t.saved}
              </>
            )}
          </p>
        </div>
        <h1 className="font-serif text-[28px] font-bold leading-tight text-ink md:text-4xl">{t.title}</h1>
        <p className="mb-7 mt-2 text-text-2">{fillNodes(t.sub, { star: <span className="text-error">*</span> })}</p>
        {children}
      </div>
    </div>
  );
}

const cardClass = "rounded-[20px] border border-line bg-white px-5 py-6 shadow-[0_10px_30px_-12px_rgba(15,59,76,0.18)] md:rounded-3xl md:p-10";

/** What is rendered before the browser (and with it the saved draft) is available. */
export function ApplicationSkeleton() {
  const { locale } = useLanguage();
  return (
    <ApplyShell>
      <div aria-busy="true" className={cn(cardClass, "min-h-[560px]")}>
        <span className="sr-only">{joinCopy[locale].apply.loading}</span>
      </div>
    </ApplyShell>
  );
}

/**
 * The four-step application. Step in the URL (`?step=`), so Back/Forward work; answers kept
 * in a localStorage draft on this device only, never sent before Submit.
 */
export function PartnerApplicationForm() {
  return useHydrated() ? <ApplicationFlow /> : <ApplicationSkeleton />;
}

function ApplicationFlow() {
  const { locale } = useLanguage();
  const t = joinCopy[locale].apply;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read once: a saved draft (deleted when expired or unreadable) and the ?type= preset.
  const [start] = useState(() => {
    const raw = safeStorage.read("local", DRAFT_KEY);
    const draft = parseDraft(raw);
    if (raw && !draft) safeStorage.remove("local", DRAFT_KEY);
    const type = AUDIENCES.find((audience) => audience === searchParams.get("type"));
    return { draft, preset: type ? AUDIENCE_PROGRAM[type as Audience] : "" };
  });
  const [form, setForm] = useState<ApplicationForm>(() =>
    start.draft ? { ...start.draft.data, consentAuthorised: false, consentVerify: false } : emptyForm(locale, start.preset),
  );
  // Arriving without ?step= with a draft = coming back later: ask first. A reload mid-form keeps going.
  const [resuming, setResuming] = useState(() => start.draft !== null && searchParams.get("step") === null);
  const [fallbackStep, setFallbackStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [summary, setSummary] = useState<FieldName[]>([]);
  const [licenseChecked, setLicenseChecked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const dirty = useRef(start.draft !== null);
  const started = useRef(false);
  const submitted = useRef(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingFocus = useRef<{ step: Step; id: string } | null>(null);
  const shownStep = useRef<Step | null>(null);
  const stepStartedAt = useRef(0);

  const requested = toStep(searchParams.get("step")) ?? fallbackStep;
  // A deep link or Forward cannot skip a step that is not complete.
  const step = firstInvalidStepBefore(form, requested) ?? requested;
  const stepHref = (target: Step) => localizePath(`${APPLY_ROUTE}?step=${target}`, locale);

  useEffect(() => {
    if (!resuming && searchParams.get("step") !== null && step !== requested) router.replace(stepHref(step), { scroll: false });
  });

  // Autosave 600 ms after the last change. A fresh form is only saved once something was entered.
  useEffect(() => {
    if (resuming || !dirty.current || submitted.current) return;
    const timer = setTimeout(() => {
      if (!submitted.current && safeStorage.write("local", DRAFT_KEY, serializeDraft(form, step))) setSaved(true);
    }, DRAFT_DEBOUNCE_MS);
    saveTimer.current = timer;
    return () => clearTimeout(timer);
  }, [form, step, resuming]);

  // Focus after the step changed (its heading, or the field an Edit link points to) or after a failed Continue.
  useEffect(() => {
    if (resuming) return;
    const changed = shownStep.current !== null && shownStep.current !== step;
    if (shownStep.current !== step) stepStartedAt.current = Date.now();
    shownStep.current = step;
    const pending = pendingFocus.current?.step === step ? pendingFocus.current.id : null;
    const id = pending ?? (changed ? STEP_HEADING_ID : null);
    if (!id) return;
    pendingFocus.current = null;
    const element = document.getElementById(id);
    element?.scrollIntoView({ block: id === STEP_HEADING_ID || id === SUMMARY_ID ? "start" : "center" });
    element?.focus({ preventScroll: true });
  });

  const message = (field: FieldName): string => {
    if (field.startsWith("openingsByAge.")) return t.fields.openingsByAge.error;
    if (field === "programType") return t.programType.error;
    return t.fields[field as Exclude<FieldName, "programType" | `openingsByAge.${string}`>].error;
  };

  function update<K extends FormField>(field: K, value: ApplicationForm[K]) {
    const next = { ...form, [field]: value };
    setForm(next);
    dirty.current = true;
    if (!started.current) {
      started.current = true;
      track("pr_apply_start", { type: audienceOf(next.programType) ?? "none", resumed: start.draft !== null });
    }
    if (field === "programType" && value === "not-licensed") track("pr_not_licensed", {});
    // Errors only disappear while typing; new ones wait for blur or Continue.
    const stillInvalid = new Set(invalidFields(next, STEP_FIELDS[step]));
    const fixed = (Object.keys(errors) as FieldName[]).filter((name) => !stillInvalid.has(name));
    if (fixed.length) {
      setErrors((current) => Object.fromEntries(Object.entries(current).filter(([name]) => !fixed.includes(name as FieldName))));
      setSummary((current) => current.filter((name) => !fixed.includes(name)));
    }
  }

  /** On blur, a filled-in field is checked; an empty one waits for Continue. */
  function blur(field: FieldName) {
    if (field === "licenseNumber") setLicenseChecked(true);
    const [name, age] = field.split(".") as [FormField, string?];
    const value = age ? form.openingsByAge[age as keyof ApplicationForm["openingsByAge"]] : form[name];
    if (typeof value !== "string" || value.trim() === "") return;
    const invalid = invalidFields(form, [name]).includes(field);
    if (invalid) setErrors((current) => ({ ...current, [field]: message(field) }));
  }

  function goTo(target: Step, focusId: string = STEP_HEADING_ID) {
    clearTimeout(saveTimer.current);
    if (dirty.current && safeStorage.write("local", DRAFT_KEY, serializeDraft(form, target))) setSaved(true);
    pendingFocus.current = { step: target, id: focusId };
    setErrors({});
    setSummary([]);
    setStatus("idle");
    router.push(stepHref(target), { scroll: false });
  }

  function showErrors(fields: FieldName[], onStep: Step) {
    setErrors(Object.fromEntries(fields.map((field) => [field, message(field)])));
    setSummary(fields);
    pendingFocus.current = { step: onStep, id: SUMMARY_ID };
  }

  async function submit() {
    const type = audienceOf(form.programType) ?? "family";
    setStatus("submitting");
    track("pr_submit", { type, city_in_area: form.city !== "other" });
    try {
      const response = await fetch("/api/partner-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale, company: honeypot.current?.value ?? "" }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && typeof result.reference === "string") {
        submitted.current = true;
        clearTimeout(saveTimer.current);
        safeStorage.remove("local", DRAFT_KEY);
        safeStorage.write("session", SENT_KEY, JSON.stringify({
          firstName: form.contactName.trim().split(/\s+/)[0],
          email: form.email.trim(),
          replyLanguage: form.replyLanguage,
        }));
        track("pr_submit_success", { type });
        router.push(localizePath(`${THANKS_ROUTE}?ref=${encodeURIComponent(result.reference)}`, locale));
        return;
      }
      const fieldStep = typeof result.field === "string" ? stepOfField(result.field) : null;
      track("pr_submit_error", { status: response.status === 429 ? 429 : response.status === 400 ? 400 : 500 });
      if (response.status === 400 && fieldStep) {
        setStatus("idle");
        showErrors([result.field as FieldName], fieldStep);
        if (fieldStep !== step) router.push(stepHref(fieldStep), { scroll: false });
        return;
      }
      setStatus(response.status === 429 ? "rate-limited" : "error");
    } catch {
      track("pr_submit_error", { status: "network" });
      setStatus("error");
    }
  }

  function onContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting" || form.programType === "not-licensed") return;
    const invalid = invalidFields(form, STEP_FIELDS[step]);
    if (invalid.length > 0) {
      showErrors(invalid, step);
      track("pr_step_error", { step, fields: invalid });
      return;
    }
    track("pr_step_complete", { step, ms_on_step: Date.now() - stepStartedAt.current });
    if (step < 4) goTo((step + 1) as Step);
    else void submit();
  }

  if (resuming && start.draft) {
    const draftStep = start.draft.step;
    return (
      <ResumeDraft
        draft={start.draft}
        onContinue={() => {
          track("pr_draft_resume", { step: draftStep });
          setFallbackStep(draftStep);
          setResuming(false);
          pendingFocus.current = { step: draftStep, id: STEP_HEADING_ID };
          router.replace(stepHref(draftStep), { scroll: false });
        }}
        onRestart={() => {
          track("pr_draft_restart", { step: draftStep });
          safeStorage.remove("local", DRAFT_KEY);
          dirty.current = false;
          setForm(emptyForm(locale, start.preset));
          setResuming(false);
          pendingFocus.current = { step: 1, id: STEP_HEADING_ID };
        }}
      />
    );
  }

  const submitting = status === "submitting";
  const notLicensed = step === 1 && form.programType === "not-licensed";
  const primaryLabel = step < 4 ? t.continue : submitting ? t.submitting : t.submit;
  const contactEmail = (PROGRAM_TERMS.providerContact ?? CONTACT).email;
  const stepProps = { form, locale, update, blur, error: (field: FieldName) => errors[field] ?? null };
  const primaryIcon = submitting
    ? <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" />
    : <ArrowRight aria-hidden="true" className="h-5 w-5" />;

  return (
    <ApplyShell saved={saved}>
      <form noValidate aria-busy={submitting} onSubmit={onContinue}>
        <div className={cardClass}>
          <StepIndicator step={step} />
          {summary.length > 0 && (
            <ErrorSummary
              title={plural(t.errorSummary, summary.length)}
              items={summary.map((field) => ({ field, message: errors[field] ?? message(field) }))}
            />
          )}
          <div key={step} className="grid gap-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
            {step === 1 && (
              <DaycareStep {...stepProps} licenseWarning={licenseChecked && !errors.licenseNumber ? licenseLengthWarning(form.licenseNumber) : null} />
            )}
            {step === 2 && <OpeningsStep {...stepProps} />}
            {step === 3 && <ContactStep {...stepProps} />}
            {step === 4 && <ReviewStep {...stepProps} stepHref={stepHref} onEdit={(target, id) => goTo(target, id)} />}
          </div>

          {(status === "error" || status === "rate-limited") && (
            <p role="alert" className="mt-6 flex gap-2 rounded-xl bg-error-soft px-4 py-3 font-semibold text-error">
              <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                {fillNodes(status === "rate-limited" ? t.errors.rate : t.errors.server, {
                  email: <a href={`mailto:${contactEmail}`} className="underline [overflow-wrap:anywhere]">{contactEmail}</a>,
                })}
              </span>
            </p>
          )}

          <div className="mt-8 hidden items-center justify-between gap-3 border-t border-line pt-6 md:flex">
            {step > 1 ? (
              <button type="button" onClick={() => goTo((step - 1) as Step)} disabled={submitting} className={buttonClass.outline}>
                <ArrowLeft aria-hidden="true" className="h-[18px] w-[18px]" />
                {t.back}
              </button>
            ) : <span />}
            <button type="submit" disabled={submitting || notLicensed} className={buttonClass.primaryLg}>
              {primaryLabel}
              {primaryIcon}
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 z-30 -mx-4 mt-6 flex gap-3 border-t border-line bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(15,59,76,0.25)] md:hidden">
          {step > 1 && (
            <button
              type="button"
              aria-label={t.back}
              onClick={() => goTo((step - 1) as Step)}
              disabled={submitting}
              className={cn(buttonClass.outline, "min-h-14 w-16 shrink-0 rounded-2xl px-0")}
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            </button>
          )}
          <button type="submit" disabled={submitting || notLicensed} className={cn(buttonClass.primaryLg, "flex-1 px-4")}>
            {primaryLabel}
            {submitting && primaryIcon}
          </button>
        </div>

        {/* Spam trap: hidden from people and assistive tech, filled in by bots. */}
        <div hidden>
          <label>
            Company
            <input ref={honeypot} name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
      </form>
    </ApplyShell>
  );
}
