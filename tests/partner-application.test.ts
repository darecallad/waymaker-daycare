import { test } from "node:test";
import assert from "node:assert/strict";
import { DRAFT_MAX_AGE_DAYS, PROGRAM_TERMS, type ProgramTerms } from "@/data/partner-program";
import {
  FIELD_STEP, REFERENCE_PATTERN, STEP_FIELDS, emptyForm, firstInvalidStepBefore, invalidFields, licenseLengthWarning,
  makeReference, parseDraft, parsePartnerApplication, serializeDraft, stepOfField, type ApplicationForm,
} from "@/lib/partner-application";
import { applicationEmail, handlePartnerApplication, type Mail } from "@/lib/partner-application-handler";

const valid = {
  programType: "family-small", daycareName: "Little Maple Family Daycare", licenseNumber: "434 400-000", capacity: "8",
  city: "Sunnyvale", cityOther: "", zip: "94086", ages: ["toddler", "infant"], languages: ["mandarin", "english"],
  openings: "now", openingsByAge: { infant: "1", toddler: "2", preschool: "5" }, tourDays: [5, 2], tourTime: "6:00 PM",
  website: "", about: "Play-based.", contactName: "Mei Chen", role: "owner", email: "mei@example.com", phone: "(408) 555-0134",
  replyLanguage: "zh", bestTime: "weekday-evening", heardFrom: "", consentAuthorised: true, consentVerify: true, locale: "zh",
};
const field = (body: unknown) => {
  const result = parsePartnerApplication(body);
  return result.ok ? null : result.field;
};

test("parser: a valid application is cleaned and put in a fixed order", () => {
  const result = parsePartnerApplication(valid);
  assert.ok(result.ok);
  assert.equal(result.value.licenseNumber, "434400000", "spaces and dashes stripped");
  assert.equal(result.value.capacity, 8);
  assert.deepEqual(result.value.ages, ["infant", "toddler"]);
  assert.deepEqual(result.value.languages, ["english", "mandarin"]);
  assert.deepEqual(result.value.openingsByAge, { infant: 1, toddler: 2 }, "openings only for the ages chosen");
  assert.deepEqual(result.value.tourDays, [2, 5], "Monday first");
  assert.equal(result.value.website, undefined);
  assert.equal("cityOther" in result.value, false);
  assert.equal(result.value.locale, "zh");
});

test("parser: every required field, when missing, is the field reported", () => {
  const blanks: Record<string, unknown> = {
    programType: "", daycareName: " ", licenseNumber: "", capacity: "", city: "", ages: [], openings: "", tourDays: [],
    tourTime: "", contactName: "", role: "", email: "", phone: "", replyLanguage: "", consentAuthorised: false, consentVerify: false,
  };
  for (const [name, blank] of Object.entries(blanks)) assert.equal(field({ ...valid, [name]: blank }), name, name);
  assert.equal(field(null), "programType");
});

test("parser: rejects what the form cannot send", () => {
  const cases: [Record<string, unknown>, string][] = [
    [{ programType: "not-licensed" }, "programType"],
    [{ licenseNumber: "43441A" }, "licenseNumber"],
    [{ capacity: "0" }, "capacity"],
    [{ capacity: "1000" }, "capacity"],
    [{ capacity: "8.5" }, "capacity"],
    [{ city: "Oakland" }, "city"],
    [{ city: "other", cityOther: "" }, "cityOther"],
    [{ zip: "9408" }, "zip"],
    [{ ages: ["infant", "infant"] }, "ages"],
    [{ ages: ["teen"] }, "ages"],
    [{ languages: ["klingon"] }, "languages"],
    [{ openingsByAge: { infant: "100" } }, "openingsByAge.infant"],
    [{ tourDays: [7] }, "tourDays"],
    [{ tourDays: ["2"] }, "tourDays"],
    [{ website: "javascript:alert(1)" }, "website"],
    [{ website: `https://${"x".repeat(300)}` }, "website"],
    [{ daycareName: "x".repeat(121) }, "daycareName"],
    [{ tourTime: "x".repeat(61) }, "tourTime"],
    [{ about: "x".repeat(1001) }, "about"],
    [{ email: "not-an-email" }, "email"],
    [{ email: `${"x".repeat(250)}@a.co` }, "email"],
    [{ phone: "555-0134" }, "phone"],
    [{ replyLanguage: "fr" }, "replyLanguage"],
    [{ bestTime: "midnight" }, "bestTime"],
    [{ consentVerify: "true" }, "consentVerify"],
    [{ daycareName: { $ne: "" } }, "daycareName"],
  ];
  for (const [change, name] of cases) assert.equal(field({ ...valid, ...change }), name, JSON.stringify(change));
  assert.equal(field({ ...valid, city: "other", cityOther: "Hayward" }), null, "another city is allowed with its name");
});

