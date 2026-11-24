/**
 * Server side of POST /api/partner-application, apart from IP and rate limiting. Transport
 * and storage are passed in, so the honeypot, validation and email rules are unit-tested
 * without SMTP or Redis.
 */
import { CCLD_SEARCH_URL } from "@/data/partner-program/options";
import { fill, joinCopy } from "@/data/partner-program/copy";
import { PROGRAM_TERMS, type ProgramTerms } from "@/data/partner-program/terms";
import { escapeHtml } from "@/lib/email";
import { makeReference, parsePartnerApplication, type PartnerApplication } from "@/lib/partner-application";
import { CONTACT } from "@/lib/site";

export interface Mail {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}

export interface ApplicationDeps {
  send: (mail: Mail) => Promise<unknown>;
  /** Saves the record under a new reference; resolves false when the reference is taken. */
  store?: (reference: string, record: string) => Promise<boolean>;
  terms?: ProgramTerms;
}

export type ApplicationResult =
  | { status: 200; body: { success: true; reference: string } }
  | { status: 400; body: { error: string; field: string } };

const accepted = (reference: string): ApplicationResult => ({ status: 200, body: { success: true, reference } });

/** Subjects carry user input; CR/LF there would let it inject mail headers. */
const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ");

/** Rows of the review email and the applicant copy, labelled in the given language. */
function summaryRows(a: PartnerApplication, reference: string, locale: "en" | "zh"): [string, string][] {
  const t = joinCopy[locale].apply;
  const o = t.options;
  const l = t.review.labels;
  const city = a.city === "other" ? `${a.cityOther} (${t.fields.city.other})` : a.city;
  const openings = Object.entries(a.openingsByAge)
    .map(([age, n]) => fill(t.review.ageCount, { n: n as number, age: o.ageNouns[age as keyof typeof o.ageNouns].toLowerCase() }))
    .join(", ");
  return [
    ["Reference", reference],
    [l.programType, t.programType.options[a.programType].review],
    [l.daycareName, a.daycareName],
    [l.licenseNumber, a.licenseNumber],
    [l.capacity, String(a.capacity)],
    [l.city, city],
    [l.zip, a.zip ?? "-"],
    [l.ages, a.ages.map((age) => o.ages[age]).join(", ")],
    [l.languages, a.languages.map((language) => o.languages[language]).join(", ") || "-"],
    [l.openings, [o.openings[a.openings].label, openings].filter(Boolean).join(" · ")],
    [l.tourDays, a.tourDays.map((day) => o.days[day]).join(", ")],
    [l.tourTime, a.tourTime],
    [l.website, a.website ?? "-"],
    [l.contactName, a.contactName],
    [l.role, o.roles[a.role]],
    [l.email, a.email],
    [l.phone, a.phone],
    [l.replyLanguage, o.replyLanguages[a.replyLanguage]],
    [l.bestTime, a.bestTime ? o.bestTimes[a.bestTime] : "-"],
    [l.heardFrom, a.heardFrom ? o.heardFrom[a.heardFrom] : "-"],
  ];
}

const rowsHtml = (rows: [string, string][]) =>
  rows.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join("");

const aboutHtml = (about?: string) =>
  about ? `<div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:20px 0;">${escapeHtml(about).replace(/\n/g, "<br>")}</div>` : "";

/** The email to the Waymaker team, in English whatever language the form was filled in. */
export function applicationEmail(a: PartnerApplication, reference: string): Pick<Mail, "subject" | "html"> {
  const type = joinCopy.en.apply.programType.options[a.programType].review;
  const city = a.city === "other" ? a.cityOther ?? "" : a.city;
  return {
    subject: oneLine(`Partner application: ${type} - ${city} - ${a.daycareName} [${reference}]`),
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0F3B4C;">New partner network application</h2>
        ${rowsHtml([...summaryRows(a, reference, "en"), ["Form language", a.locale]])}
        ${aboutHtml(a.about)}
        <p>Check facility ${escapeHtml(a.licenseNumber)} on the <a href="${CCLD_SEARCH_URL}">CDSS Community Care Facility Search</a>.</p>
      </div>`,
  };
}

/** The applicant's copy, in the language they asked us to reply in. Only sent if the owner enables it. */
export function confirmationEmail(a: PartnerApplication, reference: string, terms: ProgramTerms): Pick<Mail, "subject" | "html"> {
  const locale = a.replyLanguage;
  const t = joinCopy[locale];
  const days = terms.replyBusinessDays;
  const next = [
    t.thanks.received.title,
    days ? `${t.thanks.check.title}: ${fill(t.thanks.check.days, { days: fill(days === 1 ? t.how.days.one : t.how.days.other, { n: days }) })}` : t.thanks.check.title,
    `${t.thanks.profile.title}: ${t.thanks.profile.body}`,
    `${t.thanks.live.title}: ${t.thanks.live.body}`,
  ];
  const phone = (terms.providerContact ?? CONTACT).phone;
  return {
    subject: oneLine(fill(t.email.subject, { ref: reference })),
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <p>${escapeHtml(fill(t.email.greeting, { name: a.contactName }))}</p>
        <p>${escapeHtml(fill(t.email.intro, { ref: reference }))}</p>
        <h3 style="color: #0F3B4C;">${escapeHtml(t.thanks.next)}</h3>
        <ol>${next.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
        <h3 style="color: #0F3B4C;">${escapeHtml(t.email.summary)}</h3>
        ${rowsHtml(summaryRows(a, reference, locale).slice(1))}
        ${aboutHtml(a.about)}
        <p>${escapeHtml(fill(t.email.questions, { phone }))}</p>
      </div>`,
  };
}

/** A filled honeypot gets the same 200 a person gets, and nothing is sent. */
function isSpam(body: unknown): boolean {
  const company = body && typeof body === "object" ? (body as Record<string, unknown>).company : undefined;
  return company !== undefined && company !== null && company !== "";
}

export async function handlePartnerApplication(body: unknown, deps: ApplicationDeps): Promise<ApplicationResult> {
  const terms = deps.terms ?? PROGRAM_TERMS;
  if (isSpam(body)) return accepted(makeReference());

  const parsed = parsePartnerApplication(body);
  if (!parsed.ok) return { status: 400, body: { error: `Invalid field: ${parsed.field}`, field: parsed.field } };
  const application = parsed.value;

  let reference = makeReference();
  if (deps.store) {
    const record = (ref: string) =>
      JSON.stringify({ reference: ref, ...application, status: "received", createdAt: new Date().toISOString() });
    // Stored before sending, so an application is never lost to an SMTP failure.
    for (let attempt = 1; !(await deps.store(reference, record(reference))); attempt++) {
      if (attempt >= 5) throw new Error("Could not find a free application reference");
      reference = makeReference();
    }
  }

  await deps.send({ to: terms.inbox, replyTo: application.email, ...applicationEmail(application, reference) });

  if (terms.sendApplicantConfirmation) {
    // The team already has the application; a failed courtesy copy must not make the applicant resubmit.
    await deps
      .send({ to: application.email, replyTo: (terms.providerContact ?? CONTACT).email, ...confirmationEmail(application, reference, terms) })
      .catch((error) => console.error("Partner application confirmation email failed:", error));
  }

  return accepted(reference);
}
