"use client";

import Image from "next/image";
import Link from "@/components/ui/link";
import { ArrowLeft, ArrowUpRight, Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import type { Partner } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { partners } from "@/data/partners";
import { CONTACT, cityName, parseAddress } from "@/lib/site";
import { ccldUrl, mapsUrl, tourDaysSummary, tourRows } from "@/lib/partner-detail";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { PartnerGallery } from "@/components/partners/PartnerGallery";
import { ContactAside, primaryButton, textLink } from "@/components/partners/ContactAside";
import { partnerDetailCopy } from "@/components/partners/partner-detail-copy";

const NEARBY_LIMIT = 2;
const h2 = "mb-3 mt-8 font-serif text-[28px] font-bold text-ink lg:mt-0";
const callHref = `tel:${CONTACT.phoneE164}`;

interface PartnerDetailContentProps {
  partner: Partner;
}

export function PartnerDetailContent({ partner }: PartnerDetailContentProps) {
  const { locale } = useLanguage();
  const t = partnerDetailCopy[locale] ?? partnerDetailCopy.en;
  const zh = locale === "zh";
  const name = zh && partner.name_zh ? partner.name_zh : partner.name;
  const description = zh && partner.description_zh ? partner.description_zh : partner.description;
  const address = zh && partner.address_zh ? partner.address_zh : partner.address;
  const city = parseAddress(partner.address).addressLocality;
  const nearby = partners
    .filter((other) => other.slug !== partner.slug && parseAddress(other.address).addressLocality === city)
    .slice(0, NEARBY_LIMIT);
  const rows = tourRows(partner.tourHours, locale);
  const verifyUrl = ccldUrl(partner.license);
  const bookHref = `/book-tour?partner=${partner.slug}`;

  return (
    <div className="min-h-screen bg-page pb-12 md:pb-16">
      <div className="mx-auto max-w-[1200px] md:px-8 md:pt-5">
        <Link href="/partners" className={`${textLink} mx-4 inline-flex min-h-11 items-center gap-1.5 text-[15px] md:mx-0`}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t.backToAll}
        </Link>

        <PartnerGallery images={partner.images ?? []} name={name} t={t} />

        <div className="mt-4 flex items-start gap-3 px-4 md:mt-7 md:gap-5 md:px-0">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-line bg-white md:h-[72px] md:w-[72px]">
            <Image src={partner.logo} alt="" fill sizes="72px" className="object-contain p-1.5" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="font-serif text-[32px] font-bold leading-tight text-ink md:text-5xl">{name}</h1>
            <ul className="mt-2 flex flex-wrap items-center gap-2 text-[13px] font-bold md:order-first md:mb-2 md:mt-0">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-3 py-1 text-ink">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                {t.licensedDaycare}
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1 text-stone-700">
                {t.licenseNum} {partner.license}
                {verifyUrl && (
                  <span aria-hidden="true">·</span>
                )}
                {verifyUrl && (
                  <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className={`${textLink} inline-flex items-center`}>
                    {t.verify}
                    <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only">{t.verifyHint}</span>
                  </a>
                )}
              </li>
            </ul>
          </div>

          <div className="hidden w-[218px] shrink-0 flex-col gap-2.5 md:flex">
            <Link href={bookHref} className={`${primaryButton} h-14 text-lg`}>{t.bookTour}</Link>
            <a
              href={callHref}
              aria-label={t.callLabel(CONTACT.phone)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-ink bg-white font-bold text-ink hover:bg-mint-tint"
            >
              <Phone aria-hidden="true" className="h-4 w-4" />
              {t.call}
            </a>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1 px-4 text-[15px] text-text-2 md:ml-[92px] md:flex-row md:flex-wrap md:items-center md:gap-x-4 md:px-0">
          <p className="flex items-start gap-1.5">
            <MapPin aria-hidden="true" className="mt-[3px] h-4 w-4 shrink-0 text-link" />
            <span>
              {address}{" "}
              <a href={mapsUrl(partner.address)} target="_blank" rel="noopener noreferrer" className={`${textLink} inline-flex min-h-11 items-center md:min-h-0`}>
                {t.openMaps}
                <span className="sr-only">{t.newTab}</span>
              </a>
            </span>
          </p>
          {rows.length > 0 && (
            <p className="flex items-center gap-1.5">
              <Clock aria-hidden="true" className="h-4 w-4 shrink-0 text-link" />
              {t.toursShort}{tourDaysSummary(rows)}
            </p>
          )}
        </div>

        <div className="mt-4 px-4 md:px-0 lg:mt-10 lg:grid lg:grid-cols-[1fr_360px] lg:gap-x-10 lg:gap-y-10">
          {rows.length > 0 && (
            <section aria-labelledby="tour-hours-heading" className="lg:col-start-1 lg:row-start-2">
              <h2 id="tour-hours-heading" className={h2}>{t.tourHours}</h2>
              <table className="w-full overflow-hidden rounded-2xl bg-white text-[15px] shadow-[inset_0_0_0_1px_var(--color-line)]">
                <thead className="sr-only">
                  <tr><th scope="col">{t.day}</th><th scope="col">{t.time}</th></tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.days} className="h-11 border-t border-line first:border-t-0">
                      <th scope="row" className="px-4 text-left font-bold text-ink">{row.days}</th>
                      <td className="px-4 text-right text-text">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section aria-labelledby="about-heading" className="lg:col-start-1 lg:row-start-1">
            <h2 id="about-heading" className={h2}>{t.aboutUs}</h2>
            <p className="max-w-[68ch] text-[17px] leading-relaxed text-stone-700">{description}</p>
          </section>

          <ContactAside partner={partner} address={address} t={t} />

          {nearby.length > 0 && (
            <section aria-labelledby="nearby-heading" className="lg:col-start-1 lg:row-start-3">
              <h2 id="nearby-heading" className={h2}>{t.nearby(cityName(city, locale))}</h2>
              <ul className="grid gap-6 sm:grid-cols-2">
                {nearby.map((other) => (
                  <li key={other.slug}>
                    <PartnerCard partner={other} headingLevel="h3" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <div data-mobile-cta className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-line bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(15,59,76,0.25)] md:hidden">
        <a
          href={callHref}
          aria-label={t.callLabel(CONTACT.phone)}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink text-ink"
        >
          <Phone aria-hidden="true" className="h-5 w-5" />
        </a>
        <Link href={bookHref} className={`${primaryButton} h-12 flex-1 text-base`}>{t.bookTour}</Link>
      </div>
    </div>
  );
}