test("parser: the first invalid field is on the earliest step, so the form jumps there", () => {
  assert.equal(field({ ...valid, email: "x", daycareName: "" }), "daycareName");
  assert.equal(stepOfField("openingsByAge.infant"), 2);
  assert.equal(stepOfField("email"), 3);
  assert.equal(stepOfField("company"), null);
});

test("license: any length is accepted but a non-9-digit number gets a warning", () => {
  assert.equal(field({ ...valid, licenseNumber: "43441752" }), null);
  assert.equal(licenseLengthWarning("43441"), 5);
  assert.equal(licenseLengthWarning("434-417-520"), null);
  assert.equal(licenseLengthWarning(""), null);
  assert.equal(licenseLengthWarning("abc"), null, "not a number: the error covers it, not the warning");
});

test("steps: every field is asked on exactly one step", () => {
  const all = Object.values(STEP_FIELDS).flat();
  assert.equal(new Set(all).size, all.length);
  assert.deepEqual(Object.keys(FIELD_STEP).sort(), Object.keys(emptyForm("en")).sort());
  const empty = emptyForm("en");
  assert.equal(firstInvalidStepBefore(empty, 1), null);
  assert.equal(firstInvalidStepBefore(empty, 3), 1, "a deep link to step 3 goes back to step 1");
  assert.equal(firstInvalidStepBefore(valid, 4), null);
  assert.deepEqual(invalidFields({ ...valid, ages: ["infant"], openingsByAge: { infant: "x" } }, STEP_FIELDS[2]), ["openingsByAge.infant"]);
});

test("reference: WM-P- and four characters that cannot be misread", () => {
  for (let i = 0; i < 300; i++) {
    const reference = makeReference();
    assert.match(reference, REFERENCE_PATTERN);
    assert.doesNotMatch(reference.slice(5), /[01ILO]/);
  }
  assert.doesNotMatch("WM-P-<b>x", REFERENCE_PATTERN);
});

test("draft: kept without consents, restored, and dropped after 30 days or when unreadable", () => {
  const form: ApplicationForm = { ...emptyForm("zh", "center"), daycareName: "Little Maple", consentAuthorised: true, consentVerify: true };
  const now = new Date("2026-11-21T10:00:00Z");
  const raw = serializeDraft(form, 2, now);
  assert.doesNotMatch(raw, /consent/);
  const draft = parseDraft(raw, now.getTime());
  assert.equal(draft?.step, 2);
  assert.equal(draft?.data.daycareName, "Little Maple");
  assert.equal(draft?.data.programType, "center");
  assert.equal(draft?.data.replyLanguage, "zh");

  const day = 24 * 60 * 60 * 1000;
  assert.ok(parseDraft(raw, now.getTime() + (DRAFT_MAX_AGE_DAYS - 1) * day));
  assert.equal(parseDraft(raw, now.getTime() + DRAFT_MAX_AGE_DAYS * day), null);
  assert.equal(parseDraft("{not json", now.getTime()), null);
  assert.equal(parseDraft(JSON.stringify({ v: 2, savedAt: now.toISOString(), step: 1, data: {} }), now.getTime()), null);

  const tampered = parseDraft(JSON.stringify({
    v: 1, savedAt: now.toISOString(), step: 9,
    data: { programType: "evil", ages: ["infant", "teen"], tourDays: [1, 8], daycareName: 42, openingsByAge: { infant: 3 } },
  }), now.getTime());
  assert.equal(tampered?.step, 1);
  assert.equal(tampered?.data.programType, "");
  assert.deepEqual(tampered?.data.ages, ["infant"]);
  assert.deepEqual(tampered?.data.tourDays, [1]);
  assert.equal(tampered?.data.daycareName, "");
  assert.deepEqual(tampered?.data.openingsByAge, {});
});

