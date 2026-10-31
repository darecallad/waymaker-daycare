"use client";

import Image from "next/image";
import Link from "@/components/ui/link";
import { Clock, MapPin, ShieldCheck } from "lucide-react";
import type { Partner } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { tourDaysSummary, tourRows } from "@/lib/partner-detail";

interface PartnerCardProps {
  partner: Partner;
  /** Keep the document outline valid wherever the card is placed. */
  headingLevel?: "h2" | "h3";
}

const copy = {
  en: { viewDetails: "View details", bookTour: "Book a Tour", noImage: "Photos coming soon", byAppointment: "By appointment", tours: "Tours: ", licenseNum: "License #" },
  zh: { viewDetails: "查看詳情", bookTour: "預約參觀", noImage: "照片即將上線", byAppointment: "需預約", tours: "參觀：", licenseNum: "執照號碼 #" },
};

const button = "inline-flex min-h-10 items-center justify-center rounded-full px-3 text-[13px] font-bold md:min-h-11 md:px-4 md:text-sm";

/**
 * Directory card. Mobile: 112px thumb left, details right (~165px tall). md+: photo on top (3:2).
 * The title link is stretched over the whole card; "Book a Tour" sits above it (z-10), so there
 * are no nested interactive elements. "View details" is a visual cue for the stretched link.
 * `contain: inline-size` stops the one-line (truncated) text from widening any grid the card sits in.
 */
export function PartnerCard({ partner, headingLevel: Heading = "h3" }: PartnerCardProps) {
  const { locale } = useLanguage();
  const t = copy[locale] ?? copy.en;
  const zh = locale === "zh";
  const name = zh && partner.name_zh ? partner.name_zh : partner.name;
  const address = zh && partner.address_zh ? partner.address_zh : partner.address;
  const days = tourDaysSummary(tourRows(partner.tourHours, locale)) || t.byAppointment;

  return (
    <article className="group relative flex h-full w-full gap-3 [contain:inline-size] rounded-[20px] border border-line bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,.04)] transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(15,59,76,0.35)] focus-within:shadow-[0_12px_32px_-16px_rgba(15,59,76,0.35)] md:flex-col md:gap-0 md:overflow-hidden md:p-0">
      <div className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-stone-100 md:aspect-[3/2] md:size-auto md:w-full md:rounded-none">
        {partner.images?.[0] ? (
          <Image
            src={partner.images[0]}
            alt=""
            fill
            sizes="(max-width: 767px) 112px, (max-width: 1023px) 50vw, 380px"
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full items-center justify-center p-2 text-center text-xs font-medium text-text-2">{t.noImage}</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-2 md:p-5">
        <Heading className="line-clamp-2 font-serif text-[17px] font-bold leading-snug text-ink md:text-xl">
          <Link
            href={`/partners/${partner.slug}`}
            className="rounded-[20px] after:absolute after:inset-0 after:rounded-[20px] after:content-[''] focus-visible:outline-none focus-visible:after:outline-[3px] focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
          >
            {name}
          </Link>
        </Heading>
        <p className="flex items-start gap-1.5 text-[13px] text-text-2 md:text-sm">
          <MapPin aria-hidden="true" className="mt-[2px] h-3.5 w-3.5 shrink-0 text-link md:h-4 md:w-4" />
          <span className="truncate md:line-clamp-2 md:whitespace-normal">{address}</span>
        </p>
        <p className="flex items-start gap-1.5 text-[13px] text-text-2 md:text-sm">
          <Clock aria-hidden="true" className="mt-[2px] h-3.5 w-3.5 shrink-0 text-link md:h-4 md:w-4" />
          <span className="truncate">{t.tours}{days}</span>
        </p>
        <p className="flex items-start gap-1.5 text-[13px] text-text-2 md:text-sm">
          <ShieldCheck aria-hidden="true" className="mt-[2px] h-3.5 w-3.5 shrink-0 text-ok md:h-4 md:w-4" />
          <span className="truncate">{t.licenseNum} {partner.license}</span>
        </p>

        <div className="mt-auto flex gap-2 pt-1 md:pt-2">
          <Link
            href={`/book-tour?partner=${partner.slug}`}
            className={`${button} relative z-10 bg-ink text-white hover:bg-ink-hover`}
          >
            {t.bookTour}
          </Link>
          <span aria-hidden="true" className={`${button} border-[1.5px] border-ink text-ink group-hover:bg-mint-tint`}>
            {t.viewDetails}
          </span>
        </div>
      </div>
    </article>
  );
}
