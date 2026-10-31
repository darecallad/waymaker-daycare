import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { partners } from "@/data/partners";
import { parseAddress } from "@/lib/site";

const home = readFileSync("src/components/home/HomeContent.tsx", "utf8");
const heroSlugs: string[] = JSON.parse(home.match(/const HERO_SLUGS = (\[[^\]]*\]);/)![1]);
const heroPartners = heroSlugs.map((slug) => partners.find((p) => p.slug === slug));

test("the only H1 is the promise (old description, first sentence); the brand is the eyebrow", () => {
  assert.equal(home.match(/<h1\b/g)?.length, 1);
  assert.match(home, /<h1[^>]*>\s*\{t\.heroTitle\}\s*<\/h1>/);
  assert.ok(home.includes("{t.title} {t.titleSuffix}"));
  // Same words as the old `description`, split in two; no new copy.
  assert.ok(home.includes('heroTitle: "Find a licensed daycare near you in the Bay Area."'));
  assert.ok(home.includes('heroSub: "See real photos, license numbers and tour hours, then book an in-person visit in minutes, in English or Chinese."'));
  assert.ok(home.includes('heroTitle: "在灣區找到您附近的持照幼兒園。"'));
  assert.ok(home.includes('heroSub: "查看真實照片、執照號碼和參觀時間，幾分鐘內就能用中文或英文預約實地參觀。"'));
});

test("one search form on the page, in the hero, going to /partners?search=", () => {
  assert.equal(home.match(/role="search"/g)?.length, 1);
  assert.match(home, /<form\s+role="search"\s+onSubmit=\{handleSearch\}/);
  assert.ok(home.includes('router.push(localize(term ? partnersSearchHref(term) : "/partners"))'));
});

test("hero photos are real partner photos from three different cities, not the stock image", () => {
  assert.ok(!home.includes('"/home-hero.jpg"'));
  assert.equal(heroSlugs.length, 3);
  for (const [i, partner] of heroPartners.entries()) assert.ok(partner?.images[0], heroSlugs[i]);
  const cities = new Set(heroPartners.map((p) => parseAddress(p!.address).addressLocality));
  assert.equal(cities.size, 3);
});

test("mobile hero photo (LCP) is at most 150 KB at every phone width; only it is preloaded", () => {
  const first = heroPartners[0]!.images[0];
  for (const w of [640, 960, 1280]) {
    const size = statSync(`public${first.replace(/\.jpg$/, `-${w}.webp`)}`).size;
    assert.ok(size <= 150_000, `${first} @${w} is ${Math.round(size / 1000)} KB`);
  }
  assert.equal(home.match(/\bpriority\b/g)?.length, 1);
  assert.ok(home.includes("priority={index === 0}"));
});
