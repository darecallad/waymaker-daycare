"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type Locale = "en" | "zh";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const STORAGE_KEY = "locale";
const HTML_LANG: Record<Locale, string> = { en: "en", zh: "zh-Hant" };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "zh";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start with the server's locale so hydration matches, then restore
  // the visitor's saved choice. Reading localStorage during render caused a
  // hydration mismatch for every Chinese-language visitor.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external store after hydration
    if (isLocale(saved)) setLocaleState(saved);
  }, []);

  // Keep <html lang> truthful for screen readers, translation tools and crawlers.
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
