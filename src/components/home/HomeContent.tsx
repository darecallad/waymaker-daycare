"use client";

import Link, { useLocalizedPath } from "@/components/ui/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight, BookOpen, CalendarCheck, Languages, MapPin, Search, Shield, ShieldCheck, Star, Users,
} from "lucide-react";
import { partners } from "@/data/partners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { HomeFaq } from "@/components/home/HomeFaq";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cityName, partnerCities } from "@/lib/site";

const CITIES = partnerCities();
const FEATURED_PARTNERS = partners.slice(0, 3);
const partnersSearchHref = (term: string) => `/partners?search=${encodeURIComponent(term)}`;

const copy = {
  en: {
    badge: "Every partner is state-licensed",
    title: "Waymaker",
    titleSuffix: "Daycare",
    description:
      "Find a licensed daycare near you in the Bay Area. See real photos, license numbers and tour hours, then book an in-person visit in minutes, in English or Chinese.",
    findDaycare: "Find a Daycare",
    bookTour: "Book a Tour",
    stats: [
      { value: String(partners.length), label: "Licensed partners" },
      { value: String(CITIES.length), label: "Bay Area cities" },
      { value: "EN / 中文", label: "Tours in your language" },
    ],
    heroAlt: "Children doing an art project with a smiling teacher at a daycare",
    heroBadgeTitle: "License # on every page",
    heroBadgeDesc: "Verify any partner yourself",
    stepsEyebrow: "How it works",
    stepsTitle: "From search to visit in three steps",
    steps: [
      { title: "Browse", desc: "Compare photos, addresses, license numbers and tour hours for each daycare." },
      { title: "Book", desc: "Pick a daycare and a date. Only real open tour slots are shown." },
      { title: "Visit", desc: "We contact you to confirm, then you meet the teachers in person." },
    ],
    featuresTitle: "Why families choose Waymaker",
    featuresDesc: "Practical help for one of the biggest decisions you make for your child.",
    features: [
      { title: "Licensed and verifiable", desc: "Every partner holds a California child care license, listed on its page." },
      { title: "Early learning focus", desc: "Partners offer play-based and curriculum-based programs for young children." },
      { title: "Bilingual support", desc: "Browse the site and book tours in English or Chinese." },
    ],
    geoEyebrow: "Local partners",
    geoTitle: "Find childcare near you",
    geoDesc: "Our partner daycares are in these Bay Area cities. Search by city or daycare name.",
    geoSearchLabel: "Search daycares by city or name",
    geoSearchPlaceholder: "City or daycare name",
    geoSearchButton: "Search",
    geoCities: "Browse by city",
    daycares: (n: number) => `${n} ${n === 1 ? "daycare" : "daycares"}`,
    consultingTitle: "Run a daycare?",
    consultingDesc: "Waymaker also offers consulting for people starting or growing a childcare business.",
    learnConsulting: "Learn About Consulting",
    newTab: "(opens in a new tab)",
    featuredTitle: "Featured Partners",
    featuredDesc: "A few of the licensed daycares in our network.",
    viewAll: "View All Partners",
    ctaTitle: "Ready to visit a daycare?",
    ctaDesc: "A tour is the best way to see the space and meet the teachers. Booking takes about two minutes.",
    scheduleNow: "Schedule Your Tour",
  },
  zh: {
    badge: "每一家合作幼兒園都有州政府執照",
    title: "Waymaker",
    titleSuffix: "幼兒園",
    description:
      "在灣區找到您附近的持照幼兒園。查看真實照片、執照號碼和參觀時間，幾分鐘內就能用中文或英文預約實地參觀。",
    findDaycare: "尋找幼兒園",
    bookTour: "預約參觀",
    stats: [
      { value: String(partners.length), label: "持照合作幼兒園" },
      { value: String(CITIES.length), label: "灣區城市" },
      { value: "EN / 中文", label: "雙語參觀" },
    ],
    heroAlt: "孩子們和微笑的老師在幼兒園一起做美勞",
    heroBadgeTitle: "每頁都有執照號碼",
    heroBadgeDesc: "您可以自行查證",
    stepsEyebrow: "預約流程",
    stepsTitle: "三個步驟，從搜尋到參觀",
    steps: [
      { title: "瀏覽", desc: "比較每家幼兒園的照片、地址、執照號碼和參觀時間。" },
      { title: "預約", desc: "選擇幼兒園和日期，只會顯示真正可預約的時段。" },
      { title: "參觀", desc: "我們會與您聯絡確認，然後親自認識老師。" },
    ],
    featuresTitle: "家長選擇 Waymaker 的原因",
    featuresDesc: "為孩子做重要決定時，給您實際的幫助。",
    features: [
      { title: "持照且可查證", desc: "每家合作幼兒園都有加州托育執照，執照號碼列在介紹頁面上。" },
      { title: "重視早期學習", desc: "合作園所提供遊戲式與課程式的幼兒學習。" },
      { title: "雙語服務", desc: "可以用中文或英文瀏覽網站和預約參觀。" },
    ],
    geoEyebrow: "在地合作夥伴",
    geoTitle: "尋找您附近的幼兒園",
    geoDesc: "我們的合作幼兒園位於以下灣區城市，可以依城市或名稱搜尋。",
    geoSearchLabel: "依城市或名稱搜尋幼兒園",
    geoSearchPlaceholder: "城市或幼兒園名稱",
    geoSearchButton: "搜尋",
    geoCities: "依城市瀏覽",
    daycares: (n: number) => `${n} 家`,
    consultingTitle: "經營幼兒園嗎？",
    consultingDesc: "Waymaker 也為想創辦或擴展托育事業的人提供諮詢服務。",
    learnConsulting: "了解諮詢服務",
    newTab: "（在新分頁開啟）",
    featuredTitle: "精選合作夥伴",
    featuredDesc: "我們網絡中的部分持照幼兒園。",
    viewAll: "查看所有合作夥伴",
    ctaTitle: "準備好參觀幼兒園了嗎？",
    ctaDesc: "參觀是了解環境和認識老師的最好方式，預約大約只需要兩分鐘。",
    scheduleNow: "立即預約參觀",
  },
};

