import { test } from "node:test";
import assert from "node:assert/strict";
import sitemap from "@/app/sitemap";
import { GET as llmsTxt } from "@/app/llms.txt/route";
import { getConsultingFaq, hubCopy } from "@/data/consulting";
import { JOIN_ROUTE, PROGRAM_TERMS, entryCopy, fill, getJoinFaq, joinCopy, plural, type ProgramTerms } from "@/data/partner-program";
import { STEP_FIELDS } from "@/lib/partner-application";
import { SITE_URL } from "@/lib/site";

/** Every key path of a copy object, with array lengths, so en and zh can be compared. */
function shape(value: unknown, path = ""): string[] {
  if (Array.isArray(value)) return [`${path}[${value.length}]`, ...value.flatMap((item, i) => shape(item, `${path}[${i}]`))];
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, v]) => shape(v, path ? `${path}.${key}` : key));
  return [path];
}

const filledTerms: ProgramTerms = {
  ...PROGRAM_TERMS,
  model: "network",
  feeSummary: { family: { en: "Fee A", zh: "費用 A" }, center: { en: "Fee B", zh: "費用 B" } },
  contractSummary: { en: "Contract text", zh: "合約說明" },
  leaveSummary: { en: "Leave text", zh: "退出說明" },
  waymakerAnswersFirstContact: true,
  source: "test",
};
const allCopy = (terms = PROGRAM_TERMS) =>
  JSON.stringify([joinCopy, entryCopy, getJoinFaq("en", terms), getJoinFaq("zh", terms)]);

test("copy: Chinese has exactly the keys and list lengths of English", () => {
  assert.deepEqual(shape(joinCopy.zh), shape(joinCopy.en));
  assert.deepEqual(shape(entryCopy.zh), shape(entryCopy.en));
  assert.equal(getJoinFaq("zh", filledTerms).length, getJoinFaq("en", filledTerms).length);
});

test("copy: no placeholders, drafts or invented prices ship", () => {
  for (const terms of [PROGRAM_TERMS, filledTerms]) {
    const text = allCopy(terms);
    for (const banned of [/OWNER/, /\bTODO\b/i, /\bTBD\b/i, /lorem/i, /待確認/]) assert.doesNotMatch(text, banned, String(banned));
    // The consulting prices are another product; the network has no published fee yet.
    assert.doesNotMatch(text, /\$\s?\d/);
  }
});

test("copy: every field the form can flag has an error message in both languages", () => {
  for (const locale of ["en", "zh"] as const) {
    const t = joinCopy[locale].apply;
    for (const field of Object.values(STEP_FIELDS).flat()) {
      const message = field === "programType" ? t.programType.error : (t.fields[field] as { error?: string }).error;
      assert.ok(message, `${locale} ${field}`);
    }
  }
});

test("copy: Chinese says 托兒所 only as 家庭式托兒所 (site glossary)", () => {
  const zh = JSON.stringify([joinCopy.zh, entryCopy.zh, getJoinFaq("zh", filledTerms), hubCopy.zh.journeys, getConsultingFaq("zh")]);
  assert.doesNotMatch(zh.replace(/家庭式托兒所/g, ""), /托兒所/);
});

test("copy: templates fill and pluralise", () => {
  assert.equal(fill("Step {n} of 4 · {name}", { n: 2, name: "Contact" }), "Step 2 of 4 · Contact");
  assert.equal(fill("{unknown}", {}), "{unknown}");
  assert.equal(plural(joinCopy.en.how.days, 1), "1 business day");
  assert.equal(plural(joinCopy.en.how.days, 3), "3 business days");
  assert.equal(plural(joinCopy.zh.how.days, 3), "3 個工作天");
});

test("terms: every owner fact starts unknown, and a filled one needs a source", () => {
  const ownerFacts = Object.entries(PROGRAM_TERMS).filter(
    ([key]) => !["inbox", "sendApplicantConfirmation", "storeApplications", "franchise", "source"].includes(key),
  );
  const filled = ownerFacts.filter(([key, value]) =>
    key === "feeSummary" ? Object.values(value as object).some(Boolean) : Array.isArray(value) ? value.length > 0 : value !== null,
  );
  if (filled.length > 0) assert.ok(PROGRAM_TERMS.source.trim(), `filled without a source: ${filled.map(([k]) => k).join(", ")}`);
  assert.equal(PROGRAM_TERMS.franchise.enabled, false);
  assert.match(PROGRAM_TERMS.inbox, /^[^\s@]+@waymakerbiz\.com$/);
});

test("FAQ: answers that need an owner decision stay out until it is made", () => {
  const questions = (terms: ProgramTerms) => getJoinFaq("en", terms).map((item) => item.question);
  const open = questions({ ...PROGRAM_TERMS, model: null, feeSummary: { family: null, center: null }, contractSummary: null, leaveSummary: null, waymakerAnswersFirstContact: null });
  assert.deepEqual(open, ["I am not licensed yet. Can I apply?", "Can I apply in Chinese?"]);

  const full = getJoinFaq("en", filledTerms);
  assert.equal(full.length, 7);
  assert.equal(full[0].answer, "Family daycares: Fee A. Child care centers: Fee B.");
  assert.ok(full.some((item) => item.answer === "Contract text"));
  assert.ok(full.some((item) => item.answer === "Leave text"));
  assert.equal(getJoinFaq("zh", filledTerms)[0].answer, "家庭式托兒所：費用 A。托兒中心：費用 B。");
  assert.equal(getJoinFaq("en", { ...filledTerms, model: "franchise" }).length, 6, "the not-a-franchise answer needs the network model");
  assert.equal(getJoinFaq("en").find((item) => item.link)?.link?.href, "/for-providers");
});

test("SEO: the join landing page is in the sitemap in both languages; apply and thanks are not", () => {
  const urls = sitemap().map((entry) => entry.url);
  assert.ok(urls.includes(`${SITE_URL}${JOIN_ROUTE}`));
  assert.ok(urls.includes(`${SITE_URL}/zh${JOIN_ROUTE}`));
  assert.ok(!urls.some((url) => /\/join\/(apply|thanks)/.test(url)));
});

test("SEO: llms.txt points licensed daycares to the join page in both languages", async () => {
  const body = await llmsTxt().text();
  assert.ok(body.includes(`${SITE_URL}${JOIN_ROUTE}`));
  assert.ok(body.includes(`${SITE_URL}/zh${JOIN_ROUTE}`));
});

test("entry points: hub card and consulting FAQ lead to the join page", () => {
  assert.equal(hubCopy.en.journeys.grow.title, "I already run a licensed daycare");
  assert.equal(hubCopy.en.journeys.grow.cta, "Join the network");
  for (const locale of ["en", "zh"] as const) {
    const licensed = getConsultingFaq(locale).find((item) => item.link);
    assert.equal(licensed?.link?.href, JOIN_ROUTE, locale);
  }
});
