import { test } from "node:test";
import assert from "node:assert/strict";
import { INQUIRY_STAGES, INQUIRY_TYPES, OFFICIAL_SOURCES, consultingCopy, getConsultingFaq } from "@/data/consulting";
import { parseProviderInquiry } from "@/lib/provider-inquiry";
import { SITE_URL } from "@/lib/site";
import { consultingServiceJsonLd } from "@/lib/structured-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only dynamic access
type Ld = any;
const asCrawler = (data: unknown): Ld => JSON.parse(JSON.stringify(data));
const allText = (value: unknown) => JSON.stringify(value);

const valid = {
  name: "Mei Chen", email: "mei@example.com", phone: "408-555-0100", city: "Sunnyvale",
  type: "family-small", stage: "exploring", language: "zh", message: "Hi",
};

test("inquiry: a valid submission is cleaned and accepted", () => {
  const result = parseProviderInquiry({ ...valid, name: "  Mei Chen  " });
  assert.ok(result.ok);
  assert.equal(result.value.name, "Mei Chen");
});

test("inquiry: phone and message are optional", () => {
  const { phone: _p, message: _m, ...rest } = valid;
  void _p; void _m;
  const result = parseProviderInquiry(rest);
  assert.ok(result.ok);
  assert.equal(result.value.phone, "");
});

test("inquiry: rejects missing, malformed, oversized and unknown values", () => {
  const cases: [Record<string, unknown>, string][] = [
    [{ ...valid, name: "   " }, "name"],
    [{ ...valid, email: "not-an-email" }, "email"],
    [{ ...valid, city: "" }, "city"],
    [{ ...valid, type: "franchise" }, "type"],
    [{ ...valid, stage: 3 }, "stage"],
    [{ ...valid, language: "fr" }, "language"],
    [{ ...valid, message: "x".repeat(2001) }, "message"],
    [{ ...valid, name: { $ne: "" } }, "name"],
  ];
  for (const [body, field] of cases) {
    assert.deepEqual(parseProviderInquiry(body), { ok: false, field }, field);
  }
  assert.deepEqual(parseProviderInquiry(null), { ok: false, field: "name" });
});

test("copy: every inquiry option has a label in both languages", () => {
  for (const locale of ["en", "zh"] as const) {
    const form = consultingCopy[locale].form;
    for (const type of INQUIRY_TYPES) assert.ok(form.types[type], `${locale} type ${type}`);
    for (const stage of INQUIRY_STAGES) assert.ok(form.stages[stage], `${locale} stage ${stage}`);
  }
});

test("copy: FCCH capacity matches the CDSS fact sheet in both languages", () => {
  const en = consultingCopy.en.compare.family.size.join(" ");
  assert.match(en, /up to 6 children, or up to 8/);
  assert.match(en, /up to 12 children, or up to 14/);
  assert.match(en, /requires an assistant/);
  const zh = consultingCopy.zh.compare.family.size.join(" ");
  assert.match(zh, /最多 6 名.*最多可收 8 名/);
  assert.match(zh, /最多 12 名.*最多可收 14 名/);
});

test("copy: no outcome guarantees, unverifiable claims or prices anywhere", () => {
  const everything = allText([consultingCopy, getConsultingFaq("en"), getConsultingFaq("zh")]);
  // Affirmative promises only: the page is allowed to say what it will NOT guarantee.
  const banned = [/100%/, /we guarantee/i, /guaranteed (approval|licen[cs]e)/i, /我們保證/, /保證(通過|核准|獲照)/, /\$\s?\d/, /\d+\+ years/i, /年以上/];
  for (const pattern of banned) {
    assert.doesNotMatch(everything, pattern, String(pattern));
  }
});

test("copy: official sources are CDSS URLs over https", () => {
  for (const source of OFFICIAL_SOURCES) assert.match(source.url, /^https:\/\/www\.cdss\.ca\.gov\//);
});

test("JSON-LD: Service in the page's language, no price, both paths", () => {
  const en = asCrawler(consultingServiceJsonLd("en"));
  const zh = asCrawler(consultingServiceJsonLd("zh"));
  assert.equal(en["@type"], "Service");
  assert.equal(en["@id"], zh["@id"], "same entity in both languages");
  assert.equal(zh.url, `${SITE_URL}/zh/for-providers`);
  assert.equal(zh.inLanguage, "zh-Hant");
  assert.equal(zh.hasOfferCatalog.itemListElement.length, 2);
  assert.doesNotMatch(allText(en), /"price"/);
});

test("FAQ: same questions in both languages", () => {
  assert.equal(getConsultingFaq("en").length, getConsultingFaq("zh").length);
});
