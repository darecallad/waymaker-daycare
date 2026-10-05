"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { localizePath } from "@/lib/i18n";

/**
 * `next/link` that stays in the current language.
 *
 * Components keep writing the English path (`/partners`); on a Chinese page this resolves
 * it to `/zh/partners`, so a visitor -- or a crawler following links -- never falls out of
 * the Chinese site. External, `mailto:` and `tel:` links pass through.
 */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { locale } = useLanguage();
  const localized = typeof href === "string" ? localizePath(href, locale) : href;
  return <NextLink href={localized} {...props} />;
}

/** The current language's version of an internal path, for places that cannot use `Link`. */
export function useLocalizedPath() {
  const { locale } = useLanguage();
  return (href: string) => localizePath(href, locale);
}
