import type { MetadataRoute } from "next";
import { partners } from "@/data/partners";
import { locales } from "@/lib/i18n";
import { localizedUrl } from "@/lib/page-metadata";
import { absoluteUrl } from "@/lib/site";

type Entry = MetadataRoute.Sitemap[number];

/**
 * Every public page in both languages. Each URL lists its counterpart as an hreflang
 * alternate, which is how search engines learn that /zh/partners is the Chinese
 * version of /partners rather than a duplicate.
 */
function bothLanguages(path: string, entry: Omit<Entry, "url" | "alternates">): Entry[] {
  const languages = { en: localizedUrl(path, "en"), "zh-Hant": localizedUrl(path, "zh") };
  return locales.map((locale) => ({ url: localizedUrl(path, locale), alternates: { languages }, ...entry }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...bothLanguages("/", { changeFrequency: "monthly", priority: 1 }),
    ...bothLanguages("/partners", { changeFrequency: "weekly", priority: 0.9 }),
    ...bothLanguages("/book-tour", { changeFrequency: "monthly", priority: 0.7 }),
    ...partners.flatMap((partner) =>
      bothLanguages(`/partners/${partner.slug}`, {
        changeFrequency: "monthly",
        priority: 0.8,
        images: partner.images.map((image) => absoluteUrl(image)),
      }),
    ),
  ];
}
