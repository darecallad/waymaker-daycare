"use client";

import Link, { useLocalizedPath } from "@/components/ui/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight, BookOpen, CalendarCheck, Languages, MapPin, Search, Shield, ShieldCheck, Users,
} from "lucide-react";
import { partners } from "@/data/partners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { FaqSection } from "@/components/shared/FaqSection";
import { getFaq } from "@/data/faq";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cityName, parseAddress, partnerCities } from "@/lib/site";
import type { Partner } from "@/lib/types";

const CITIES = partnerCities();
const FEATURED_PARTNERS = partners.slice(0, 3);
const partnersSearchHref = (term: string) => `/partners?search=${encodeURIComponent(term)}`;

// Hero option B (owner decision): real partner photos, one per city. /home-hero.jpg was a stock placeholder.
// The first one is also the mobile photo (LCP), so it must stay light: <= 150 KB at 1280 px.
const HERO_SLUGS = ["clever-kidz-daycare", "bright-sky-daycare", "do-do-kids-daycare"];
const HERO_PARTNERS = HERO_SLUGS.map((slug) => partners.find((p) => p.slug === slug)).filter(
  (p): p is Partner => Boolean(p?.images[0]),
);

const copy = {
  en: {
    title: "Waymaker",
    titleSuffix: "Daycare",
    heroTitle: "Find a licensed daycare near you in the Bay Area.",
    heroSub: "See real photos, license numbers and tour hours, then book an in-person visit in minutes, in English or Chinese.",
    bookTour: "Book a Tour",
    stats: [
      { value: String(partners.length), label: "Licensed partners" },
      { value: String(CITIES.length), label: "Bay Area cities" },
      { value: "EN / 中文", label: "Tours in your language" },
    ],
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
    geoDesc: "Our partner daycares are in these Bay Area cities.",
    geoSearchLabel: "Search daycares by city or name",
    geoSearchPlaceholder: "City or daycare name",
    geoSearchButton: "Search",
    geoCities: "Browse by city",
    daycares: (n: number) => `${n} ${n === 1 ? "daycare" : "daycares"}`,
    faqEyebrow: "Questions parents ask",
    faqTitle: "Frequently Asked Questions",
    consultingTitle: "Thinking of opening a daycare?",
    consultingDesc: "Family child care home or child care center: we help with California licensing, in English or Chinese, and with enrollment once you open.",
    learnConsulting: "Daycare consulting",
    featuredTitle: "Featured Partners",
    featuredDesc: "A few of the licensed daycares in our network.",
    viewAll: "View All Partners",
    ctaTitle: "Ready to visit a daycare?",
    ctaDesc: "A tour is the best way to see the space and meet the teachers. Booking takes about two minutes.",
    scheduleNow: "Schedule Your Tour",
  },
  zh: {
    title: "Waymaker",
    titleSuffix: "幼兒園",
    heroTitle: "在灣區找到您附近的持照幼兒園。",
    heroSub: "查看真實照片、執照號碼和參觀時間，幾分鐘內就能用中文或英文預約實地參觀。",
    bookTour: "預約參觀",
    stats: [
      { value: String(partners.length), label: "持照合作幼兒園" },
      { value: String(CITIES.length), label: "灣區城市" },
      { value: "EN / 中文", label: "雙語參觀" },
    ],
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
    geoDesc: "我們的合作幼兒園位於以下灣區城市。",
    geoSearchLabel: "依城市或名稱搜尋幼兒園",
    geoSearchPlaceholder: "城市或幼兒園名稱",
    geoSearchButton: "搜尋",
    geoCities: "依城市瀏覽",
    daycares: (n: number) => `${n} 家`,
    faqEyebrow: "家長常問",
    faqTitle: "常見問題",
    consultingTitle: "想開幼兒園嗎？",
    consultingDesc: "家庭式托兒所或托兒中心：我們用中文或英文協助您申請加州執照，開業後也幫您招生。",
    learnConsulting: "了解開園諮詢",
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

  const heroStats = (display: string) => (
    <dl className={`grid-cols-3 gap-4 border-t border-[#E7E5E4] pt-5 ${display}`}>
      {t.stats.map((stat) => (
        <div key={stat.label} className="flex flex-col-reverse">
          <dt className="text-[13px] text-[#57534E] md:text-sm">{stat.label}</dt>
          <dd className="text-[22px] font-bold leading-tight text-[#0F3B4C] md:text-[28px]">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <div className="flex w-full flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#F5F7FA] pb-7 pt-5 md:pb-[72px] md:pt-16">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(125%_125%_at_50%_10%,#fff_40%,#73BBD1_100%)] opacity-20" />
        <div aria-hidden="true" className="absolute -left-20 top-10 -z-10 h-64 w-64 rounded-full bg-[#FFD166]/25 blur-3xl" />

        <div className="container mx-auto px-4 md:px-6">
          {/* Two columns from lg: at md the left column would be ~330px, too narrow for the 56px H1. */}
          <div className="lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            <div>
              <p className={`text-sm font-bold text-[#0F6C8C] ${locale === "en" ? "uppercase tracking-[0.12em]" : "tracking-wider"}`}>
                {t.title} {t.titleSuffix}
              </p>
              <h1 className="mt-2.5 max-w-[14ch] font-serif text-[32px] font-bold leading-[1.15] tracking-tight text-[#0F3B4C] md:mt-3.5 md:text-[56px] md:leading-[1.08]">
                {t.heroTitle}
              </h1>
              <p className="mt-2.5 max-w-[34em] text-[17px] leading-[1.55] text-[#57534E] md:mt-4 md:text-xl">{t.heroSub}</p>

              <form
                role="search"
                onSubmit={handleSearch}
                className="mt-4 flex min-h-[52px] max-w-[560px] items-center gap-2 rounded-full border-[1.5px] border-[#8A847E] bg-white py-1.5 pl-[18px] pr-1.5 shadow-[0_10px_30px_-14px_rgba(15,59,76,0.35)] focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-[#0F6C8C] md:mt-6 md:min-h-[60px]"
              >
                <label htmlFor="home-search" className="sr-only">{t.geoSearchLabel}</label>
                <Search aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#0F6C8C]" />
                <input
                  id="home-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.geoSearchPlaceholder}
                  className="h-10 min-w-0 flex-1 bg-transparent text-base text-[#1C1917] placeholder:text-[#57534E] focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-[#0F3B4C] px-4 font-bold text-white transition-colors hover:bg-[#092530] md:min-h-12 md:px-6"
                >
                  {t.geoSearchButton}
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm text-[#57534E]">{t.geoCities}</span>
                {CITIES.map(({ city, count }) => {
                  const name = cityName(city, locale);
                  return (
                    <Link
                      key={city}
                      href={partnersSearchHref(name)}
                      aria-label={`${name} · ${t.daycares(count)}`}
                      className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-[#8A847E] bg-white px-3.5 text-sm font-semibold text-[#0F3B4C] transition-colors hover:bg-[#F0F9F6] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0F6C8C]"
                    >
                      {name} · {count}
                    </Link>
                  );
                })}
              </div>

              <Link
                href="/book-tour"
                className="mt-1.5 inline-flex min-h-11 items-center gap-1 text-[15px] font-bold text-[#0F6C8C] underline underline-offset-4 hover:text-[#0F3B4C]"
              >
                {t.bookTour}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>

              {heroStats("mt-6 hidden lg:grid")}
            </div>

            <div className="mt-5 lg:mt-0">
              {/* Mobile shows only the first photo (16:10); the others are display:none, so their lazy images never load. */}
              <ul className="grid aspect-[16/10] gap-2.5 lg:aspect-auto lg:h-[520px] lg:grid-cols-[1.3fr_1fr] lg:grid-rows-2">
                {HERO_PARTNERS.map((partner, index) => {
                  const name = locale === "zh" && partner.name_zh ? partner.name_zh : partner.name;
                  const city = cityName(parseAddress(partner.address).addressLocality, locale);
                  return (
                    <li key={partner.slug} className={index === 0 ? "lg:row-span-2" : "hidden lg:block"}>
                      <Link
                        href={`/partners/${partner.slug}`}
                        className="group relative block h-full overflow-hidden rounded-[24px] bg-[#E7E5E4] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0F6C8C]"
                      >
                        {/* The caption is the link text, so alt="" keeps the name from being read twice. */}
                        <Image
                          src={partner.images[0]}
                          alt=""
                          fill
                          priority={index === 0}
                          sizes={index === 0 ? "(max-width: 1023px) 100vw, 640px" : "340px"}
                          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                        />
                        <span className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-20px)] rounded-[14px] bg-[rgba(9,37,48,0.82)] px-2.5 py-1.5 text-[13px] font-semibold leading-tight text-white">
                          {name}&nbsp;· <span className="whitespace-nowrap">{city}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {heroStats("mt-5 grid lg:hidden")}

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#E7E5E4] bg-white p-4 shadow-[0_10px_30px_-12px_rgba(15,59,76,0.18)]">
                <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-[#2F7D4F]" />
                <p className="text-sm text-[#57534E]">
                  <strong className="block text-base text-[#0F3B4C]">{t.heroBadgeTitle}</strong>
                  {t.heroBadgeDesc}
                </p>
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

      {/* Local partners: the search moved to the hero; city links stay here for parents who scrolled down. */}
      <section aria-labelledby="geo-heading" className="relative overflow-hidden bg-[#0F3B4C] py-14 text-white md:py-16">
        <div aria-hidden="true" className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#73BBD1] opacity-20 blur-[120px]" />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-4">
              <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-[#A9DDEC] ring-1 ring-inset ring-white/20">
                <MapPin aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
                {t.geoEyebrow}
              </p>
              <h2 id="geo-heading" className="font-serif text-3xl font-bold md:text-4xl">{t.geoTitle}</h2>
              <p className="text-lg leading-relaxed text-gray-200">{t.geoDesc}</p>
            </div>
            <ul aria-label={t.geoCities} className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end">
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

      <FaqSection eyebrow={t.faqEyebrow} title={t.faqTitle} items={getFaq(locale)} />

      {/* Consulting (secondary audience, kept below the parent journey) */}
      <section aria-labelledby="consulting-heading" className="bg-[#F5F7FA] py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-8 rounded-[2rem] border border-gray-100 bg-white px-8 py-12 text-center shadow-lg md:flex-row md:px-14 md:text-left">
            <div className="max-w-2xl space-y-3">
              <h2 id="consulting-heading" className="font-serif text-3xl font-bold text-[#0F3B4C]">{t.consultingTitle}</h2>
              <p className="text-lg leading-relaxed text-gray-600">{t.consultingDesc}</p>
            </div>
            <Button asChild size="lg" className="h-14 shrink-0 rounded-2xl bg-[#0F3B4C] px-8 text-base font-semibold text-white hover:bg-[#092530]">
              <Link href="/for-providers">
                {t.learnConsulting}
                <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
              </Link>
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
