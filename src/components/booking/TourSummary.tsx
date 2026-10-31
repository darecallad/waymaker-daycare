import { CONTACT } from "@/lib/site";
import type { Partner, TourSlot } from "@/lib/types";
import { formatSlotDate } from "@/lib/tour-slots";
import { partnerText, type BookTourCopy } from "./book-tour-copy";

interface TourSummaryProps {
  t: BookTourCopy;
  locale: "en" | "zh";
  partner?: Partner;
  slot?: TourSlot;
}

/** "Fri, Nov 6" / "11月6日 週五" for the summary, sticky bar and success screen. */
export function slotLabel(slot: TourSlot, locale: "en" | "zh"): string {
  const { weekday, date } = formatSlotDate(slot.value, locale);
  return locale === "zh" ? `${date} ${weekday}` : `${weekday}, ${date}`;
}

/** Desktop-only sticky "Your tour" card (the chosen row and sticky bar cover mobile). */
export function TourSummary({ t, locale, partner, slot }: TourSummaryProps) {
  const text = partner && partnerText(partner, locale);
  return (
    <aside
      aria-label={t.summary.title}
      className="sticky top-[120px] hidden self-start rounded-3xl border border-[#E7E5E4] bg-white p-6 shadow-[0_10px_30px_-12px_rgba(15,59,76,0.18)] lg:block"
    >
      <h2 className="font-serif text-xl font-bold text-[#0F3B4C]">{t.summary.title}</h2>
      {text ? (
        <dl className="mt-1">
          <SummaryRow term={t.summary.daycare} value={text.name} />
          <SummaryRow term={t.summary.date} value={slot ? `${slotLabel(slot, locale)} · ${slot.time}` : "—"} />
          <SummaryRow term={t.summary.address} value={text.address} />
        </dl>
      ) : (
        <p className="mt-3 text-[#57534E]">{t.summary.empty}</p>
      )}
      <p className="mt-4 border-t border-[#E7E5E4] pt-3 text-sm text-[#57534E]">
        {t.summary.questions}{" "}
        <a href={`mailto:${CONTACT.email}`} className="font-semibold text-[#0F6C8C] underline underline-offset-2 [overflow-wrap:anywhere]">
          {CONTACT.email}
        </a>
      </p>
    </aside>
  );
}

export function SummaryRow({ term, value }: { term: string; value: string }) {
  return (
    <>
      <dt className="mt-3 text-[13px] font-semibold text-[#78716C]">{term}</dt>
      <dd className="mt-0.5 font-semibold text-[#1C1917]">{value}</dd>
    </>
  );
}
