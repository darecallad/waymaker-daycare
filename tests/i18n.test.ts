import { test } from "node:test";
import assert from "node:assert/strict";
import { partners } from "@/data/partners";
import { getFaq } from "@/data/faq";
import { localizePath, routePath, stripLocale } from "@/lib/i18n";
import { languageAlternates, pageMetadata } from "@/lib/page-metadata";
import { SITE_URL, cityName, parseAddress } from "@/lib/site";
import { breadcrumbJsonLd, childCareJsonLd, faqJsonLd, partnerListJsonLd, websiteJsonLd } from "@/lib/structured-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only dynamic access
type Ld = any;
const asCrawler = (data: unknown): Ld => JSON.parse(JSON.stringify(data));

test("localizePath: English is bare, Chinese is under /zh, idempotent", () => {
  assert.equal(localizePath("/", "en"), "/");
  assert.equal(localizePath("/", "zh"), "/zh");
  assert.equal(localizePath("/partners", "zh"), "/zh/partners");
  assert.equal(localizePath("/zh/partners", "zh"), "/zh/partners");
  assert.equal(localizePath("/zh/partners", "en"), "/partners");
  assert.equal(localizePath("/partners?search=Newark#x", "zh"), "/zh/partners?search=Newark#x");
  assert.equal(localizePath("/book-tour?partner=a", "en"), "/book-tour?partner=a");
});

test("localizePath leaves external, mailto, tel and fragments alone", () => {
  for (const href of ["https://example.com", "//cdn.example.com/x", "mailto:a@b.c", "tel:+1408", "#faq"]) {
    assert.equal(localizePath(href, "zh"), href);
  }
});

test("stripLocale / routePath map public URLs onto app/[lang]", () => {
  assert.equal(stripLocale("/zh"), "/");
  assert.equal(stripLocale("/zh/partners/a"), "/partners/a");
  assert.equal(stripLocale("/zhong"), "/zhong", "only a whole segment is a locale");
  assert.equal(routePath("/", "en"), "/en");
  assert.equal(routePath("/partners", "en"), "/en/partners");
  assert.equal(routePath("/zh/partners", "zh"), "/zh/partners");
});

test("hreflang alternates list both languages and x-default=English", () => {
  assert.deepEqual(languageAlternates("/partners"), {
    en: `${SITE_URL}/partners`,
    "zh-Hant": `${SITE_URL}/zh/partners`,
    "x-default": `${SITE_URL}/partners`,
  });
});

test("Chinese page metadata self-canonicalises and uses zh_TW", () => {
  const meta = pageMetadata("/partners", "zh", { title: "合作幼兒園", description: "說明" });
  assert.equal(meta.alternates?.canonical, `${SITE_URL}/zh/partners`);
  assert.equal((meta.openGraph as Ld).url, `${SITE_URL}/zh/partners`);
  assert.equal((meta.openGraph as Ld).locale, "zh_TW");
  assert.deepEqual((meta.openGraph as Ld).alternateLocale, ["en_US"]);
  assert.equal(meta.description, "說明");
});

test("cityName uses the Chinese names already in partners.ts address_zh", () => {
  for (const partner of partners) {
    const city = parseAddress(partner.address).addressLocality;
    assert.ok(partner.address_zh?.includes(cityName(city, "zh")), `${partner.slug}: ${cityName(city, "zh")}`);
  }
  assert.equal(cityName("Sunnyvale", "en"), "Sunnyvale");
  assert.equal(cityName("Nowhere", "zh"), "Nowhere", "unknown cities fall back to English");
});

test("Chinese JSON-LD is in Chinese and points at /zh URLs", () => {
  const partner = partners[0];
  const ld = asCrawler(childCareJsonLd(partner, "zh"));
  assert.equal(ld.name, partner.name_zh);
  assert.equal(ld.alternateName, partner.name);
  assert.equal(ld.description, partner.description_zh);
  assert.equal(ld.url, `${SITE_URL}/zh/partners/${partner.slug}`);
  // Same entity in both languages
  assert.equal(ld["@id"], asCrawler(childCareJsonLd(partner, "en"))["@id"]);

  const list = asCrawler(partnerListJsonLd(partners, "zh"));
  assert.equal(list.inLanguage, "zh-Hant");
  assert.ok(list.itemListElement.every((i: Ld) => i.url.startsWith(`${SITE_URL}/zh/partners/`)));

  assert.equal(asCrawler(websiteJsonLd("zh")).potentialAction.target, `${SITE_URL}/zh/partners?search={search_term_string}`);
  assert.equal(asCrawler(breadcrumbJsonLd([{ name: "首頁", path: "/" }], "zh")).itemListElement[0].item, `${SITE_URL}/zh`);
});

test("Chinese FAQPage carries the Chinese questions", () => {
  const ld = asCrawler(faqJsonLd(getFaq("zh"), "zh"));
  assert.equal(ld.inLanguage, "zh-Hant");
  assert.match(ld.mainEntity[0].name, /[\u4e00-\u9fff]/);
  // City names must be the Chinese ones parents search with
  assert.match(JSON.stringify(ld), /桑尼維爾、紐瓦克、聖克拉拉/);
  assert.doesNotMatch(JSON.stringify(ld), /Sunnyvale/);
});
