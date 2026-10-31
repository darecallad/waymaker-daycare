import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { bookTourCopy, partnerText } from "@/components/booking/book-tour-copy";
import { partners } from "@/data/partners";
import { BOOKING_ERROR, bookingErrorMessage, bookingErrorText } from "@/lib/booking-errors";
import { buildTourMessage, validateTour } from "@/lib/tour-form";
import { compactTime, formatSlotDate } from "@/lib/tour-slots";

const keys = (o: object, prefix = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
const strings = (o: object): string[] => Object.values(o).flatMap((v) => (typeof v === "object" ? strings(v) : [v]));

test("book-tour copy has the same keys in English and Chinese", () => {
  assert.deepEqual(keys(bookTourCopy.zh).sort(), keys(bookTourCopy.en).sort());
});

test("Chinese book-tour copy has no English words", () => {
  // "English" is the language option itself; "#" and digits are fine.
  for (const s of strings(bookTourCopy.zh)) assert.doesNotMatch(s, /[A-Za-z]{2,}/, s);
});

test("the unconfirmed security claim and the old 'Book Your Visit' badge are gone", () => {
  const page = readFileSync("src/app/[lang]/book-tour/page.tsx", "utf8");
  const all = JSON.stringify(bookTourCopy);
  for (const text of ["secure and encrypted", "Book Your Visit", "Tours resume from Jan 5th", "pattern-bg"]) {
    assert.ok(!page.includes(text) && !all.includes(text), text);
  }
});

test("every booking error code has an English and a Chinese message", () => {
  for (const code of Object.values(BOOKING_ERROR)) {
    assert.ok(bookingErrorMessage(code, "en").length > 0);
    assert.doesNotMatch(bookingErrorMessage(code, "zh"), /[A-Za-z]{2,}/, code);
    assert.equal(bookingErrorText(code), bookingErrorMessage(code, "en"));
  }
});

test("unknown or missing error codes fall back to the generic message (never raw server text)", () => {
  assert.equal(bookingErrorMessage(undefined, "zh"), "發生錯誤，請再試一次。");
  assert.equal(bookingErrorMessage("NOPE", "en"), "Something went wrong. Please try again.");
  assert.equal(bookingErrorMessage("toString", "en"), bookingErrorMessage(undefined, "en"));
});

test("the 409 'date closed' server text is unchanged for existing clients", () => {
  assert.equal(
    bookingErrorText(BOOKING_ERROR.DATE_UNAVAILABLE),
    "This date is no longer available for tours. Please pick another date.",
  );
});

test("every JSON error from /api/contact carries a code (except the IP check, before any form use)", () => {
  const route = readFileSync("src/app/api/contact/route.ts", "utf8");
  const bare = route.match(/NextResponse\.json\(\s*\{\s*error:[^}]*\}/g)?.filter((m) => !m.includes("code")) ?? [];
  assert.deepEqual(bare, ['NextResponse.json({ error: "Unable to determine client IP address." }']);
});

const m = bookTourCopy.en.errors;
const ok = { daycare: "do-do-kids-daycare", date: "2026-11-06", name: "Ann", phone: "4085551234", email: "a@b.co", childAge: "3" };

test("validateTour: a complete form has no errors; Notes is not required", () => {
  assert.deepEqual(validateTour(ok, m), {});
});

test("validateTour: errors come back in visual order, starting with daycare and date", () => {
  const errors = validateTour({ daycare: "", date: "", name: " ", phone: "", email: "", childAge: "" }, m);
  assert.deepEqual(Object.keys(errors), ["daycare", "date", "name", "phone", "email", "childAge"]);
  assert.equal(errors.daycare, m.daycare);
  assert.equal(errors.email, m.required);
});

test("validateTour: malformed email gets its own message", () => {
  for (const email of ["jane@", "jane@x", "a b@c.de"]) assert.equal(validateTour({ ...ok, email }, m).email, m.email);
});

test("buildTourMessage keeps the existing email body and never sends an empty Notes line", () => {
  const msg = buildTourMessage({ childAge: "3", daycareName: "Do Do Kids Daycare", date: "2026-11-06", time: "10:00 AM", language: "zh", notes: "  " });
  for (const line of ["Daycare Tour Request", "Child's Age: 3", "Preferred Daycare: Do Do Kids Daycare", "Preferred Date: 2026-11-06", "Time: 10:00 AM", "Preferred Language: zh", "Notes: -"]) {
    assert.ok(msg.includes(line), line);
  }
});

test("formatSlotDate splits weekday and date in both languages", () => {
  assert.deepEqual(formatSlotDate("2026-11-03", "en"), { weekday: "Tue", date: "Nov 3" });
  assert.deepEqual(formatSlotDate("2026-11-03", "zh"), { weekday: "週二", date: "11月3日" });
});

test("compactTime shortens same-meridiem ranges and leaves everything else alone", () => {
  assert.equal(compactTime("4:00 PM - 6:00 PM"), "4:00 – 6:00 PM");
  assert.equal(compactTime("11:00 AM - 1:00 PM"), "11:00 AM – 1:00 PM");
  assert.equal(compactTime("10:00 AM"), "10:00 AM");
  assert.equal(compactTime("By appointment"), "By appointment");
});

test("partnerText: daycare options are 'name · city' in the page language for every partner", () => {
  for (const p of partners) {
    const zh = partnerText(p, "zh");
    const en = partnerText(p, "en");
    assert.equal(zh.name, p.name_zh ?? p.name);
    assert.doesNotMatch(`${zh.name}${zh.city}`, /[A-Za-z]{3,}/, p.slug);
    assert.ok(en.city.length > 0 && !en.shortName.endsWith("Daycare"), p.slug);
  }
});