function harness(terms: Partial<ProgramTerms> = {}, store?: (reference: string, record: string) => Promise<boolean>) {
  const sent: Mail[] = [];
  const deps = { send: async (mail: Mail) => void sent.push(mail), store, terms: { ...PROGRAM_TERMS, ...terms } };
  return { sent, run: (body: unknown) => handlePartnerApplication(body, deps) };
}

test("handler: a filled honeypot gets a normal 200 and nothing is sent", async () => {
  const { sent, run } = harness();
  const result = await run({ ...valid, company: "Acme" });
  assert.equal(result.status, 200);
  assert.match((result.body as { reference: string }).reference, REFERENCE_PATTERN);
  assert.equal(sent.length, 0);
});

test("handler: invalid input is a 400 naming the field, and nothing is sent", async () => {
  const { sent, run } = harness();
  assert.deepEqual(await run({ ...valid, tourDays: [] }), { status: 400, body: { error: "Invalid field: tourDays", field: "tourDays" } });
  assert.equal(sent.length, 0);
});

test("handler: one email to the inbox, reply-to the applicant, no header injection, escaped body", async () => {
  const { sent, run } = harness();
  const result = await run({ ...valid, daycareName: "Little\r\nBcc: x@evil.test Maple", about: "<script>alert(1)</script>" });
  assert.equal(result.status, 200);
  const reference = (result.body as { reference: string }).reference;
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, PROGRAM_TERMS.inbox);
  assert.equal(sent[0].replyTo, "mei@example.com");
  assert.doesNotMatch(sent[0].subject, /[\r\n]/);
  assert.equal(sent[0].subject, `Partner application: Family daycare (small) - Sunnyvale - Little Bcc: x@evil.test Maple [${reference}]`);
  assert.ok(!sent[0].html.includes("<script>"));
  assert.ok(sent[0].html.includes("&lt;script&gt;"));
  assert.ok(sent[0].html.includes("https://www.ccld.dss.ca.gov/carefacilitysearch/"), "reviewer gets the CDSS lookup");
  assert.ok(sent[0].html.includes("434400000"));
});

test("handler: the applicant copy is only sent when the owner turns it on, in the reply language", async () => {
  const { sent, run } = harness({ sendApplicantConfirmation: true, replyBusinessDays: 3 });
  const result = await run(valid);
  assert.equal(sent.length, 2);
  assert.equal(sent[1].to, "mei@example.com");
  assert.equal(sent[1].subject, `已收到您的 Waymaker 申請（${(result.body as { reference: string }).reference}）`);
  assert.ok(sent[1].html.includes("3 個工作天內"));

  const failing = { send: async (mail: Mail) => { if (mail.to !== PROGRAM_TERMS.inbox) throw new Error("smtp"); } };
  const original = console.error;
  console.error = () => {};
  try {
    const ok = await handlePartnerApplication(valid, { ...failing, terms: { ...PROGRAM_TERMS, sendApplicantConfirmation: true } });
    assert.equal(ok.status, 200, "a failed courtesy copy does not fail the application");
  } finally {
    console.error = original;
  }
});

test("handler: when storing is on, the record is saved under a free reference before the email", async () => {
  const taken = new Set<string>();
  const calls: string[] = [];
  let first = true;
  const store = async (reference: string, record: string) => {
    calls.push(`store ${reference}`);
    assert.equal(JSON.parse(record).status, "received");
    if (first) {
      first = false;
      taken.add(reference);
      return false;
    }
    return !taken.has(reference);
  };
  const { sent, run } = harness({}, store);
  const result = await run(valid);
  const reference = (result.body as { reference: string }).reference;
  assert.equal(calls.length, 2, "retried after a taken reference");
  assert.equal(calls[1], `store ${reference}`);
  assert.ok(sent[0].subject.endsWith(`[${reference}]`));
});

test("email: other cities are named in the subject", () => {
  const parsed = parsePartnerApplication({ ...valid, city: "other", cityOther: "Hayward", programType: "center" });
  assert.ok(parsed.ok);
  assert.match(applicationEmail(parsed.value, "WM-P-7K3Q").subject, /^Partner application: Child care center - Hayward - Little Maple Family Daycare \[WM-P-7K3Q\]$/);
});
