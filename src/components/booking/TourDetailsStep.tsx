"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { Calendar, Check, ChevronRight, Clock, MapPin } from "lucide-react";
import { partners } from "@/data/partners";
import { CONTACT } from "@/lib/site";
import { compactTime, formatSlotDate } from "@/lib/tour-slots";
import type { Partner, TourSlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { partnerText, type BookTourCopy } from "./book-tour-copy";
import { FieldError, StepCard } from "./form-parts";

interface TourDetailsStepProps {
  t: BookTourCopy;
  locale: "en" | "zh";
  partner: Partner | undefined;
  onPartnerChange: (slug: string) => void;
  slots: TourSlot[];
  loadingSlots: boolean;
  selectedDate: string;
  onDateChange: (value: string) => void;
  errors: { daycare?: string; date?: string };
}

const NEXT = new Set(["ArrowRight", "ArrowDown"]);
const PREV = new Set(["ArrowLeft", "ArrowUp"]);

/** Step 1: which daycare (chosen row or select) and which date (radiogroup of slots). */
export function TourDetailsStep({
  t, locale, partner, onPartnerChange, slots, loadingSlots, selectedDate, onDateChange, errors,
}: TourDetailsStepProps) {
  const [picking, setPicking] = useState(false);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const showSelect = !partner || picking;
  const text = partner && partnerText(partner, locale);
  const selectedIndex = slots.findIndex((slot) => slot.value === selectedDate);

  // ARIA radio pattern: arrows move focus and selection together, wrapping at the ends; Home/End jump.
  const onSlotKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = NEXT.has(event.key) ? 1 : PREV.has(event.key) ? -1 : 0;
    let target = step ? (index + step + slots.length) % slots.length : -1;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = slots.length - 1;
    if (target < 0) return;
    event.preventDefault();
    onDateChange(slots[target].value);
    slotRefs.current[target]?.focus();
  };

  return (
    <StepCard step={1} title={t.sections.tour} next={t.sections.parent} headingId="step-tour">
      {text && !picking && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border-[1.5px] border-ink bg-mint-tint p-3 md:gap-4">
          {partner.images[0] && (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl md:h-[72px] md:w-[72px]">
              <Image src={partner.images[0]} alt="" fill sizes="72px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg font-bold leading-snug text-ink">{text.name}</p>
            <p className="hidden text-sm text-text-2 md:block">{text.address}</p>
            <p className="text-sm text-text-2">
              <span className="md:hidden">{text.city} · </span>
              {t.form.license} {partner.license}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="min-h-11 shrink-0 rounded-lg px-3 font-semibold text-link underline underline-offset-4 hover:text-ink"
          >
            {t.form.change}
            <span className="sr-only">: {t.form.location}</span>
          </button>
        </div>
      )}

      {showSelect && (
        <div className="mb-6 space-y-2">
          <label htmlFor="location" className="block font-semibold text-text">{t.form.location}</label>
          <div className="relative">
            <select
              id="location"
              name="location"
              value={partner?.slug ?? ""}
              aria-invalid={errors.daycare ? true : undefined}
              aria-describedby={errors.daycare ? "location-error" : undefined}
              onChange={(e) => {
                onPartnerChange(e.target.value);
                setPicking(false);
              }}
              className={cn(
                "flex h-14 w-full appearance-none rounded-xl border-[1.5px] bg-white px-4 pr-12 text-base text-text",
                errors.daycare ? "border-error" : "border-field",
              )}
            >
              <option value="" disabled>{t.form.selectDaycarePlaceholder}</option>
              {partners.map((p) => {
                const option = partnerText(p, locale);
                return <option key={p.slug} value={p.slug}>{`${option.name} · ${option.city}`}</option>;
              })}
            </select>
            <ChevronRight aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-text-2" />
          </div>
          <FieldError id="location-error" message={errors.daycare} />
        </div>
      )}

      <p id="date-legend" tabIndex={-1} className="font-semibold text-text focus:outline-none">
        {t.form.date} <span className="font-normal text-text-2">· {t.form.dateHint}</span>
      </p>
      <input type="hidden" name="date" value={selectedDate} />

      {!partner ? (
        <EmptyNote icon={<MapPin aria-hidden="true" className="h-8 w-8" />}>{t.form.selectDaycareFirst}</EmptyNote>
      ) : loadingSlots ? (
        <div role="radiogroup" aria-labelledby="date-legend" aria-busy="true" className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-3">
          <span className="sr-only">{t.form.loadingSlots}</span>
          {[0, 1, 2].map((i) => (
            <div key={i} className="min-h-[76px] animate-pulse rounded-[14px] border border-slate-200 bg-slate-100 motion-reduce:animate-none" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <EmptyNote icon={<Calendar aria-hidden="true" className="h-8 w-8" />}>
          {t.form.noSlots}
          <span className="mt-2 block text-sm font-normal">
            {t.form.contactUs}{" "}
            <a className="font-semibold text-link underline" href={`tel:${CONTACT.phoneE164}`}>{CONTACT.phone}</a>
            {" · "}
            <a className="font-semibold text-link underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </span>
        </EmptyNote>
      ) : (
        <div
          role="radiogroup"
          aria-labelledby="date-legend"
          aria-invalid={errors.date ? true : undefined}
          aria-describedby={errors.date ? "date-error" : undefined}
          className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-3"
        >
          {slots.map((slot, index) => {
            const checked = index === selectedIndex;
            const { weekday, date } = formatSlotDate(slot.value, locale);
            return (
              <button
                key={`${slot.value}-${slot.time}`}
                ref={(el) => { slotRefs.current[index] = el; }}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked || (selectedIndex < 0 && index === 0) ? 0 : -1}
                onClick={() => onDateChange(slot.value)}
                onKeyDown={(e) => onSlotKey(e, index)}
                className={cn(
                  "relative flex min-h-[76px] scroll-mb-24 flex-col items-start rounded-[14px] border-[1.5px] px-3.5 py-2.5 text-left transition-colors motion-reduce:transition-none",
                  checked
                    ? "border-ink bg-ink text-white"
                    : errors.date
                      ? "border-error bg-white hover:bg-mint-tint"
                      : "border-field bg-white hover:border-ink hover:bg-mint-tint",
                )}
              >
                <span className={cn("text-[13px] font-bold uppercase tracking-wider", checked ? "text-sky-soft" : "text-text-2")}>
                  {weekday}
                </span>
                <span className={cn("text-lg font-bold", checked ? "text-white" : "text-text")}>{date}</span>
                <span className={cn("flex items-center gap-1 text-sm", checked ? "text-white" : "text-ink")}>
                  <Clock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  {compactTime(slot.time)}
                </span>
                {checked && <Check aria-hidden="true" className="absolute right-3 top-3 h-5 w-5 text-white" />}
              </button>
            );
          })}
        </div>
      )}
      <FieldError id="date-error" message={errors.date} />
    </StepCard>
  );
}

function EmptyNote({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-field bg-page p-6 text-center font-medium text-text-2">
      <span aria-hidden="true" className="mx-auto mb-2 flex justify-center text-text-3">{icon}</span>
      {children}
    </div>
  );
}
