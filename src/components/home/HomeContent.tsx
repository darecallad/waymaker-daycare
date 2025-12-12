"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import { partners } from "@/data/partners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export function HomeContent() {
  const { locale } = useLanguage();

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
      consultingTitle: "Expert Daycare Consulting",
      consultingDesc: "Looking to start or improve your own daycare business? Our consulting services provide the guidance you need to succeed in the childcare industry.",
      learnConsulting: "Learn About Consulting",
      featuredTitle: "Featured Partners",
      featuredDesc: "Explore our network of highly-rated childcare providers, each vetted for quality and safety.",
      viewAll: "View All Partners",
      ctaTitle: "Ready to visit a center?",
      ctaDesc: "Scheduling a tour is the best way to experience the environment and meet the teachers. It takes less than 2 minutes to book.",
      scheduleNow: "Schedule Your Tour Now"
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
      consultingTitle: "專業幼兒園諮詢",
      consultingDesc: "想要創辦或改善您的幼兒園業務嗎？我們的諮詢服務為您提供在幼兒保育行業取得成功所需的指導。",
      learnConsulting: "了解諮詢服務",
      featuredTitle: "精選合作夥伴",
      featuredDesc: "探索我們的高評價幼兒保育提供者網絡，每一家都經過質量和安全審查。",
      viewAll: "查看所有合作夥伴",
      ctaTitle: "準備好參觀中心了嗎？",
      ctaDesc: "預約參觀是體驗環境和會見老師的最佳方式。預約只需不到 2 分鐘。",
      scheduleNow: "立即預約參觀"
    }
  };

  const t = copy[locale] ?? copy.en;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-50 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20">
                <Star className="mr-1.5 h-3.5 w-3.5 fill-indigo-600" />
                {t.trusted}
              </div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
                {t.title} <span className="text-indigo-600">{t.titleSuffix}</span>
              </h1>
              <p className="text-lg text-stone-600 leading-relaxed max-w-lg">
                {t.description}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-12 px-6 text-base">
                  <Link href="/partners">
                    {t.findDaycare}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-white text-stone-900 border-stone-200 hover:bg-stone-50 hover:text-indigo-600 shadow-sm h-12 px-6 text-base">
                  <Link href="/book-tour">
                    {t.bookTour}
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-stone-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{t.licensed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{t.verified}</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-100 to-stone-100" />
              {/* Placeholder for Hero Image - In a real app, use a high-quality photo */}
              <div className="absolute inset-4 overflow-hidden rounded-xl bg-white shadow-2xl">
                 <div className="flex h-full items-center justify-center bg-stone-100 text-stone-400">
                    <Image 
                      src="/home-hero.jpg" 
                      alt="Happy children playing" 
                      fill 
                      className="object-cover"
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consulting Services Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="rounded-3xl bg-stone-900 p-8 md:p-16 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
                  {t.consultingTitle}
                </h2>
                <p className="text-lg text-stone-300 leading-relaxed">
                  {t.consultingDesc}
                </p>
              </div>
              <Button asChild size="lg" className="bg-white text-stone-900 hover:bg-stone-100 hover:scale-105 transition-transform shadow-lg h-14 px-8 text-lg">
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
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold text-stone-900 md:text-4xl">
                {t.featuredTitle}
              </h2>
              <p className="text-stone-500 max-w-xl">
                {t.featuredDesc}
              </p>
            </div>
            <Button asChild variant="link" className="group text-indigo-600 hover:text-indigo-800 font-semibold p-0 h-auto text-base">
              <Link href="/partners">
                {t.viewAll}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPartners.map((partner) => (
              <PartnerCard key={partner.slug} partner={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition / CTA Section */}
      <section className="bg-indigo-900 py-20 text-white md:py-32">
        <div className="container mx-auto px-4 text-center md:px-6">
          <h2 className="mb-6 font-serif text-3xl font-bold md:text-5xl">
            {t.ctaTitle}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-indigo-100">
            {t.ctaDesc}
          </p>
          <Button asChild size="lg" className="rounded-full bg-white text-indigo-900 hover:bg-indigo-50 hover:scale-105 transition-transform shadow-lg h-16 px-8 text-lg font-bold">
            <Link href="/book-tour">
              {t.scheduleNow}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
