/**
 * Per-language page metadata.
 *
 * Every public page exists twice -- English at `/partners`, Chinese at `/zh/partners` --
 * and each copy must say which language it is in, point its canonical at itself rather
 * than at the other language, and list the other language as an hreflang alternate.
 */
import type { Metadata } from "next";
import { OG_LOCALE, defaultLocale, isLocale, localizePath, type Locale } from "@/lib/i18n";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

/** Route params of anything under `app/[lang]`. */
export interface LangParams {
  params: Promise<{ lang: string }>;
}

export async function resolveLocale(params: LangParams["params"]): Promise<Locale> {
  const { lang } = await params;
  return isLocale(lang) ? lang : defaultLocale;
}

/** Absolute URL of a page in one language. */
export function localizedUrl(path: string, locale: Locale): string {
  return absoluteUrl(localizePath(path, locale));
}

/** hreflang targets. `x-default` is English: what a searcher in neither language gets. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    en: localizedUrl(path, "en"),
    "zh-Hant": localizedUrl(path, "zh"),
    "x-default": localizedUrl(path, "en"),
  };
}

/** Title, description and social copy for one language of a page. */
export interface PageCopy {
  /** Without the brand suffix: the root title template adds it. */
  title: string;
  description: string;
  /** Shorter social description; falls back to `description`. */
  socialDescription?: string;
}

/**
 * Full metadata for one language of a page: self-referencing canonical, hreflang
 * alternates, and Open Graph / Twitter in the page's language.
 *
 * @param path - Site-relative English path, e.g. `/partners`
 */
export function pageMetadata(
  path: string,
  locale: Locale,
  copy: PageCopy,
  extra: { absoluteTitle?: boolean; images?: { url: string; alt: string }[] } = {},
): Metadata {
  const url = localizedUrl(path, locale);
  const socialTitle = extra.absoluteTitle ? copy.title : `${copy.title} | ${SITE_NAME}`;
  const socialDescription = copy.socialDescription ?? copy.description;

  return {
    title: extra.absoluteTitle ? { absolute: copy.title } : copy.title,
    description: copy.description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[locale === "en" ? "zh" : "en"]],
      ...(extra.images && { images: extra.images }),
    },
    twitter: { title: socialTitle, description: socialDescription },
  };
}
