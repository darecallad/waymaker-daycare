/**
 * Locale routing.
 *
 * English lives at the bare path (`/partners`) and Chinese under `/zh` (`/zh/partners`).
 * The language used to be a client-side toggle on one URL, so the server -- and every
 * crawler and answer engine reading it -- only ever saw English: the Chinese copy existed
 * but could not be indexed, quoted or linked to. Each language now has its own URL that
 * renders in that language on the server.
 *
 * Internally every public page sits under `app/[lang]`; `src/proxy.ts` rewrites the bare
 * English paths onto `/en/...` so existing URLs keep working unchanged.
 *
 * Kept free of React and of `@/data` so the proxy can import it.
 */

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Remembers an explicit language choice, so a returning visitor lands in it. */
export const LOCALE_COOKIE = "waymaker-locale";

/** `hreflang` / `<html lang>` value. The Chinese copy is Traditional Chinese. */
export const HTML_LANG: Record<Locale, string> = { en: "en", zh: "zh-Hant" };

/** Open Graph locale. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", zh: "zh_TW" };

const LOCALE_PREFIX = /^\/(en|zh)(?=\/|$)/;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** The path without its locale prefix: `/zh/partners` -> `/partners`, `/zh` -> `/`. */
export function stripLocale(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX, "") || "/";
}

/**
 * The internal `app/[lang]` route that serves a page, e.g. `/en/partners`.
 *
 * Unlike {@link localizePath}, English keeps its prefix: this is the path Next.js renders,
 * which the proxy rewrites to.
 */
export function routePath(path: string, locale: Locale): string {
  const bare = stripLocale(path);
  return bare === "/" ? `/${locale}` : `/${locale}${bare}`;
}

/**
 * The public URL of an internal link in the given language.
 *
 * External links, `mailto:`/`tel:` and bare fragments pass through untouched. Idempotent,
 * so an already-localised path is never prefixed twice.
 */
export function localizePath(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;

  const split = href.search(/[?#]/);
  const path = stripLocale(split === -1 ? href : href.slice(0, split));
  const rest = split === -1 ? "" : href.slice(split);

  if (locale === defaultLocale) return path + rest;
  return (path === "/" ? `/${locale}` : `/${locale}${path}`) + rest;
}
