"use client";

import { useEffect, useMemo, useState } from "react";
import { partners } from "@/data/partners";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { useLanguage } from "@/context/LanguageContext";
import { CONTACT, cityName, partnerCities } from "@/lib/site";
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
    orContact: "Or contact us:",
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
    orContact: "或直接聯絡我們：",
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
      <section className="bg-mist px-4 pb-1 pt-5 md:px-6 md:pb-0 md:pt-14 md:text-center">
        <p className="mb-3 hidden text-sm font-semibold uppercase tracking-widest text-link md:block">{t.eyebrow}</p>
        <h1 className="font-serif text-[28px] font-bold leading-tight tracking-tight text-ink md:text-5xl">{t.title}</h1>
        <p className="mx-auto mt-4 hidden max-w-2xl text-lg leading-relaxed text-text-2 md:block">{t.subtitle}</p>
      </section>

      <div className="sticky top-[80px] z-30 border-b border-line bg-mist px-4 pb-2 pt-2 shadow-[0_8px_16px_-14px_rgba(15,59,76,0.5)] md:static md:px-6 md:pb-10 md:pt-5 md:shadow-none">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-[560px]">
          <label htmlFor="partner-search" className="sr-only">{t.searchLabel}</label>
          <div className="flex min-h-12 items-center rounded-full border-[1.5px] border-field bg-white pl-4 pr-1 has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus md:min-h-[52px]">
            <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-ink" />
            <input
              id="partner-search"
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base text-text placeholder:text-text-3 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label={t.clear}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-2 hover:bg-stone-100 hover:text-text"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            )}
          </div>
        </form>

        <div
          role="group"
          aria-label={t.filterLabel}
          className="-mx-4 mt-2 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-auto md:mt-3.5 md:max-w-3xl md:flex-wrap md:justify-center md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {[{ city: "", count: partners.length }, ...CITIES].map(({ city, count }) => {
            const pressed = city ? activeCity === city : !searchTerm.trim();
            return (
              <button
                key={city || "all"}
                type="button"
                aria-pressed={pressed}
                onClick={() => setSearchTerm(city ? cityName(city, locale) : "")}
                className={cn(
                  "min-h-11 shrink-0 whitespace-nowrap rounded-full border-[1.5px] px-3.5 text-sm font-semibold transition-colors",
                  pressed
                    ? "border-ink bg-ink text-white"
                    : "border-field bg-white text-ink hover:bg-mint-tint",
                )}
              >
                {city ? cityName(city, locale) : t.allCities} <span className="font-medium opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-3 pb-12 pt-2 md:px-8 md:pb-16 md:pt-6">
        <p role="status" className="mb-2 px-1 text-sm font-medium text-text-2 md:mb-6 md:px-0">{t.results(filteredPartners.length)}</p>
        {filteredPartners.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-7 lg:grid-cols-3">
            {filteredPartners.map((partner) => (
              <li key={partner.slug} className="flex">
                <PartnerCard partner={partner} headingLevel="h2" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
              <Search aria-hidden="true" className="h-8 w-8 text-text-2" />
            </div>
            <p className="mb-6 text-lg text-text-2">{t.noResults}</p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="min-h-11 rounded-full bg-ink px-6 font-semibold text-white hover:bg-ink-hover"
            >
              {t.showAll}
            </button>
            <p className="mt-5 text-[15px] text-text-2">
              {t.orContact}{" "}
              <a href={`tel:${CONTACT.phoneE164}`} className="font-semibold text-link underline underline-offset-2">{CONTACT.phone}</a>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
