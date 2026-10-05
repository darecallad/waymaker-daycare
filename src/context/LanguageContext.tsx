"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, localizePath, type Locale } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/** A year: the choice should outlive the session. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The page's language, which is the URL's language.
 *
 * It used to be client state read from localStorage after hydration, so the server always
 * rendered English and the Chinese copy was invisible to crawlers. Now the `[lang]`
 * segment decides it on the server, and switching language navigates to the same page's
 * URL in the other language.
 */
export function LanguageProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      // Remembered so the proxy can send a returning visitor to the language they chose
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
      router.push(localizePath(pathname, next) + window.location.search + window.location.hash);
    },
    [locale, pathname, router],
  );

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
