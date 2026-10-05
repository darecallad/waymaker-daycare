/**
 * schema.org JSON-LD builders. Pure functions so they can be unit-tested and
 * shared between pages without copy-pasting address parsing or domains.
 */
import type { Partner } from "@/lib/types";
import type { FaqItem } from "@/data/faq";
import { CONTACT, SITE_NAME, SITE_URL, absoluteUrl, parseAddress, partnerCities } from "@/lib/site";

type JsonLd = Record<string, unknown>;

const CONTEXT = "https://schema.org";
const ORG_ID = `${SITE_URL}/#organization`;

function postalAddress(address: string): JsonLd {
  const parsed = parseAddress(address);
  return { "@type": "PostalAddress", ...parsed, addressCountry: "US" };
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/waymaker-logo.svg"),
    email: CONTACT.email,
    telephone: CONTACT.phoneE164,
    description:
      "Waymaker Daycare helps Bay Area families find licensed daycares and book in-person tours, in English or Chinese.",
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.streetAddress,
      addressLocality: CONTACT.city,
      addressRegion: CONTACT.region,
      postalCode: CONTACT.postalCode,
      addressCountry: CONTACT.country,
    },
    areaServed: partnerCities().map(({ city }) => ({ "@type": "City", name: `${city}, CA` })),
    knowsLanguage: ["en", "zh-Hant"],
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": ORG_ID },
    inLanguage: ["en", "zh-Hant"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/partners")}?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function childCareJsonLd(partner: Partner): JsonLd {
  const url = absoluteUrl(`/partners/${partner.slug}`);
  return {
    "@context": CONTEXT,
    "@type": "ChildCare",
    "@id": `${url}#childcare`,
    name: partner.name,
    ...(partner.name_zh && { alternateName: partner.name_zh }),
    description: partner.description,
    url,
    image: partner.images.map((image) => absoluteUrl(image)),
    logo: absoluteUrl(partner.logo),
    address: postalAddress(partner.address),
    telephone: partner.phone,
    email: partner.email,
    ...(partner.website && { sameAs: [partner.website] }),
    identifier: { "@type": "PropertyValue", name: "California facility license", value: partner.license },
  };
}

export function partnerListJsonLd(list: Partner[]): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    name: "Licensed daycares in the Waymaker network",
    numberOfItems: list.length,
    itemListElement: list.map((partner, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/partners/${partner.slug}`),
      name: partner.name,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: FaqItem[]): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
