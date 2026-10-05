/**
 * Single source of truth for site-wide identity: canonical domain, contact
 * details and the cities our partners actually operate in.
 *
 * Every absolute URL (metadata, sitemap, JSON-LD, emails) must come from here so
 * search engines never see two competing domains again.
 */
import { partners } from "@/data/partners";

const DEFAULT_SITE_URL = "https://daycare.waymakerbiz.com";

export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
export const SITE_NAME = "Waymaker Daycare";

export const CONTACT = {
  email: "daycare@waymakerbiz.com",
  phone: "(408) 590-3617",
  phoneE164: "+14085903617",
  streetAddress: "2586 Seaboard Ave",
  city: "San Jose",
  region: "CA",
  postalCode: "95131",
  country: "US",
} as const;

/** Business-level service area shown in the footer (not limited to partner cities). */
export const SERVICE_AREAS = [
  "San Jose", "Milpitas", "Santa Clara", "Sunnyvale",
  "Cupertino", "Mountain View", "Fremont", "Newark",
  "Campbell", "Los Altos", "San Lorenzo",
] as const;

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface ParsedAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode?: string;
}

/**
 * Parses the partner address formats used in `partners.ts`, e.g.
 * "551 maple Ave, Sunnyvale CA 94085" or "1075 W Washington Ave, Sunnyvale, CA 94086".
 */
export function parseAddress(address: string): ParsedAddress {
  const [street = "", ...rest] = address.split(",").map((part) => part.trim());
  const locality = rest.join(" ").replace(/\s+/g, " ").trim();
  const match = locality.match(/^(.*?)\s+([A-Z]{2})\s+(\d{5})$/);

  return {
    streetAddress: street,
    addressLocality: match ? match[1] : locality,
    addressRegion: match ? match[2] : "CA",
    postalCode: match ? match[3] : address.match(/\b\d{5}\b/)?.[0],
  };
}

/** Partner cities with counts, most partners first. Derived, so it can never drift from the data. */
export function partnerCities(list = partners): { city: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const partner of list) {
    const city = parseAddress(partner.address).addressLocality;
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}
