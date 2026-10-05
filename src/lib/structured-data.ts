/**
 * schema.org JSON-LD builders. Pure functions so they can be unit-tested and
 * shared between pages without copy-pasting address parsing or domains.
 *
 * Page-level data is localized: the Chinese page at `/zh/...` carries Chinese names,
 * descriptions and URLs with `inLanguage: "zh-Hant"`, so answer engines can quote it in
 * Chinese. Entity `@id`s stay language-neutral so both pages describe the same thing.
 */
import type { Partner } from "@/lib/types";
import type { FaqItem } from "@/data/faq";
import {
  OFFICIAL_SOURCES, PATHS, PATH_ROUTES, PRICING, TIMELINE_ROUTE, hubCopy, pathCopy, timelineCopy, type ProviderPath,
} from "@/data/consulting";
import { HTML_LANG, localizePath, type Locale } from "@/lib/i18n";
import { CONTACT, SITE_NAME, SITE_URL, absoluteUrl, parseAddress, partnerCities } from "@/lib/site";

type JsonLd = Record<string, unknown>;

const CONTEXT = "https://schema.org";
const ORG_ID = `${SITE_URL}/#organization`;

const COPY = {
  en: {
    orgDescription:
      "Waymaker Daycare helps Bay Area families find licensed daycares and book in-person tours, in English or Chinese.",
    listName: "Licensed daycares in the Waymaker network",
  },
  zh: {
    orgDescription: "Waymaker Daycare 協助灣區家庭尋找持照幼兒園，並用中文或英文預約實地參觀。",
    listName: "Waymaker 合作的持照幼兒園",
  },
} as const;

const localizedUrl = (path: string, locale: Locale) => absoluteUrl(localizePath(path, locale));

function postalAddress(address: string): JsonLd {
  const parsed = parseAddress(address);
  return { "@type": "PostalAddress", ...parsed, addressCountry: "US" };
}

function localizedPartner(partner: Partner, locale: Locale) {
  const zh = locale === "zh";
  return {
    name: zh && partner.name_zh ? partner.name_zh : partner.name,
    alternateName: zh ? partner.name : partner.name_zh,
    description: zh && partner.description_zh ? partner.description_zh : partner.description,
  };
}

export function organizationJsonLd(locale: Locale = "en"): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: localizedUrl("/", locale),
    logo: absoluteUrl("/waymaker-logo.svg"),
    email: CONTACT.email,
    telephone: CONTACT.phoneE164,
    description: COPY[locale].orgDescription,
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

export function websiteJsonLd(locale: Locale = "en"): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: SITE_NAME,
    url: localizedUrl("/", locale),
    publisher: { "@id": ORG_ID },
    inLanguage: HTML_LANG[locale],
    potentialAction: {
      "@type": "SearchAction",
      target: `${localizedUrl("/partners", locale)}?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function childCareJsonLd(partner: Partner, locale: Locale = "en"): JsonLd {
  const path = `/partners/${partner.slug}`;
  const { name, alternateName, description } = localizedPartner(partner, locale);
  return {
    "@context": CONTEXT,
    "@type": "ChildCare",
    "@id": `${absoluteUrl(path)}#childcare`,
    name,
    ...(alternateName && { alternateName }),
    description,
    url: localizedUrl(path, locale),
    image: partner.images.map((image) => absoluteUrl(image)),
    logo: absoluteUrl(partner.logo),
    address: postalAddress(partner.address),
    telephone: partner.phone,
    email: partner.email,
    ...(partner.website && { sameAs: [partner.website] }),
    identifier: { "@type": "PropertyValue", name: "California facility license", value: partner.license },
  };
}

export function partnerListJsonLd(list: Partner[], locale: Locale = "en"): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    name: COPY[locale].listName,
    inLanguage: HTML_LANG[locale],
    numberOfItems: list.length,
    itemListElement: list.map((partner, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: localizedUrl(`/partners/${partner.slug}`, locale),
      name: localizedPartner(partner, locale).name,
    })),
  };
}

/** `path`s are English site paths; they are localized here. */
export function breadcrumbJsonLd(items: { name: string; path: string }[], locale: Locale = "en"): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localizedUrl(item.path, locale),
    })),
  };
}

export function faqJsonLd(items: FaqItem[], locale: Locale = "en"): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    inLanguage: HTML_LANG[locale],
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * One licence path as a Service with its monthly Offer. Prices come from `PRICING`, the
 * same constant the visible page renders, so the markup can never advertise a different number.
 */
export function providerServiceJsonLd(path: ProviderPath, locale: Locale = "en"): JsonLd {
  const p = pathCopy[locale][path];
  const route = PATH_ROUTES[path];
  return {
    "@context": CONTEXT,
    "@type": "Service",
    "@id": `${SITE_URL}${route}#service`,
    serviceType: locale === "zh" ? "幼兒園開業與執照顧問" : "Child care licensing and startup consulting",
    name: p.meta.title,
    description: p.meta.description,
    url: localizedUrl(route, locale),
    inLanguage: HTML_LANG[locale],
    availableLanguage: ["en", "zh-Hant"],
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "State", name: "California" },
    audience: { "@type": "BusinessAudience", audienceType: p.name },
    offers: {
      "@type": "Offer",
      url: localizedUrl(route, locale),
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: PRICING[path].monthly,
        priceCurrency: "USD",
        unitCode: "MON",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
      },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: p.name,
      itemListElement: p.services.map((item) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: item.title } })),
    },
  };
}

/** The hub lists both path services so a crawler can follow either. */
export function providerHubJsonLd(locale: Locale = "en"): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    name: hubCopy[locale].meta.title,
    inLanguage: HTML_LANG[locale],
    itemListElement: PATHS.map((path, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: localizedUrl(PATH_ROUTES[path], locale),
      name: pathCopy[locale][path].name,
    })),
  };
}

/** Licensing timeline as a HowTo per path. Durations are estimates and say so. */
export function licensingHowToJsonLd(path: ProviderPath, locale: Locale = "en"): JsonLd {
  const t = timelineCopy[locale];
  return {
    "@context": CONTEXT,
    "@type": "HowTo",
    name: `${t.title} (${pathCopy[locale][path].name})`,
    description: `${t.totalLabel}: ${t.paths[path].total}. ${t.disclaimer}`,
    inLanguage: HTML_LANG[locale],
    url: `${localizedUrl(TIMELINE_ROUTE, locale)}#${path}`,
    step: t.paths[path].steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: `${step.body} (${step.duration})`,
      url: OFFICIAL_SOURCES[step.source].url,
    })),
  };
}
