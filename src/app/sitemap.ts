import type { MetadataRoute } from "next";
import { partners } from "@/data/partners";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/partners"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/book-tour"), changeFrequency: "monthly", priority: 0.7 },
  ];

  const partnerPages: MetadataRoute.Sitemap = partners.map((partner) => ({
    url: absoluteUrl(`/partners/${partner.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
    images: partner.images.map((image) => absoluteUrl(image)),
  }));

  return [...pages, ...partnerPages];
}
