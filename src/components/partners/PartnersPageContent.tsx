"use client";

import { useEffect, useMemo, useState } from "react";
import { partners } from "@/data/partners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { useLanguage } from "@/context/LanguageContext";
import { cityName, partnerCities } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

const CITIES = partnerCities();

const copy = {
  en: {
    eyebrow: "Licensed Bay Area daycares",
    title: "Find the Perfect Daycare",
    subtitle: "Every partner is state-licensed. Compare photos, license numbers and tour hours, then book a visit.",
    searchLabel: "Search daycares by name or city",
    searchPlaceholder: "Search by name or city (e.g. Sunnyvale)",
    search: "Search",
    clear: "Clear search",
    allCities: "All cities",
    filterLabel: "Filter by city",
    results: (n: number) => `${n} ${n === 1 ? "daycare" : "daycares"} found`,
    noResults: "No daycares match your search.",
    showAll: "Show all daycares",
  },
  zh: {
    eyebrow: "灣區持照幼兒園",
    title: "尋找理想的幼兒園",
    subtitle: "每一家合作幼兒園都有加州執照。比較照片、執照號碼和參觀時間，再預約參觀。",
    searchLabel: "依名稱或城市搜尋幼兒園",
    searchPlaceholder: "搜尋名稱或城市（例如：桑尼維爾）",
    search: "搜尋",
    clear: "清除搜尋",
    allCities: "所有城市",
    filterLabel: "依城市篩選",
    results: (n: number) => `找到 ${n} 家幼兒園`,
    noResults: "沒有符合搜尋條件的幼兒園。",
    showAll: "顯示所有幼兒園",
  },
};

function matches(term: string) {
  const needle = term.trim().toLowerCase();
  if (!needle) return () => true;
  return (partner: (typeof partners)[number]) =>
    [partner.name, partner.name_zh, partner.address, partner.address_zh]
      .some((field) => field?.toLowerCase().includes(needle));
}

export function PartnersPageContent() {
  const { locale } = useLanguage();
  const t = copy[locale] ?? copy.en;
  const [searchTerm, setSearchTerm] = useState("");

  // Honour /partners?search=... from the homepage search. Read once after
  // hydration (instead of useSearchParams) so the page stays statically rendered.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("search");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL after hydration
    if (initial) setSearchTerm(initial);
  }, []);

  const filteredPartners = useMemo(() => partners.filter(matches(searchTerm)), [searchTerm]);
  // Chips search in the page's language: address_zh contains the Chinese city name.
  const term = searchTerm.trim().toLowerCase();
  const activeCity = CITIES.find(({ city }) => [city, cityName(city, locale)].some((n) => n.toLowerCase() === term))?.city;

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative overflow-hidden border-b border-stone-100 bg-[#F8FAF9] py-16 md:py-24">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute right-[-10%] top-[-20%] h-[70%] w-[70%] rounded-full bg-[#73BBD1]/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] h-[70%] w-[70%] rounded-full bg-[#A8D5BA]/15 blur-[100px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#0F6C8C]">{t.eyebrow}</p>
          <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight text-[#0F3B4C] md:text-6xl">{t.title}</h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl">{t.subtitle}</p>

          <form role="search" onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-xl">
            <label htmlFor="partner-search" className="sr-only">{t.searchLabel}</label>
            <div className="flex items-center rounded-full border border-stone-200 bg-white p-2 shadow-xl shadow-stone-200/60 focus-within:ring-2 focus-within:ring-[#0F6C8C]">
              <Search aria-hidden="true" className="ml-3 h-5 w-5 shrink-0 text-[#0F3B4C]" />
              <input
                id="partner-search"
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-stone-800 placeholder:text-stone-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label={t.clear}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>

          <div role="group" aria-label={t.filterLabel} className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
            {[{ city: "", count: partners.length }, ...CITIES].map(({ city, count }) => {
              const pressed = city ? activeCity === city : !searchTerm.trim();
              return (
                <button
                  key={city || "all"}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setSearchTerm(city ? cityName(city, locale) : "")}
                  className={cn(
                    "min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors",
                    pressed
                      ? "border-[#0F3B4C] bg-[#0F3B4C] text-white"
                      : "border-stone-200 bg-white text-[#0F3B4C] hover:border-[#0F6C8C] hover:bg-[#F0F9F6]",
                  )}
                >
                  {city ? cityName(city, locale) : t.allCities} <span className={pressed ? "text-white/80" : "text-stone-500"}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <p role="status" className="mb-8 text-sm font-medium text-stone-600">{t.results(filteredPartners.length)}</p>
        {filteredPartners.length > 0 ? (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {filteredPartners.map((partner, index) => (
              <li key={partner.slug}>
                <PartnerCard partner={partner} headingLevel="h2" priority={index < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
              <Search aria-hidden="true" className="h-8 w-8 text-stone-400" />
            </div>
            <p className="mb-6 text-lg text-stone-600">{t.noResults}</p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="min-h-11 rounded-full bg-[#0F3B4C] px-6 font-semibold text-white hover:bg-[#0F6C8C]"
            >
              {t.showAll}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
