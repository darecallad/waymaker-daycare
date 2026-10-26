"use client";

import Link from "@/components/ui/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, MapPin, Phone } from "lucide-react";
import { CONTACT, SERVICE_AREAS, cityName } from "@/lib/site";

const copy = {
  en: {
    desc: "Connecting Bay Area families with licensed, trusted daycares, and making it easy to book a tour.",
    company: "Company",
    about: "About Waymaker",
    consulting: "Daycare Consulting",
    contact: "Contact",
    resources: "Resources",
    findDaycare: "Find a Daycare",
    bookTour: "Book a Tour",
    blog: "Parenting Blog",
    contactTitle: "Contact Us",
    serviceArea: "Service Areas",
    rights: "Waymaker Daycare. All rights reserved.",
    newTab: "(opens in a new tab)",
  },
  zh: {
    desc: "連結灣區家庭與值得信賴的持照幼兒園，讓預約參觀更簡單。",
    company: "公司",
    about: "關於 Waymaker",
    consulting: "開園諮詢",
    contact: "聯絡我們",
    resources: "資源",
    findDaycare: "尋找幼兒園",
    bookTour: "預約參觀",
    blog: "育兒部落格",
    contactTitle: "聯絡資訊",
    serviceArea: "服務區域",
    rights: "Waymaker Daycare. 版權所有。",
    newTab: "（在新分頁開啟）",
  },
};

const linkClass = "font-medium transition-colors duration-200 hover:text-[#0F3B4C] hover:underline";

function ExternalLink({ href, label, newTab }: { href: string; label: string; newTab: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {label}
      <span className="sr-only"> {newTab}</span>
    </a>
  );
}

export function Footer() {
  const { locale } = useLanguage();
  const t = copy[locale] ?? copy.en;

  return (
    <footer className="relative overflow-hidden bg-gradient-to-r from-[#A8D5BA] via-[#D2EFE5] to-[#73BBD1] pb-10 pt-16 text-stone-800">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mb-14 grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <Link href="/" className="inline-block">
              <div className="relative h-[60px] w-[200px]">
                <Image src="/waymaker-logo.svg" alt="Waymaker Daycare home" fill className="object-contain object-left" />
              </div>
            </Link>
            <p className="max-w-sm font-medium leading-relaxed">{t.desc}</p>
          </div>

          <nav aria-labelledby="footer-company" className="lg:col-span-2">
            <h2 id="footer-company" className="mb-5 font-serif text-lg font-bold text-[#0F3B4C]">{t.company}</h2>
            <ul className="space-y-3">
              <li><ExternalLink href="https://cpr.waymakerbiz.com/" label={t.about} newTab={t.newTab} /></li>
              <li><Link href="/for-providers" className={linkClass}>{t.consulting}</Link></li>
              <li><ExternalLink href="https://cpr.waymakerbiz.com/contact" label={t.contact} newTab={t.newTab} /></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-resources" className="lg:col-span-2">
            <h2 id="footer-resources" className="mb-5 font-serif text-lg font-bold text-[#0F3B4C]">{t.resources}</h2>
            <ul className="space-y-3">
              <li><Link href="/partners" className={linkClass}>{t.findDaycare}</Link></li>
              <li><Link href="/book-tour" className={linkClass}>{t.bookTour}</Link></li>
              <li><ExternalLink href="https://www.sunnychildcare.com/resources/blog" label={t.blog} newTab={t.newTab} /></li>
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <h2 className="mb-5 font-serif text-lg font-bold text-[#0F3B4C]">{t.contactTitle}</h2>
            <address className="space-y-4 not-italic">
              <p className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#0F6C8C]" />
                <span className="font-medium">
                  {CONTACT.streetAddress}<br />
                  {CONTACT.city}, {CONTACT.region} {CONTACT.postalCode}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Mail aria-hidden="true" className="h-5 w-5 shrink-0 text-[#0F6C8C]" />
                <a href={`mailto:${CONTACT.email}`} className={linkClass}>{CONTACT.email}</a>
              </p>
              <p className="flex items-center gap-3">
                <Phone aria-hidden="true" className="h-5 w-5 shrink-0 text-[#0F6C8C]" />
                <a href={`tel:${CONTACT.phoneE164}`} className={linkClass}>{CONTACT.phone}</a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-[#0F3B4C]/15 py-8">
          <h2 className="mb-4 text-center font-serif text-sm font-bold uppercase tracking-widest text-[#0F3B4C]">{t.serviceArea}</h2>
          <ul className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-sm font-medium text-stone-700">
            {SERVICE_AREAS.map((area, index) => (
              <li key={area} className="flex items-center">
                {cityName(area, locale)}
                {index < SERVICE_AREAS.length - 1 && <span aria-hidden="true" className="ml-3 text-[#0F3B4C]/40">•</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[#0F3B4C]/15 pt-8 text-center text-xs font-medium text-stone-700 md:text-left">
          <p>&copy; {new Date().getFullYear()} {t.rights}</p>
        </div>
      </div>
    </footer>
  );
}
