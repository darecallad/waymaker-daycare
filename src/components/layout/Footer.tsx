"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { locale } = useLanguage();

  const copy = {
    en: {
      desc: "Connecting families with trusted, high-quality daycare centers in your community.",
      company: "Company",
      about: "About Us",
      careers: "Careers",
      contact: "Contact",
      resources: "Resources",
      findDaycare: "Find a Daycare",
      blog: "Parenting Blog",
      faq: "FAQs",
      contactTitle: "Contact",
      serviceArea: "Service Area",
      serviceAreaDesc: "Mountain View, Sunnyvale, Cupertino, Santa Clara, San Jose, Milpitas, Fremont, Newark, San Lorenzo, Los Altos, Campbell",
      rights: "Waymaker Daycare. All rights reserved.",
    },
    zh: {
      desc: "連結家庭與社區中值得信賴、高品質的幼兒園。",
      company: "公司",
      about: "關於我們",
      careers: "職涯機會",
      contact: "聯絡我們",
      resources: "資源",
      findDaycare: "尋找幼兒園",
      blog: "育兒部落格",
      faq: "常見問題",
      contactTitle: "聯絡資訊",
      serviceArea: "服務區域",
      serviceAreaDesc: "山景城、桑尼維爾、庫比蒂諾、聖塔克拉拉、聖荷西、苗必達、弗里蒙特、紐瓦克、聖洛倫佐、洛斯阿爾托斯、坎貝爾",
      rights: "Waymaker Daycare. 版權所有。",
    },
  };

  const t = copy[locale] ?? copy.en;

  return (
    <footer className="border-t border-[#CDE6E0] bg-gradient-to-r from-[#A8D5BA] via-[#D2EFE5] to-[#73BBD1] pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-[72px] w-[240px]">
                <Image
                  src="/waymaker-logo.svg"
                  alt="Waymaker Daycare Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed">
              {t.desc}
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-sm font-semibold text-stone-900">{t.company}</h4>
            <ul className="space-y-3 text-sm text-stone-600">
              <li><Link href="/about" className="hover:text-indigo-600">{t.about}</Link></li>
              <li><Link href="/careers" className="hover:text-indigo-600">{t.careers}</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-600">{t.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-sm font-semibold text-stone-900">{t.resources}</h4>
            <ul className="space-y-3 text-sm text-stone-600">
              <li><Link href="/partners" className="hover:text-indigo-600">{t.findDaycare}</Link></li>
              <li><Link href="/blog" className="hover:text-indigo-600">{t.blog}</Link></li>
              <li><Link href="/faq" className="hover:text-indigo-600">{t.faq}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-serif text-sm font-semibold text-stone-900">{t.contactTitle}</h4>
            <ul className="space-y-3 text-sm text-stone-600">
              <li>2586 Seaboard Ave</li>
              <li>San Jose, CA 95131</li>
              <li>
                <a href="mailto:daycare@waymakerbiz.com" className="hover:text-indigo-600">
                  daycare@waymakerbiz.com
                </a>
              </li>
              <li>
                <a href="tel:4085903617" className="hover:text-indigo-600">
                  (408) 590-3617
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-200 pt-8">
          <h4 className="mb-4 font-serif text-sm font-semibold text-stone-900">{t.serviceArea}</h4>
          <p className="text-sm text-stone-500 leading-relaxed">
            {t.serviceAreaDesc}
          </p>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-8 text-center text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()} {t.rights}</p>
        </div>
      </div>
    </footer>
  );
}
