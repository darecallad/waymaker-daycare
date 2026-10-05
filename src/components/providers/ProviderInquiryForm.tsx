"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { INQUIRY_STAGES, INQUIRY_TYPES, hubCopy, type InquiryStage, type InquiryType } from "@/data/consulting";
import { locales } from "@/lib/i18n";
import { LIMITS } from "@/lib/provider-inquiry";
import { CONTACT } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error" | "rate-limited";

const fieldClass =
  "mt-2 block min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-[#0F3B4C] focus:border-[#0F6C8C] focus:outline-none focus:ring-2 focus:ring-[#0F6C8C]/40";
const labelClass = "block text-sm font-semibold text-[#0F3B4C]";

/** `*` for sighted users; screen readers get `required` from the input itself. */
function RequiredMark() {
  return <span aria-hidden="true" className="ml-1 text-[#B4235A]">*</span>;
}

interface ProviderInquiryFormProps {
  /** Preselect the path on a type page, and the stage from the "already licensed" journey. */
  defaultType?: InquiryType;
  defaultStage?: InquiryStage;
}

export function ProviderInquiryForm({ defaultType, defaultStage }: ProviderInquiryFormProps = {}) {
  const { locale } = useLanguage();
  const t = hubCopy[locale].form;
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/provider-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(response.ok ? "sent" : response.status === 429 ? "rate-limited" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-3xl bg-white p-10 text-center shadow-lg">
        <CheckCircle2 aria-hidden="true" className="mx-auto mb-4 h-12 w-12 text-[#2E7D5B]" />
        <h3 className="mb-2 font-serif text-2xl font-bold text-[#0F3B4C]">{t.successTitle}</h3>
        <p className="text-stone-600">{t.successBody}</p>
      </div>
    );
  }

  const failed = status === "error" || status === "rate-limited";

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl bg-white p-6 shadow-lg md:p-10" noValidate={false}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className={labelClass}>
          {t.name}<RequiredMark />
          <input name="name" required maxLength={LIMITS.name} autoComplete="name" className={fieldClass} />
        </label>
        <label className={labelClass}>
          {t.city}<RequiredMark />
          <input name="city" required maxLength={LIMITS.city} autoComplete="address-level2" className={fieldClass} />
        </label>
        <label className={labelClass}>
          {t.email}<RequiredMark />
          <input name="email" type="email" required maxLength={LIMITS.email} autoComplete="email" className={fieldClass} />
        </label>
        <label className={labelClass}>
          {t.phone}
          <input name="phone" type="tel" maxLength={LIMITS.phone} autoComplete="tel" className={fieldClass} />
        </label>
        <label className={labelClass}>
          {t.type}<RequiredMark />
          <select name="type" required defaultValue={defaultType ?? ""} className={fieldClass}>
            <option value="" disabled>—</option>
            {INQUIRY_TYPES.map((value) => <option key={value} value={value}>{t.types[value]}</option>)}
          </select>
        </label>
        <label className={labelClass}>
          {t.stage}<RequiredMark />
          <select name="stage" required defaultValue={defaultStage ?? ""} className={fieldClass}>
            <option value="" disabled>—</option>
            {INQUIRY_STAGES.map((value) => <option key={value} value={value}>{t.stages[value]}</option>)}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className={labelClass}>{t.language}</legend>
        <div className="mt-2 flex gap-3">
          {locales.map((value) => (
            <label key={value} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-stone-300 px-4 has-[:checked]:border-[#0F6C8C] has-[:checked]:bg-[#F0F9F6] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0F6C8C]">
              <input type="radio" name="language" value={value} defaultChecked={value === locale} className="h-4 w-4 accent-[#0F6C8C]" />
              <span lang={value === "zh" ? "zh-Hant" : "en"}>{t.languages[value]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={labelClass}>
        {t.message}
        <textarea name="message" rows={4} maxLength={LIMITS.message} className={fieldClass} />
      </label>

      {failed && (
        <p role="alert" className="rounded-xl bg-[#FDECEF] px-4 py-3 text-sm font-medium text-[#8A1538]">
          {status === "rate-limited" ? t.rateLimited : t.error}{" "}
          <a href={`mailto:${CONTACT.email}`} className="underline">{CONTACT.email}</a>
        </p>
      )}

      <Button
        type="submit"
        disabled={status === "sending"}
        className="h-14 w-full rounded-xl bg-[#0F3B4C] text-lg font-semibold text-white hover:bg-[#092530]"
      >
        {status === "sending" ? (
          <><Loader2 aria-hidden="true" className="mr-2 h-5 w-5 animate-spin motion-reduce:animate-none" />{t.sending}</>
        ) : t.submit}
      </Button>
      <p className="text-center text-sm text-stone-600">
        <span aria-hidden="true" className="text-[#B4235A]">*</span> {t.required} · {t.privacy}
      </p>
    </form>
  );
}
