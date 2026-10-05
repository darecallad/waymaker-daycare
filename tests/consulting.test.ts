import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INQUIRY_STAGES, INQUIRY_TYPES, OFFICIAL_SOURCES, PATHS, PATH_ROUTES, PRICING, TRACK_RECORD,
  getConsultingFaq, hubCopy, pathCopy, priceLine, timelineCopy,
} from "@/data/consulting";
import { partners } from "@/data/partners";
import { parseProviderInquiry } from "@/lib/provider-inquiry";
import { SITE_URL } from "@/lib/site";
import { licensingHowToJsonLd, providerHubJsonLd, providerServiceJsonLd } from "@/lib/structured-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-only dynamic access
type Ld = any;
const asCrawler = (data: unknown): Ld => JSON.parse(JSON.stringify(data));
const allCopy = JSON.stringify([hubCopy, pathCopy, timelineCopy, getConsultingFaq("en"), getConsultingFaq("zh")]);

const valid = {
  name: "Mei Chen", email: "mei@example.com", phone: "408-555-0100", city: "Sunnyvale",
  type: "family", stage: "exploring", language: "zh", message: "Hi",
};

test("inquiry: a valid submission is cleaned and accepted", () => {
  const result = parseProviderInquiry({ ...valid, name: "  Mei Chen  " });
  assert.ok(result.ok);
  assert.equal(result.value.name, "Mei Chen");
});

test("inquiry: phone and message are optional", () => {
  const result = parseProviderInquiry({ ...valid, phone: undefined, message: undefined });
  assert.ok(result.ok);
  assert.equal(result.value.phone, "");
});

test("inquiry: rejects missing, malformed, oversized and unknown values", () => {
  const cases: [Record<string, unknown>, string][] = [
    [{ ...valid, name: "   " }, "name"],
    [{ ...valid, email: "not-an-email" }, "email"],
    [{ ...valid, city: "" }, "city"],
    [{ ...valid, type: "family-small" }, "type"],
    [{ ...valid, stage: 3 }, "stage"],
    [{ ...valid, language: "fr" }, "language"],
    [{ ...valid, message: "x".repeat(2001) }, "message"],
    [{ ...valid, name: { $ne: "" } }, "name"],
  ];
  for (const [body, field] of cases) assert.deepEqual(parseProviderInquiry(body), { ok: false, field }, field);
  assert.deepEqual(parseProviderInquiry(null), { ok: false, field: "name" });
});

test("copy: every inquiry option has a label in both languages", () => {
  for (const locale of ["en", "zh"] as const) {
    const form = hubCopy[locale].form;
    for (const type of INQUIRY_TYPES) assert.ok(form.types[type], `${locale} type ${type}`);
    for (const stage of INQUIRY_STAGES) assert.ok(form.stages[stage], `${locale} stage ${stage}`);
  }
});

test("capacity: owner's split as headline, official CDSS conditions underneath", () => {
  assert.equal(pathCopy.en.family.capacityHeadline, "About 6–12 children");
  assert.equal(pathCopy.en.center.capacityHeadline, "12+ children");
  const en = pathCopy.en.family.capacityDetail.join(" ");
  assert.match(en, /up to 6 children, or up to 8/);
  assert.match(en, /up to 12 children, or up to 14/);
  assert.match(en, /Requires an assistant/);
  const zh = pathCopy.zh.family.capacityDetail.join(" ");
  assert.match(zh, /最多 6 名.*最多 8 名/);
  assert.match(zh, /最多 12 名.*最多 14 名/);
});

test("pricing: one source of truth, rendered the same everywhere", () => {
  assert.deepEqual(PRICING, { family: { monthly: 900 }, center: { monthly: 2100 } });
  assert.equal(priceLine("family", "en"), "$900 / month");
  assert.equal(priceLine("center", "zh"), "每月 $2,100");
  // Every price that appears in copy must be one of ours: no stale or invented numbers.
  const prices = new Set(allCopy.match(/\$[\d,]+/g));
  assert.deepEqual([...prices].sort(), ["$2,100", "$900"]);
});

test("track record: claim matches the partners actually listed (20+ incl. site)", () => {
  assert.ok(TRACK_RECORD.daycaresWorkedWith >= partners.length, "claim cannot be below what the site shows");
  assert.match(hubCopy.en.network.title, /20\+ daycares/);
  assert.match(hubCopy.zh.network.title, /超過 20 家/);
});

test("copy: no outcome guarantees or unverifiable claims", () => {
  // Affirmative promises only: the page may say what it will NOT guarantee.
  const banned = [/100%/, /we guarantee/i, /guaranteed (approval|licen[cs]e)/i, /我們保證/, /保證(通過|核准|獲照)/, /\d+\+ years/i, /年以上/];
  for (const pattern of banned) assert.doesNotMatch(allCopy, pattern, String(pattern));
});

test("timeline: same steps in both languages, every step cites a CDSS source, estimates labelled", () => {
  for (const path of PATHS) {
    const en = timelineCopy.en.paths[path].steps;
    const zh = timelineCopy.zh.paths[path].steps;
    assert.equal(en.length, zh.length, path);
    en.forEach((step, i) => assert.equal(step.source, zh[i].source, `${path} step ${i}`));
    for (const step of en) assert.ok(OFFICIAL_SOURCES[step.source].url.startsWith("https://www.cdss.ca.gov/"));
  }
  assert.match(timelineCopy.en.disclaimer, /estimates, not official processing times/);
  assert.match(timelineCopy.zh.disclaimer, /估算，不是官方處理時間/);
});

test("JSON-LD: path Service carries the same monthly price as the page", () => {
  for (const path of PATHS) {
    const zh = asCrawler(providerServiceJsonLd(path, "zh"));
    assert.equal(zh.offers.priceSpecification.price, PRICING[path].monthly);
    assert.equal(zh.offers.priceSpecification.unitCode, "MON");
    assert.equal(zh.url, `${SITE_URL}/zh${PATH_ROUTES[path]}`);
    assert.equal(zh["@id"], asCrawler(providerServiceJsonLd(path, "en"))["@id"], "same entity in both languages");
  }
  assert.equal(asCrawler(providerHubJsonLd("en")).itemListElement.length, 2);
});

test("JSON-LD: HowTo steps link to official sources and admit they are estimates", () => {
  const howTo = asCrawler(licensingHowToJsonLd("family", "en"));
  assert.equal(howTo["@type"], "HowTo");
  assert.equal(howTo.step.length, timelineCopy.en.paths.family.steps.length);
  assert.ok(howTo.step.every((s: Ld) => s.url.startsWith("https://www.cdss.ca.gov/")));
  assert.match(howTo.description, /not official processing times/);
});

test("FAQ: answers the cost / time / capacity questions in both languages", () => {
  const en = getConsultingFaq("en").map((f) => f.question).join(" ");
  assert.match(en, /cost/); assert.match(en, /How long/); assert.match(en, /How many children/);
  const zh = getConsultingFaq("zh").map((f) => f.question).join(" ");
  assert.match(zh, /多少錢/); assert.match(zh, /多久/); assert.match(zh, /幾個孩子/);
  assert.equal(getConsultingFaq("en").length, getConsultingFaq("zh").length);
});
