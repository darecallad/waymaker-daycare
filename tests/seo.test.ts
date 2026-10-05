import { test } from "node:test";
import assert from "node:assert/strict";
import { partners } from "@/data/partners";
import { getFaq } from "@/data/faq";
import { SITE_URL, absoluteUrl, parseAddress, partnerCities } from "@/lib/site";
import {
  breadcrumbJsonLd, childCareJsonLd, faqJsonLd, organizationJsonLd, partnerListJsonLd, websiteJsonLd,
} from "@/lib/structured-data";

// JSON-LD is untyped by nature; parse it back from JSON exactly like a crawler would.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only dynamic access
type Ld = any;
const asCrawler = (data: unknown): Ld => JSON.parse(JSON.stringify(data));

test("SITE_URL is a single canonical origin without a trailing slash", () => {
  if (!process.env.NEXT_PUBLIC_BASE_URL) assert.equal(SITE_URL, "https://daycare.waymakerbiz.com");
  assert.doesNotMatch(SITE_URL, /\/$/);
  assert.equal(absoluteUrl("/partners"), `${SITE_URL}/partners`);
  assert.equal(absoluteUrl("partners"), `${SITE_URL}/partners`);
});

test("parseAddress handles both partner address formats", () => {
  assert.deepEqual(parseAddress("551 maple Ave, Sunnyvale CA 94085"), {
    streetAddress: "551 maple Ave", addressLocality: "Sunnyvale", addressRegion: "CA", postalCode: "94085",
  });
  assert.deepEqual(parseAddress("1075 W Washington Ave, Sunnyvale, CA 94086"), {
    streetAddress: "1075 W Washington Ave", addressLocality: "Sunnyvale", addressRegion: "CA", postalCode: "94086",
  });
  // Multi-word cities must not be truncated (the old JSON-LD did split(' ')[0]).
  assert.equal(parseAddress("1 Main St, Santa Clara CA 95051").addressLocality, "Santa Clara");
  assert.equal(parseAddress("1 Main St, Mountain View, CA 94040").addressLocality, "Mountain View");
});

test("every partner address parses to a city, CA and a ZIP", () => {
  for (const partner of partners) {
    const parsed = parseAddress(partner.address);
    assert.ok(parsed.addressLocality && !/\d/.test(parsed.addressLocality), `${partner.slug}: ${parsed.addressLocality}`);
    assert.equal(parsed.addressRegion, "CA", partner.slug);
    assert.match(parsed.postalCode ?? "", /^\d{5}$/, partner.slug);
  }
});

test("partnerCities is derived from data and sorted by count", () => {
  const cities = partnerCities();
  assert.equal(cities.reduce((sum, c) => sum + c.count, 0), partners.length);
  assert.deepEqual(cities.map((c) => c.city), ["Sunnyvale", "Newark", "Santa Clara"]);
});

test("no structured data leaks the old competing domain", () => {
  const all = JSON.stringify([
    organizationJsonLd(), websiteJsonLd(), partnerListJsonLd(partners),
    ...partners.flatMap((p) => [childCareJsonLd(p), childCareJsonLd(p, "zh")]),
  ]);
  assert.ok(!all.includes("waymaker-daycare.com"));
});

test("ChildCare JSON-LD uses absolute URLs, a structured address and the license", () => {
  const partner = partners[0];
  const ld = asCrawler(childCareJsonLd(partner));
  assert.equal(ld["@type"], "ChildCare");
  assert.equal(ld.url, `${SITE_URL}/partners/${partner.slug}`);
  assert.ok(ld.image.every((url: string) => url.startsWith(SITE_URL)));
  assert.equal(ld.address.addressLocality, "Santa Clara");
  assert.equal(ld.identifier.value, partner.license);
  // The partner's own website belongs in sameAs, never as our canonical url.
  assert.ok(!("openingHours" in ld), "free-text tour hours are not valid openingHours");
});

test("website SearchAction targets the ?search= param the partners page reads", () => {
  const ld = asCrawler(websiteJsonLd());
  assert.equal(ld.potentialAction.target, `${SITE_URL}/partners?search={search_term_string}`);
});

test("ItemList and BreadcrumbList are positioned and absolute", () => {
  const list = asCrawler(partnerListJsonLd(partners));
  assert.equal(list.numberOfItems, partners.length);
  assert.deepEqual(list.itemListElement.map((i: Ld) => i.position), partners.map((_, i) => i + 1));

  const crumbs = asCrawler(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Our Partners", path: "/partners" }]));
  assert.equal(crumbs.itemListElement[1].item, `${SITE_URL}/partners`);
});

test("FAQ has the same questions in both languages and stays price-free", () => {
  const en = getFaq("en");
  const zh = getFaq("zh");
  assert.equal(en.length, zh.length);
  for (const item of [...en, ...zh]) {
    assert.ok(item.question && item.answer);
    assert.doesNotMatch(item.answer, /\$\s?\d/, "FAQ must not quote prices");
  }
  assert.match(en.find((i) => i.question.includes("cities"))!.answer, /Sunnyvale, Newark, Santa Clara/);

  const ld = asCrawler(faqJsonLd(en));
  assert.equal(ld["@type"], "FAQPage");
  assert.equal(ld.mainEntity.length, en.length);
});
