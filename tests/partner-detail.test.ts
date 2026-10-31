import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { partnerDetailCopy } from "@/components/partners/partner-detail-copy";
import { partners } from "@/data/partners";
import { ccldUrl, telHref, tourDaysSummary, tourRows } from "@/lib/partner-detail";

const keys = (o: object) => Object.keys(o).sort();

test("detail copy has the same keys in English and Chinese", () => {
  assert.deepEqual(keys(partnerDetailCopy.zh), keys(partnerDetailCopy.en));
});

test("Chinese detail copy has no English words (except the Google / Waymaker brand names)", () => {
  for (const [key, v] of Object.entries(partnerDetailCopy.zh)) {
    const s = typeof v === "function" ? (v as (...a: unknown[]) => string)("名", 1, 4) : v;
    assert.doesNotMatch(s.replace(/Google|Waymaker/g, ""), /[A-Za-z]{2,}/, key);
  }
});

test("reviews copy is written for parents, not owners", () => {
  assert.equal(partnerDetailCopy.en.reviewsDesc, "See what other families say on Google.");
  assert.equal(partnerDetailCopy.zh.reviewsDesc, "看看其他家長在 Google 上的評價。");
  const src = readFileSync("src/components/partners/partner-detail-copy.ts", "utf8");
  assert.ok(!src.includes("Encourage parents"));
});

test("tourRows groups consecutive days with the same time, Monday first", () => {
  assert.deepEqual(tourRows("Mon-Fri 6:00 PM", "en"), [{ days: "Mon – Fri", time: "6:00 PM" }]);
  assert.deepEqual(tourRows("Mon, Wed, Thu, Fri 6:00 PM", "en"), [
    { days: "Mon", time: "6:00 PM" },
    { days: "Wed – Fri", time: "6:00 PM" },
  ]);
  assert.deepEqual(tourRows("Fri 4:00 PM - 6:00 PM | Sat 10:00 AM | Sun 10:00 AM", "en"), [
    { days: "Fri", time: "4:00 – 6:00 PM" },
    { days: "Sat, Sun", time: "10:00 AM" },
  ]);
  assert.deepEqual(tourRows("Mon-Fri 9:30 AM - 11:30 AM", "zh"), [{ days: "週一至週五", time: "9:30 – 11:30 AM" }]);
  assert.deepEqual(tourRows("Mon, Tue 6:00 PM", "zh"), [{ days: "週一、週二", time: "6:00 PM" }]);
  assert.deepEqual(tourRows("", "en"), []);
});

test("every partner's tour hours parse into rows, with localized day names", () => {
  for (const p of partners) {
    const en = tourRows(p.tourHours, "en");
    const zh = tourRows(p.tourHours, "zh");
    assert.ok(en.length > 0, p.slug);
    assert.equal(zh.length, en.length, p.slug);
    for (const row of zh) assert.match(row.days, /^週/, `${p.slug} ${row.days}`);
    assert.doesNotMatch(tourDaysSummary(zh), /[A-Za-z]/, p.slug);
  }
});

test("CCLD verify link only for 9-digit licence numbers; every partner has one", () => {
  assert.equal(ccldUrl("434417520"), "https://www.ccld.dss.ca.gov/carefacilitysearch/FacDetail/434417520");
  assert.equal(ccldUrl("123"), null);
  assert.equal(ccldUrl(""), null);
  for (const p of partners) assert.ok(ccldUrl(p.license), p.slug);
});

test("telHref normalises US numbers", () => {
  assert.equal(telHref("(408) 590-3617"), "tel:+14085903617");
  assert.equal(telHref("+1 (650) 319-6911"), "tel:+16503196911");
});

test("detail page: no blurred photos, Call dials Waymaker, icons decorative", () => {
  const files = ["PartnerDetailContent", "PartnerGallery", "PhotoLightbox", "ContactAside"].map((f) =>
    readFileSync(`src/components/partners/${f}.tsx`, "utf8"),
  );
  const all = files.join("\n");
  assert.ok(!all.includes("blur-"), "no blur");
  assert.ok(!all.includes("#73BBD1"), "low-contrast icon colour gone");
  assert.match(files[0], /const callHref = `tel:\$\{CONTACT\.phoneE164\}`/);
  const icons = all.match(/<(ArrowLeft|ArrowUpRight|Clock|MapPin|Phone|ShieldCheck|Star|ImageIcon|ChevronLeft|ChevronRight|X)\b[^>]*>/g) ?? [];
  assert.ok(icons.length > 10);
  for (const icon of icons) assert.match(icon, /aria-hidden="true"/, icon);
});
