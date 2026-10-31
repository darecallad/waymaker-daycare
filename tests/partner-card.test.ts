import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const card = readFileSync("src/components/partners/PartnerCard.tsx", "utf8");
const page = readFileSync("src/components/partners/PartnersPageContent.tsx", "utf8");

test("card root is an <article> with a stretched title link, not one big <Link>", () => {
  assert.match(card, /return \(\s*<article/);
  assert.match(card, /after:absolute after:inset-0/);
  assert.match(card, /href=\{`\/book-tour\?partner=\$\{partner\.slug\}`\}[\s\S]{0,80}relative z-10/);
  // "View details" is a visual cue only, so it must not be a second link/button.
  assert.match(card, /<span aria-hidden="true"[^>]*>\s*\{t\.viewDetails\}/);
});

test("card shows licence and localized tour days; logo and raw English hours are gone", () => {
  assert.ok(card.includes("{t.licenseNum} {partner.license}"));
  assert.ok(card.includes("tourDaysSummary(tourRows(partner.tourHours, locale))"));
  assert.ok(!card.includes("partner.logo"), "logo removed (owner decision)");
  assert.ok(!card.includes("{partner.tourHours"), "raw tourHours string not rendered");
  assert.ok(!card.includes("bg-black/55"), "dark overlay removed");
});

test("card copy keys match in both languages", () => {
  const block = card.slice(card.indexOf("const copy"), card.indexOf("};", card.indexOf("const copy")));
  const keys = (lang: string) => [...block.match(new RegExp(`${lang}: \\{([^}]*)\\}`))![1].replace(/"[^"]*"/g, '""').matchAll(/(?:^|,)\s*(\w+):\s*"/g)].map((m) => m[1]).sort();
  assert.deepEqual(keys("zh"), keys("en"));
});

test("directory: subtitle and eyebrow hidden on mobile, chips one scrolling row, toolbar sticky under the 80px header", () => {
  assert.match(page, /hidden[^"]*md:block[^"]*">\{t\.eyebrow\}/);
  assert.match(page, /hidden[^"]*md:block">\{t\.subtitle\}/);
  assert.match(page, /flex-nowrap gap-2 overflow-x-auto/);
  assert.match(page, /sticky top-\[80px\][^"]*md:static/);
  assert.ok(page.includes("aria-pressed={pressed}"));
});

test("empty state offers the Waymaker phone in both languages", () => {
  assert.ok(page.includes('orContact: "Or contact us:"') && page.includes('orContact: "或直接聯絡我們："'));
  assert.ok(page.includes("tel:${CONTACT.phoneE164}"));
});
