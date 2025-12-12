"use client";

import { partners } from "@/data/partners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { useLanguage } from "@/context/LanguageContext";

export function PartnersPageContent() {
  const { locale } = useLanguage();

  const copy = {
    en: {
      title: "Our Partner Daycares",
      description: "We work with the best local providers to ensure your child receives top-quality care and education."
    },
    zh: {
      title: "我們的合作幼兒園",
      description: "我們與當地最好的提供者合作，確保您的孩子獲得最優質的照顧和教育。"
    }
  };

  const t = copy[locale] ?? copy.en;

  return (
    <div className="bg-stone-50 min-h-screen py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-stone-900 md:text-5xl">
            {t.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-stone-600">
            {t.description}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <PartnerCard key={partner.slug} partner={partner} />
          ))}
        </div>
      </div>
    </div>
  );
}