const STEP_ICONS = [Search, CalendarCheck, Users];
const FEATURE_STYLES = [
  { Icon: Shield, tile: "bg-[#D2EFE5] text-[#0F3B4C]" },
  { Icon: BookOpen, tile: "bg-[#FFF1C9] text-[#7A4B00]" },
  { Icon: Languages, tile: "bg-[#DCEFF6] text-[#0F3B4C]" },
];

export function HomeContent() {
  const { locale } = useLanguage();
  const t = copy[locale] ?? copy.en;
  const router = useRouter();
  const localize = useLocalizedPath();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchQuery.trim();
    router.push(localize(term ? partnersSearchHref(term) : "/partners"));
  };

  return (
    <div className="flex w-full flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#F5F7FA] py-16 md:py-28">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_10%,#fff_40%,#73BBD1_100%)] opacity-20" />
        <div aria-hidden="true" className="absolute -left-20 top-10 -z-10 h-64 w-64 rounded-full bg-[#FFD166]/25 blur-3xl" />

        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center lg:gap-20">
            <div className="space-y-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-1000">
              <p className="inline-flex items-center rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-[#0F3B4C] shadow-sm ring-1 ring-inset ring-[#0F3B4C]/20">
                <ShieldCheck aria-hidden="true" className="mr-1.5 h-4 w-4 text-[#2F7D4F]" />
                {t.badge}
              </p>
              <h1 className="font-serif text-5xl font-bold leading-[1.1] tracking-tight text-[#0F3B4C] sm:text-7xl">
                {t.title}{" "}
                <span className="bg-gradient-to-r from-[#0F3B4C] to-[#0F6C8C] bg-clip-text text-transparent">{t.titleSuffix}</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-gray-700 md:text-xl">{t.description}</p>
              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Button asChild size="lg" className="h-14 rounded-xl bg-[#0F3B4C] px-8 text-lg text-white shadow-lg hover:bg-[#092530]">
                  <Link href="/partners">
                    {t.findDaycare}
                    <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 rounded-xl border-[#0F3B4C]/30 bg-white px-8 text-lg text-[#0F3B4C] shadow-sm hover:bg-[#F0F9F6] hover:text-[#0F3B4C]">
                  <Link href="/book-tour">{t.bookTour}</Link>
                </Button>
              </div>

              <dl className="grid grid-cols-3 gap-4 border-t border-gray-200/60 pt-8">
                {t.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse">
                    <dt className="text-sm text-gray-600">{stat.label}</dt>
                    <dd className="text-2xl font-bold text-[#0F3B4C]">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative aspect-square motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-1000 md:aspect-[4/3] lg:aspect-square">
              <div aria-hidden="true" className="absolute inset-0 -z-10 rotate-3 scale-105 rounded-[2.5rem] bg-gradient-to-tr from-[#73BBD1] to-[#FFD166] opacity-30 blur-2xl" />
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-gray-900/5">
                <Image src="/home-hero.jpg" alt={t.heroAlt} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-xl md:block">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#FFF1C9] p-2">
                    <Star aria-hidden="true" className="h-6 w-6 fill-[#F4B400] text-[#C98A00]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0F3B4C]">{t.heroBadgeTitle}</p>
                    <p className="text-xs text-gray-600">{t.heroBadgeDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="steps-heading" className="bg-white py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-[#0F6C8C]">{t.stepsEyebrow}</p>
          <h2 id="steps-heading" className="mb-14 text-center font-serif text-3xl font-bold text-[#0F3B4C] md:text-4xl">{t.stepsTitle}</h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {t.steps.map((step, index) => {
              const Icon = STEP_ICONS[index];
              return (
                <li key={step.title} className="relative rounded-3xl border border-gray-100 bg-[#F8FAF9] p-8 text-center">
                  <span aria-hidden="true" className="absolute left-6 top-6 font-serif text-4xl font-bold text-[#73BBD1]/40">{index + 1}</span>
                  <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F3B4C] text-white shadow-lg">
                    <Icon aria-hidden="true" className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-[#0F3B4C]">{step.title}</h3>
                  <p className="leading-relaxed text-gray-600">{step.desc}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Why Waymaker */}
      <section aria-labelledby="features-heading" className="bg-[#F5F7FA] py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
            <h2 id="features-heading" className="font-serif text-3xl font-bold text-[#0F3B4C] md:text-4xl">{t.featuresTitle}</h2>
            <p className="text-lg text-gray-600">{t.featuresDesc}</p>
          </div>
          <ul className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {t.features.map((feature, index) => {
              const { Icon, tile } = FEATURE_STYLES[index];
              return (
                <li key={feature.title} className="rounded-3xl border border-gray-100 bg-white p-8 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#0F3B4C]/5">
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${tile}`}>
                    <Icon aria-hidden="true" className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-[#0F3B4C]">{feature.title}</h3>
                  <p className="leading-relaxed text-gray-600">{feature.desc}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* GEO / local search */}
      <section aria-labelledby="geo-heading" className="relative overflow-hidden bg-[#0F3B4C] py-20 text-white">
        <div aria-hidden="true" className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#73BBD1] opacity-20 blur-[120px]" />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="max-w-xl space-y-6">
              <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-[#A9DDEC] ring-1 ring-inset ring-white/20">
                <MapPin aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
                {t.geoEyebrow}
              </p>
              <h2 id="geo-heading" className="font-serif text-3xl font-bold md:text-4xl">{t.geoTitle}</h2>
              <p className="text-lg leading-relaxed text-gray-200">{t.geoDesc}</p>
            </div>
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
              <form role="search" onSubmit={handleSearch} className="flex gap-2">
                <label htmlFor="home-search" className="sr-only">{t.geoSearchLabel}</label>
                <div className="relative flex-1">
                  <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                  <input
                    id="home-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.geoSearchPlaceholder}
                    className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pl-10 pr-4 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A9DDEC]"
                  />
                </div>
                <Button type="submit" className="h-12 rounded-xl bg-[#A9DDEC] px-6 font-semibold text-[#0F3B4C] hover:bg-white">
                  {t.geoSearchButton}
                </Button>
              </form>
              <h3 className="mb-3 mt-6 text-sm font-medium text-gray-200">{t.geoCities}</h3>
              <ul className="flex flex-wrap gap-2">
                {CITIES.map(({ city, count }) => (
                  <li key={city}>
                    <Link
                      href={partnersSearchHref(cityName(city, locale))}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-white/10 px-4 text-sm text-white transition-colors hover:bg-white/20"
                    >
                      {cityName(city, locale)} <span className="text-[#A9DDEC]">· {t.daycares(count)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured partners */}
      <section aria-labelledby="featured-heading" className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-gray-100 pb-8 md:flex-row md:items-end">
            <div className="space-y-4">
              <h2 id="featured-heading" className="font-serif text-4xl font-bold text-[#0F3B4C] md:text-5xl">{t.featuredTitle}</h2>
              <p className="max-w-xl text-xl text-gray-600">{t.featuredDesc}</p>
            </div>
            <Button asChild variant="ghost" className="group rounded-xl px-6 py-6 text-lg font-semibold text-[#0F3B4C] hover:bg-[#73BBD1]/10 hover:text-[#092530]">
              <Link href="/partners">
                {t.viewAll}
                <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PARTNERS.map((partner) => (
              <li key={partner.slug}>
                <PartnerCard partner={partner} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HomeFaq />

      {/* Consulting (secondary audience, kept below the parent journey) */}
      <section aria-labelledby="consulting-heading" className="bg-[#F5F7FA] py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-8 rounded-[2rem] border border-gray-100 bg-white px-8 py-12 text-center shadow-lg md:flex-row md:px-14 md:text-left">
            <div className="max-w-2xl space-y-3">
              <h2 id="consulting-heading" className="font-serif text-3xl font-bold text-[#0F3B4C]">{t.consultingTitle}</h2>
              <p className="text-lg leading-relaxed text-gray-600">{t.consultingDesc}</p>
            </div>
            <Button asChild size="lg" className="h-14 shrink-0 rounded-2xl bg-[#0F3B4C] px-8 text-base font-semibold text-white hover:bg-[#092530]">
              <a href="https://cpr.waymakerbiz.com/consulting" target="_blank" rel="noopener noreferrer">
                {t.learnConsulting}
                <span className="sr-only"> {t.newTab}</span>
                <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section aria-labelledby="cta-heading" className="relative overflow-hidden bg-[#0F3B4C] py-20 md:py-28">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[#0F3B4C]/0 to-[#092530]/50" />
        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <h2 id="cta-heading" className="mb-6 font-serif text-4xl font-bold tracking-tight text-white md:text-6xl">{t.ctaTitle}</h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-[#A9DDEC]">{t.ctaDesc}</p>
          <Button asChild size="lg" className="h-16 rounded-full bg-[#FFD166] px-12 text-lg font-bold text-[#0F3B4C] shadow-2xl hover:bg-white">
            <Link href="/book-tour">{t.scheduleNow}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
