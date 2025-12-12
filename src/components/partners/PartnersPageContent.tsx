"use client";

import { useState } from "react";
import { partners } from "@/data/partners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { useLanguage } from "@/context/LanguageContext";
import { Search, MapPin } from "lucide-react";

export function PartnersPageContent() {
  const { locale } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const copy = {
    en: {
      title: "Find the Perfect Daycare",
      subtitle: "Trusted, licensed, and nurturing environments for your child.",
      searchPlaceholder: "Search by name or city (e.g. San Jose, Milpitas)...",
      noResults: "No daycares found matching your search.",
      allLocations: "All Locations"
    },
    zh: {
      title: "尋找理想的幼兒園",
      subtitle: "為您的孩子提供值得信賴、獲得許可且充滿關愛的環境。",
      searchPlaceholder: "搜尋名稱或城市（例如：San Jose, Milpitas）...",
      noResults: "沒有找到符合您搜尋條件的幼兒園。",
      allLocations: "所有地點"
    }
  };

  const t = copy[locale] ?? copy.en;

  const filteredPartners = partners.filter(partner => {
    const term = searchTerm.toLowerCase();
    const nameMatch = partner.name.toLowerCase().includes(term) || 
                      (partner.name_zh && partner.name_zh.toLowerCase().includes(term));
    const addressMatch = partner.address.toLowerCase().includes(term) || 
                         (partner.address_zh && partner.address_zh.toLowerCase().includes(term));
    return nameMatch || addressMatch;
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="relative bg-[#F8FAF9] py-24 md:py-32 overflow-hidden border-b border-stone-100">
        {/* Sophisticated Background */}
        <div className="absolute inset-0 w-full h-full">
          {/* Subtle Gradient Mesh */}
          <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#73BBD1]/10 blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#A8D5BA]/15 blur-[100px] mix-blend-multiply"></div>
          <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full bg-[#D2EFE5]/30 blur-[80px] mix-blend-multiply"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="mb-6 font-serif text-4xl font-bold text-[#0F3B4C] md:text-6xl tracking-tight">
            {t.title}
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-stone-600 md:text-xl font-light leading-relaxed">
            {t.subtitle}
          </p>

          {/* Search Bar */}
          <div className="mx-auto max-w-xl relative group">
            {/* Glow effect behind search bar */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#73BBD1] to-[#A8D5BA] rounded-full blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-xl shadow-stone-200/60 border border-stone-100 overflow-hidden p-2">
              <div className="pl-4 text-[#0F3B4C]">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 text-stone-800 placeholder:text-stone-400 focus:outline-none bg-transparent text-base"
              />
              <button className="hidden sm:block bg-[#0F3B4C] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#134E63] transition-colors shadow-md">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        {filteredPartners.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {filteredPartners.map((partner) => (
              <PartnerCard key={partner.slug} partner={partner} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
              <Search className="h-8 w-8 text-stone-400" />
            </div>
            <p className="text-lg text-stone-500">{t.noResults}</p>
          </div>
        )}
      </div>
    </div>
  );
}
