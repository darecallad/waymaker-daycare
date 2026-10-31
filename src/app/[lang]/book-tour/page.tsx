"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "@/components/ui/link";
import { bookTourCopy, partnerText } from "@/components/booking/book-tour-copy";
import { TourDetailsStep } from "@/components/booking/TourDetailsStep";
import { ParentInfoStep, type ParentField } from "@/components/booking/ParentInfoStep";
import { SummaryRow, TourSummary, slotLabel } from "@/components/booking/TourSummary";
import { partners } from "@/data/partners";
import { bookingErrorMessage } from "@/lib/booking-errors";
import { buildTourMessage, validateTour, type TourErrors, type TourField } from "@/lib/tour-form";
import { compactTime, generateAvailableSlots } from "@/lib/tour-slots";
import type { TourSlot } from "@/lib/types";

const FIELD_FOCUS: Record<TourField, string> = {
  daycare: "location",
  date: "date-legend",
  name: "name",
  phone: "phone",
  email: "email",
  childAge: "childAge",
};

function BookTourContent() {
  const { locale } = useLanguage();
  const t = bookTourCopy[locale] ?? bookTourCopy.en;
  const [submitted, setSubmitted] = useState<{ slot: TourSlot; slug: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPartnerSlug, setSelectedPartnerSlug] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<TourErrors>({});
  // Bumped to force an availability refetch after a rejected submission
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  // Live (owner-managed) availability; falls back to the static partner data on failure
  const [liveSettings, setLiveSettings] = useState<{ tourHours: string; blockedDates: string[] } | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    // Read ?partner= after hydration instead of useSearchParams, which forced the whole
    // page into a client-only Suspense fallback: crawlers saw a spinner and no heading.
    const partnerParam = new URLSearchParams(window.location.search).get("partner");
    if (partnerParam && partners.some((p) => p.slug === partnerParam)) {
      setSelectedPartnerSlug(partnerParam);
    }
  }, []);

  const selectedPartner = useMemo(() => partners.find((p) => p.slug === selectedPartnerSlug), [selectedPartnerSlug]);

  // Live availability: an owner may have changed their hours or closed a date after the
  // page was loaded, so the schedule is fetched instead of trusting the bundled data.
  useEffect(() => {
    if (!selectedPartnerSlug) {
      setLiveSettings(null);
      return;
    }

    let cancelled = false;

    // Drop the previous daycare's schedule immediately, otherwise its dates stay on screen
    // under the newly selected daycare's name until (or unless) the fetch resolves.
    setLiveSettings(null);
    setLoadingSlots(true);

    const loadAvailability = async () => {
      try {
        const response = await fetch(`/api/tour-availability?slug=${encodeURIComponent(selectedPartnerSlug)}`);
        if (!response.ok) return;

        const result = await response.json();
        if (!cancelled) {
          setLiveSettings({ tourHours: result.tourHours, blockedDates: result.blockedDates });
        }
      } catch (error) {
        // Keep the statically bundled schedule as a fallback
        console.error("Failed to load live availability:", error);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [selectedPartnerSlug, availabilityVersion]);

  const availableSlots = useMemo(() => {
    const settings = liveSettings ?? (selectedPartner
      ? { tourHours: selectedPartner.tourHours, blockedDates: selectedPartner.blockedDates || [] }
      : null);

    if (!settings?.tourHours) return [];

    return generateAvailableSlots(settings, { locale });
  }, [liveSettings, selectedPartner, locale]);

  const selectedSlot = availableSlots.find((slot) => slot.value === selectedDate);

  // Drop a selection that has just been closed by the daycare
  useEffect(() => {
    if (selectedDate && !loadingSlots && !selectedSlot) {
      setSelectedDate("");
    }
  }, [selectedDate, selectedSlot, loadingSlots]);

  const clearError = (field: TourField) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const focusField = (field: TourField) => {
    const el = document.getElementById(FIELD_FOCUS[field]);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    el?.focus({ preventScroll: true });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    const formData = new FormData(e.currentTarget);
    const value = (key: string) => String(formData.get(key) ?? "");
    const found = validateTour(
      {
        daycare: selectedPartnerSlug,
        date: selectedSlot ? selectedDate : "",
        name: value("name"),
        phone: value("phone"),
        email: value("email"),
        childAge: value("childAge"),
      },
      t.errors,
    );
    setErrors(found);
    const first = Object.keys(found)[0] as TourField | undefined;
    if (first) {
      focusField(first);
      return;
    }

    setIsSubmitting(true);
    const slot = selectedSlot as TourSlot;
    const data = {
      name: value("name"),
      phone: value("phone"),
      email: value("email"),
      category: "Daycare",
      locale,
      preferredDate: slot.value,
      tourTime: slot.time,
      organization: selectedPartner?.name,
      daycareSlug: selectedPartnerSlug,
      message: buildTourMessage({
        childAge: value("childAge"),
        daycareName: selectedPartner?.name,
        date: slot.value,
        time: slot.time,
        language: value("language"),
        notes: value("notes"),
      }),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitted({ slot, slug: selectedPartnerSlug });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const result = await response.json().catch(() => ({}));
      setSubmitError(bookingErrorMessage(result.code, locale));

      // 409 means the daycare closed this date (or changed its hours) while the form was open
      if (response.status === 409) {
        setSelectedDate("");
        setAvailabilityVersion((version) => version + 1);
        requestAnimationFrame(() => focusField("date"));
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(bookingErrorMessage(undefined, locale));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    const done = partners.find((p) => p.slug === submitted.slug);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] p-6">
        <div role="status" className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="h-2 w-full bg-[#0F3B4C]" />
          <div className="px-8 py-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#D2EFE5]">
              <Check aria-hidden="true" className="h-10 w-10 text-[#2F7D4F]" />
            </div>
            <h1 className="mb-4 font-serif text-3xl font-bold text-[#0F3B4C]">{t.success.title}</h1>
            <p className="mb-6 text-lg leading-relaxed text-[#57534E]">{t.success.message}</p>
            <dl className="mb-8 rounded-2xl bg-[#F0F9F6] px-5 pb-4 pt-1 text-left">
              {done && <SummaryRow term={t.summary.daycare} value={partnerText(done, locale).name} />}
              <SummaryRow term={t.success.requested} value={`${slotLabel(submitted.slot, locale)} · ${submitted.slot.time}`} />
            </dl>
            <Link
              href="/partners"
              className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#0F3B4C] text-lg font-bold text-white hover:bg-[#092530] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0F6C8C]"
            >
              {t.success.back}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const short = selectedPartner && partnerText(selectedPartner, locale).shortName;

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-12 md:pb-16">
      <div className="relative overflow-hidden bg-[#0F3B4C] px-4 pb-[72px] pt-8 text-center text-white md:pb-28 md:pt-14">
        <div aria-hidden="true" className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#73BBD1] opacity-20 blur-[120px]" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-[#A8D5BA] opacity-20 blur-[100px]" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="font-serif text-[30px] font-bold leading-tight md:text-[44px]">{t.title}</h1>
          <p className="mt-3 hidden text-lg leading-relaxed text-[#A9DDEC] md:block">{t.subtitle}</p>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-12 grid max-w-[1120px] gap-8 px-3 md:-mt-[72px] md:px-6 lg:grid-cols-[1fr_360px]">
        <form id="tour-form" onSubmit={handleSubmit} noValidate className="min-w-0 space-y-5">
          {submitError && (
            <div role="alert" className="rounded-[14px] border-[1.5px] border-[#B91C1C] bg-[#FEF2F2] px-4 py-3 font-semibold text-[#B91C1C]">
              {submitError}
            </div>
          )}

          <TourDetailsStep
            t={t}
            locale={locale}
            partner={selectedPartner}
            onPartnerChange={(slug) => {
              setSelectedPartnerSlug(slug);
              setSelectedDate("");
              clearError("daycare");
            }}
            slots={availableSlots}
            loadingSlots={loadingSlots}
            selectedDate={selectedDate}
            onDateChange={(date) => {
              setSelectedDate(date);
              clearError("date");
            }}
            errors={errors}
          />

          <ParentInfoStep
            t={t}
            locale={locale}
            errors={errors}
            onEdit={(field: ParentField) => clearError(field)}
            submitting={isSubmitting}
          />
        </form>

        <TourSummary t={t} locale={locale} partner={selectedPartner} slot={selectedSlot} />
      </div>

      {selectedSlot && (
        <div data-mobile-cta className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-[#E7E5E4] bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(15,59,76,0.25)] md:hidden">
          <p className="min-w-0 flex-1 text-[13px] leading-snug">
            <b className="block text-[15px] text-[#0F3B4C]">{slotLabel(selectedSlot, locale)}</b>
            <span className="block truncate text-[#57534E]">{compactTime(selectedSlot.time)} · {short}</span>
          </p>
          <button
            type="submit"
            form="tour-form"
            disabled={isSubmitting}
            className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-[#0F3B4C] px-5 font-bold text-white focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0F6C8C] disabled:opacity-70"
          >
            {isSubmitting ? t.form.submitting : t.form.submit}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BookTourPage() {
  return <BookTourContent />;
}
