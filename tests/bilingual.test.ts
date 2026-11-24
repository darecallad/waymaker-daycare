import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { partners } from "@/data/partners";
import { compactTime } from "@/lib/tour-slots";
import { tourRows } from "@/lib/partner-detail";
import { BOOKING_ERROR, bookingErrorMessage } from "@/lib/booking-errors";

test("compactTime: Chinese uses 上午/下午 before the time; English unchanged", () => {
  assert.equal(compactTime("10:00 AM", "zh"), "上午10:00");
  assert.equal(compactTime("6:00 PM", "zh"), "下午6:00");
  assert.equal(compactTime("4:00 PM - 6:00 PM", "zh"), "下午4:00–6:00");
  assert.equal(compactTime("11:00 AM - 1:00 PM", "zh"), "上午11:00–下午1:00");
  assert.equal(compactTime("4:00 PM - 6:00 PM"), "4:00 – 6:00 PM");
  assert.equal(compactTime("10:00 AM", "en"), "10:00 AM");
  assert.equal(compactTime("By appointment", "zh"), "By appointment");
});

test("every partner's tour hours render with no AM/PM in Chinese", () => {
  for (const p of partners) {
    for (const row of tourRows(p.tourHours, "zh")) {
      assert.doesNotMatch(`${row.days}${row.time}`, /[A-Za-z]/, `${p.slug}: ${row.days} ${row.time}`);
      assert.match(row.time, /^[上下]午\d/, p.slug);
    }
  }
});

test("approved NEW zh error copy", () => {
  assert.equal(bookingErrorMessage(BOOKING_ERROR.FULLY_BOOKED, "zh"), "這個時段已額滿。");
  assert.equal(bookingErrorMessage(BOOKING_ERROR.ALREADY_BOOKED, "zh"), "您這一天已有預約，請選擇其他日期。");
  assert.equal(bookingErrorMessage(BOOKING_ERROR.DATE_UNAVAILABLE, "zh"), "這一天已無法參觀，請選擇其他日期。");
  assert.equal(bookingErrorMessage(BOOKING_ERROR.NO_DAYCARE_OR_DATE, "zh"), "請選擇幼兒園及可參觀的日期。");
  assert.equal(bookingErrorMessage(BOOKING_ERROR.RATE_LIMITED, "zh"), "請稍後再試。");
  assert.equal(bookingErrorMessage(BOOKING_ERROR.SERVER, "zh"), "預約未完成，請再試一次或來電 (408) 590-3617。");
});

const sources = readdirSync("src", { recursive: true, encoding: "utf8" })
  .filter((f) => /\.tsx?$/.test(f))
  .map((f) => [f, readFileSync(`src/${f}`, "utf8")] as const);

test("terminology: generic copy says 幼兒園; 托兒所 only in partner names or 家庭式托兒所", () => {
  for (const [file, text] of sources) {
    for (const line of text.split("\n")) {
      if (!line.includes("托兒所") || /name_zh:|description_zh:/.test(line)) continue;
      const stray = line.replace(/家庭式托兒所/g, "");
      assert.ok(!stray.includes("托兒所"), `${file}: ${line.trim().slice(0, 80)}`);
    }
  }
});

test("stale 'tours resume Jan 5' note is gone", () => {
  for (const [file, text] of sources) assert.ok(!/tourStartNote|Jan 5th|1 月 5 日/.test(text), file);
});

test("fonts: Chinese web font in both stacks; no dangling Geist variable", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const doc = readFileSync("src/components/layout/RootDocument.tsx", "utf8");
  assert.ok(!css.includes("--font-geist"));
  assert.match(css, /--font-sans: var\(--font-inter\), var\(--font-cjk\)/);
  assert.match(css, /--font-serif: var\(--font-playfair\), var\(--font-cjk\)/);
  assert.match(doc, /Noto_Sans_TC\(\{[^}]*variable: "--font-cjk"[^}]*preload: false/);
  assert.match(css, /:lang\(zh\) :is\(h1, h2, h3\)/);
});
