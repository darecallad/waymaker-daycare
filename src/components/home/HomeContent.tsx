"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Star, Shield, BookOpen, Users, MapPin, Search } from "lucide-react";
import { partners } from "@/data/partners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HomeContent() {
  const { locale } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/partners?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleQuickSearch = (term: string) => {
    router.push(`/partners?search=${encodeURIComponent(term)}`);
  };

  // Get first 3 partners for preview, excluding "Sunny Childcare Center"
  const featuredPartners = partners
    .filter(p => p.name !== "Sunny Childcare Center")
    .slice(0, 3);

  const copy = {
    en: {
      trusted: "Trusted by 500+ Families",
      title: "Waymaker",
      titleSuffix: "Daycare",
      description: "A premium service by Waymaker. We partner with top-rated daycare centers to provide safe, nurturing, and educational environments for your little ones.",
      findDaycare: "Find a Daycare",
      bookTour: "Book a Tour",
      licensed: "Licensed Facilities",
      verified: "Verified Reviews",
      featuresTitle: "Why Choose Waymaker?",
      featuresDesc: "We set the standard for childcare excellence.",
      feature1Title: "Safety First",
      feature1Desc: "Rigorous safety protocols and secure facilities for your peace of mind.",
      feature2Title: "Early Education",
      feature2Desc: "Curriculum-based learning designed to foster development and creativity.",
      feature3Title: "Community Focused",
      feature3Desc: "Building strong relationships between families, educators, and children.",
      consultingTitle: "Expert Daycare Consulting",
      consultingDesc: "Looking to start or improve your own daycare business? Our consulting services provide the guidance you need to succeed in the childcare industry.",
      learnConsulting: "Learn About Consulting",
      featuredTitle: "Featured Partners",
      featuredDesc: "Explore our network of highly-rated childcare providers, each vetted for quality and safety.",
      viewAll: "View All Partners",
      ctaTitle: "Ready to visit a center?",
      ctaDesc: "Scheduling a tour is the best way to experience the environment and meet the teachers. It takes less than 2 minutes to book.",
      scheduleNow: "Schedule Your Tour Now",
      statsFamilies: "500+",
      statsFamiliesLabel: "Happy Families",
      statsPartners: "50+",
      statsPartnersLabel: "Trusted Partners",
      statsYears: "10+",
      statsYearsLabel: "Years Experience",
      geoTitle: "Find Childcare Near You",
      geoDesc: "We partner with top-rated facilities across the region. Enter your location to find the perfect match for your family.",
      geoSearchPlaceholder: "Enter your zip code or city...",
      geoSearchButton: "Search"
    },
    zh: {
      trusted: "超過 500 個家庭的信賴",
      title: "Waymaker",
      titleSuffix: "幼兒園",
      description: "Waymaker 提供的優質服務。我們與頂級幼兒園合作，為您的孩子提供安全、培育和教育環境。",
      findDaycare: "尋找幼兒園",
      bookTour: "預約參觀",
      licensed: "持照設施",
      verified: "認證評價",
      featuresTitle: "為什麼選擇 Waymaker？",
      featuresDesc: "我們樹立了幼兒保育的卓越標準。",
      feature1Title: "安全第一",
      feature1Desc: "嚴格的安全協議和安全的設施，讓您安心。",
      feature2Title: "早期教育",
      feature2Desc: "基於課程的學習，旨在促進發展和創造力。",
      feature3Title: "專注社區",
      feature3Desc: "建立家庭、教育工作者和孩子之間的牢固關係。",
      consultingTitle: "專業幼兒園諮詢",
      consultingDesc: "想要創辦或改善您的幼兒園業務嗎？我們的諮詢服務為您提供在幼兒保育行業取得成功所需的指導。",
      learnConsulting: "了解諮詢服務",
      featuredTitle: "精選合作夥伴",
      featuredDesc: "探索我們的高評價幼兒保育提供者網絡，每一家都經過質量和安全審查。",
      viewAll: "查看所有合作夥伴",
      ctaTitle: "準備好參觀中心了嗎？",
      ctaDesc: "預約參觀是體驗環境和會見老師的最佳方式。預約只需不到 2 分鐘。",
      scheduleNow: "立即預約參觀",
      statsFamilies: "500+",
      statsFamiliesLabel: "快樂家庭",
      statsPartners: "50+",
      statsPartnersLabel: "合作夥伴",
      statsYears: "10+",
      statsYearsLabel: "多年經驗",
      geoTitle: "尋找您附近的幼兒保育",
      geoDesc: "我們與該地區的頂級設施合作。輸入您的位置，為您的家庭找到完美的匹配。",
      geoSearchPlaceholder: "輸入您的郵遞區號或城市...",
      geoSearchButton: "搜尋"
    }
  };

  const t = copy[locale] ?? copy.en;

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-50 py-20 md:py-32 lg:py-40">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#6366f1_100%)] opacity-20"></div>
        <div className="absolute inset-0 -z-10 h-full w-full bg-[url('/grid.svg')] opacity-[0.03]"></div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center lg:gap-20">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 shadow-sm">
                <Star className="mr-1.5 h-4 w-4 fill-indigo-600" />
                {t.trusted}
              </div>
              <h1 className="font-serif text-5xl font-bold tracking-tight text-stone-900 sm:text-7xl leading-[1.1]">
                {t.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{t.titleSuffix}</span>
              </h1>
              <p className="text-xl text-stone-600 leading-relaxed max-w-lg">
                {t.description}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row pt-4">
                <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30 h-14 px-8 text-lg transition-all duration-300 hover:-translate-y-0.5">
                  <Link href="/partners">
                    {t.findDaycare}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-white/50 backdrop-blur-sm text-stone-900 border-stone-200 hover:bg-white hover:text-indigo-600 shadow-sm h-14 px-8 text-lg transition-all duration-300">
                  <Link href="/book-tour">
                    {t.bookTour}
                  </Link>
                </Button>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-stone-200/60">
                <div>
                  <div className="text-2xl font-bold text-stone-900">{t.statsFamilies}</div>
                  <div className="text-sm text-stone-500">{t.statsFamiliesLabel}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{t.statsPartners}</div>
                  <div className="text-sm text-stone-500">{t.statsPartnersLabel}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{t.statsYears}</div>
                  <div className="text-sm text-stone-500">{t.statsYearsLabel}</div>
                </div>
              </div>
            </div>
            
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-200 to-stone-200 blur-2xl opacity-50 -z-10 transform rotate-3 scale-105" />
              <div className="absolute inset-0 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-stone-900/5">
                 <div className="relative h-full w-full">
                    <Image 
                      src="/home-hero.jpg" 
                      alt="Happy children playing in a modern daycare environment" 
                      fill 
                      priority
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                 </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-stone-100 animate-in slide-in-from-bottom-8 duration-1000 delay-500 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">{t.verified}</div>
                    <div className="text-xs text-stone-500">100% Compliance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-serif text-3xl font-bold text-stone-900 md:text-4xl">{t.featuresTitle}</h2>
            <p className="text-lg text-stone-500">{t.featuresDesc}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group p-8 rounded-2xl bg-stone-50 border border-stone-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-stone-900">{t.feature1Title}</h3>
              <p className="text-stone-500 leading-relaxed">{t.feature1Desc}</p>
            </div>
            <div className="group p-8 rounded-2xl bg-stone-50 border border-stone-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-stone-900">{t.feature2Title}</h3>
              <p className="text-stone-500 leading-relaxed">{t.feature2Desc}</p>
            </div>
            <div className="group p-8 rounded-2xl bg-stone-50 border border-stone-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-stone-900">{t.feature3Title}</h3>
              <p className="text-stone-500 leading-relaxed">{t.feature3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* GEO / Local Search Section */}
      <section className="py-20 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-xl">
              <div className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/40">
                <MapPin className="mr-1.5 h-3.5 w-3.5" />
                Local Partners
              </div>
              <h2 className="font-serif text-3xl font-bold md:text-4xl">
                {t.geoTitle}
              </h2>
              <p className="text-lg text-stone-300 leading-relaxed">
                {t.geoDesc}
              </p>
            </div>
            <div className="w-full max-w-md bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-2xl">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.geoSearchPlaceholder}
                    className="w-full h-12 pl-10 pr-4 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    aria-label="Search location"
                  />
                </div>
                <Button type="submit" className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105">
                  {t.geoSearchButton}
                </Button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-stone-400 flex items-center">Popular:</span>
                {["San Jose", "Sunnyvale", "Santa Clara", "Milpitas"].map((city) => (
                  <button
                    key={city}
                    onClick={() => handleQuickSearch(city)}
                    className="text-xs text-stone-300 bg-white/10 px-2.5 py-1 rounded-md cursor-pointer hover:bg-white/20 hover:text-white transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consulting Services Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white px-8 py-16 md:px-16 md:py-20 text-center md:text-left shadow-xl border border-stone-100">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="space-y-6 max-w-2xl">
                <h2 className="font-serif text-3xl font-bold text-stone-900 md:text-5xl leading-tight">
                  {t.consultingTitle}
                </h2>
                <p className="text-xl text-stone-500 leading-relaxed">
                  {t.consultingDesc}
                </p>
              </div>
              <Button asChild size="lg" className="bg-stone-900 text-white hover:bg-stone-800 hover:scale-105 transition-all duration-300 shadow-xl h-16 px-10 text-lg font-semibold shrink-0">
                <a
                  href="https://cpr.waymakerbiz.com/consulting"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.learnConsulting}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Partners Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end border-b border-stone-100 pb-8">
            <div className="space-y-4">
              <h2 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
                {t.featuredTitle}
              </h2>
              <p className="text-xl text-stone-500 max-w-xl">
                {t.featuredDesc}
              </p>
            </div>
            <Button asChild variant="ghost" className="group text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold text-lg px-6 py-6">
              <Link href="/partners">
                {t.viewAll}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPartners.map((partner) => (
              <div key={partner.slug} className="transform transition-all duration-300 hover:-translate-y-2">
                <PartnerCard partner={partner} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition / CTA Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/0 to-indigo-950/50"></div>
        
        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <h2 className="mb-8 font-serif text-4xl font-bold text-white md:text-6xl tracking-tight">
            {t.ctaTitle}
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-indigo-100 leading-relaxed">
            {t.ctaDesc}
          </p>
          <Button asChild size="lg" className="rounded-full bg-white text-indigo-900 hover:bg-indigo-50 hover:scale-105 transition-all duration-300 shadow-2xl shadow-indigo-900/50 h-16 px-12 text-lg font-bold">
            <Link href="/book-tour">
              {t.scheduleNow}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
