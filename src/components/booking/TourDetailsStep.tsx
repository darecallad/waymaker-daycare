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

  // ARIA radio pattern: arrows move focus and selection together, wrapping at the ends.
  const onSlotKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = NEXT.has(event.key) ? 1 : PREV.has(event.key) ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + slots.length) % slots.length;
    onDateChange(slots[next].value);
    slotRefs.current[next]?.focus();
  };

  return (
    <StepCard step={1} title={t.sections.tour} next={t.sections.parent} headingId="step-tour">
      {text && !picking && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border-[1.5px] border-[#0F3B4C] bg-[#F0F9F6] p-3 md:gap-4">
          {partner.images[0] && (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl md:h-[72px] md:w-[72px]">
              <Image src={partner.images[0]} alt="" fill sizes="72px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg font-bold leading-snug text-[#0F3B4C]">{text.name}</p>
            <p className="hidden text-sm text-[#57534E] md:block">{text.address}</p>
            <p className="text-sm text-[#57534E]">
              <span className="md:hidden">{text.city} · </span>
              {t.form.license} {partner.license}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="min-h-11 shrink-0 rounded-lg px-3 font-semibold text-[#0F6C8C] underline underline-offset-4 hover:text-[#0F3B4C] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0F6C8C]"
          >
            {t.form.change}
            <span className="sr-only">: {t.form.location}</span>
          </button>
        </div>
      )}

      {showSelect && (
        <div className="mb-6 space-y-2">
          <label htmlFor="location" className="block font-semibold text-[#1C1917]">{t.form.location}</label>
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
                "flex h-14 w-full appearance-none rounded-xl border-[1.5px] bg-white px-4 pr-12 text-base text-[#1C1917] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0F6C8C]",
                errors.daycare ? "border-[#B91C1C]" : "border-[#8A847E]",
              )}
            >
              <option value="" disabled>{t.form.selectDaycarePlaceholder}</option>
              {partners.map((p) => {
                const option = partnerText(p, locale);
                return <option key={p.slug} value={p.slug}>{`${option.name} · ${option.city}`}</option>;
              })}
            </select>
            <ChevronRight aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-[#57534E]" />
          </div>
          <FieldError id="location-error" message={errors.daycare} />
        </div>
      )}

      <p id="date-legend" tabIndex={-1} className="font-semibold text-[#1C1917] focus:outline-none">
        {t.form.date} <span className="font-normal text-[#57534E]">· {t.form.dateHint}</span>
      </p>
      <input type="hidden" name="date" value={selectedDate} />

      {!partner ? (
        <EmptyNote icon={<MapPin className="h-8 w-8" />}>{t.form.selectDaycareFirst}</EmptyNote>
      ) : loadingSlots ? (
        <div role="radiogroup" aria-labelledby="date-legend" aria-busy="true" className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-3">
          <span className="sr-only">{t.form.loadingSlots}</span>
          {[0, 1, 2].map((i) => (
            <div key={i} className="min-h-[76px] animate-pulse rounded-[14px] border border-[#E2E8F0] bg-[#F1F5F9] motion-reduce:animate-none" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <EmptyNote icon={<Calendar className="h-8 w-8" />}>
          {t.form.noSlots}
          <span className="mt-2 block text-sm font-normal">
            {t.form.contactUs}{" "}
            <a className="font-semibold text-[#0F6C8C] underline" href={`tel:${CONTACT.phoneE164}`}>{CONTACT.phone}</a>
            {" · "}
            <a className="font-semibold text-[#0F6C8C] underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
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
                  "relative flex min-h-[76px] scroll-mb-24 flex-col items-start rounded-[14px] border-[1.5px] px-3.5 py-2.5 text-left transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0F6C8C] motion-reduce:transition-none",
                  checked
                    ? "border-[#0F3B4C] bg-[#0F3B4C] text-white"
                    : errors.date
                      ? "border-[#B91C1C] bg-white hover:bg-[#F0F9F6]"
                      : "border-[#8A847E] bg-white hover:border-[#0F3B4C] hover:bg-[#F0F9F6]",
                )}
              >
                <span className={cn("text-[13px] font-bold uppercase tracking-wider", checked ? "text-[#A9DDEC]" : "text-[#57534E]")}>
                  {weekday}
                </span>
                <span className={cn("text-lg font-bold", checked ? "text-white" : "text-[#1C1917]")}>{date}</span>
                <span className={cn("flex items-center gap-1 text-sm", checked ? "text-white" : "text-[#0F3B4C]")}>
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
    <div className="mt-3 rounded-xl border border-dashed border-[#8A847E] bg-[#F5F7FA] p-6 text-center font-medium text-[#57534E]">
      <span aria-hidden="true" className="mx-auto mb-2 flex justify-center text-[#78716C]">{icon}</span>
      {children}
    </div>
  );
}
