"use client";

import { Fragment, type MouseEvent, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import Link from "@/components/ui/link";
import { ChoiceTiles, Chips, ConsentCheckbox, RadioPills, SelectField, TextAreaField, TextField, fieldId } from "@/components/partner-program/fields";
import { NewTabLink, buttonClass } from "@/components/partner-program/shared";
import {
  AGE_GROUPS, BEST_TIMES, CCLD_SEARCH_URL, HEARD_FROM, LIMITS, OPENINGS, PROGRAM_TERMS, PROGRAM_TYPES, ROLES, SPOKEN, TOUR_DAYS,
  fill, joinCopy, type AgeGroup,
} from "@/data/partner-program";
import { locales, type Locale } from "@/lib/i18n";
import { STEP_FIELDS, licenseDigits, type ApplicationForm, type FieldName, type FormField, type Step } from "@/lib/partner-application";
import { SERVICE_AREAS, cityName } from "@/lib/site";

export interface StepProps {
  form: ApplicationForm;
  locale: Locale;
  update: <K extends FormField>(field: K, value: ApplicationForm[K]) => void;
  blur: (field: FieldName) => void;
  error: (field: FieldName) => string | null;
}

const listSeparator = (locale: Locale) => (locale === "zh" ? "、" : ", ");
const inOrder = <T,>(values: T[], order: readonly T[]) => order.filter((value) => values.includes(value));

function copyFor(locale: Locale) {
  const t = joinCopy[locale].apply;
  return { t, f: t.fields, o: t.options, marks: { required: t.required, optional: t.optional } };
}

export function DaycareStep({ form, locale, update, blur, error, licenseWarning }: StepProps & { licenseWarning: number | null }) {
  const { t, f, o, marks } = copyFor(locale);
  return (
    <>
      <ChoiceTiles
        name="programType"
        legend={t.programType.legend}
        required
        marks={marks}
        value={form.programType}
        onValue={(value) => update("programType", value)}
        error={error("programType")}
        options={PROGRAM_TYPES.map((type) => ({ value: type, label: t.programType.options[type].label, hint: t.programType.options[type].hint }))}
      />
      <div aria-live="polite">
        {form.programType === "not-licensed" && (
          <div className="rounded-2xl bg-sun-tint px-5 py-4">
            <p className="text-text">{t.programType.notLicensed}</p>
            <Link href="/for-providers#consultation" className={`${buttonClass.primary} mt-3`}>{t.programType.notLicensedCta}</Link>
          </div>
        )}
      </div>
      <TextField
        name="daycareName"
        label={f.daycareName.label}
        required
        marks={marks}
        autoComplete="organization"
        maxLength={LIMITS.name}
        value={form.daycareName}
        onValue={(value) => update("daycareName", value)}
        onBlur={() => blur("daycareName")}
        error={error("daycareName")}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          name="licenseNumber"
          label={f.licenseNumber.label}
          required
          marks={marks}
          inputMode="numeric"
          autoComplete="off"
          maxLength={2 * LIMITS.license}
          value={form.licenseNumber}
          onValue={(value) => update("licenseNumber", value)}
          onBlur={() => blur("licenseNumber")}
          error={error("licenseNumber")}
          warning={licenseWarning === null ? null : fill(f.licenseNumber.warning, { n: licenseWarning })}
          hint={
            <>
              {f.licenseNumber.hint}{" "}
              <NewTabLink href={CCLD_SEARCH_URL} newTab={joinCopy[locale].newTab} className="font-medium">{f.licenseNumber.lookUp}</NewTabLink>
            </>
          }
        />
        <TextField
          name="capacity"
          label={f.capacity.label}
          required
          marks={marks}
          inputMode="numeric"
          maxLength={3}
          value={form.capacity}
          onValue={(value) => update("capacity", value)}
          onBlur={() => blur("capacity")}
          error={error("capacity")}
          hint={f.capacity.hint}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SelectField
          name="city"
          label={f.city.label}
          required
          marks={marks}
          placeholder={f.city.placeholder}
          value={form.city}
          onValue={(value) => update("city", value)}
          error={error("city")}
          options={[...SERVICE_AREAS.map((city) => ({ value: city, label: cityName(city, locale) })), { value: "other", label: f.city.other }]}
        />
        <TextField
          name="zip"
          label={f.zip.label}
          marks={marks}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          placeholder={f.zip.placeholder}
          value={form.zip}
          onValue={(value) => update("zip", value)}
          onBlur={() => blur("zip")}
          error={error("zip")}
        />
      </div>
      {form.city === "other" && (
        <TextField
          name="cityOther"
          label={f.cityOther.label}
          required
          marks={marks}
          autoComplete="address-level2"
          maxLength={LIMITS.city}
          value={form.cityOther}
          onValue={(value) => update("cityOther", value)}
          onBlur={() => blur("cityOther")}
          error={error("cityOther")}
          hint={f.cityOther.hint}
        />
      )}
      <Chips
        name="ages"
        legend={f.ages.legend}
        required
        marks={marks}
        values={form.ages}
        onValues={(values) => update("ages", inOrder(values, AGE_GROUPS))}
        error={error("ages")}
        options={AGE_GROUPS.map((age) => ({ value: age, label: o.ages[age] }))}
      />
      <Chips
        name="languages"
        legend={f.languages.legend}
        marks={marks}
        values={form.languages}
        onValues={(values) => update("languages", inOrder(values, SPOKEN))}
        error={error("languages")}
        options={SPOKEN.map((language) => ({ value: language, label: o.languages[language] }))}
      />
    </>
  );
}

export function OpeningsStep({ form, locale, update, blur, error }: StepProps) {
  const { f, o, marks } = copyFor(locale);
  const ages = inOrder(form.ages, AGE_GROUPS) as AgeGroup[];
  return (
    <>
      <ChoiceTiles
        name="openings"
        legend={f.openings.legend}
        required
        marks={marks}
        value={form.openings}
        onValue={(value) => update("openings", value)}
        error={error("openings")}
        options={OPENINGS.map((value) => ({ value, label: o.openings[value].label, hint: o.openings[value].hint }))}
      />
      {ages.length > 0 && (
        <div>
          <div className="grid gap-6 md:grid-cols-2">
            {ages.map((age) => (
              <TextField
                key={age}
                name={`openingsByAge.${age}`}
                label={fill(f.openingsByAge.label, { age: o.ageNouns[age] })}
                marks={marks}
                inputMode="numeric"
                maxLength={2}
                value={form.openingsByAge[age] ?? ""}
                onValue={(value) => update("openingsByAge", { ...form.openingsByAge, [age]: value })}
                onBlur={() => blur(`openingsByAge.${age}`)}
                error={error(`openingsByAge.${age}`)}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-text-2">{f.openingsByAge.hint}</p>
        </div>
      )}
      <Chips
        name="tourDays"
        legend={f.tourDays.legend}
        required
        marks={marks}
        values={form.tourDays}
        onValues={(values) => update("tourDays", inOrder(values, TOUR_DAYS))}
        error={error("tourDays")}
        options={TOUR_DAYS.map((day) => ({ value: day, label: o.days[day] }))}
      />
      <TextField
        name="tourTime"
        label={f.tourTime.label}
        required
        marks={marks}
        maxLength={LIMITS.tourTime}
        value={form.tourTime}
        onValue={(value) => update("tourTime", value)}
        onBlur={() => blur("tourTime")}
        error={error("tourTime")}
        hint={f.tourTime.hint}
      />
      <TextField
        name="website"
        label={f.website.label}
        marks={marks}
        type="url"
        inputMode="url"
        autoComplete="url"
        maxLength={LIMITS.website}
        placeholder={f.website.placeholder}
        value={form.website}
        onValue={(value) => update("website", value)}
        onBlur={() => blur("website")}
        error={error("website")}
      />
      <TextAreaField
        name="about"
        label={f.about.label}
        marks={marks}
        maxLength={LIMITS.about}
        count={fill(f.about.count, { n: form.about.length, max: LIMITS.about })}
        value={form.about}
        onValue={(value) => update("about", value)}
        onBlur={() => blur("about")}
        error={error("about")}
      />
    </>
  );
}

export function ContactStep({ form, locale, update, blur, error }: StepProps) {
  const { f, o, marks } = copyFor(locale);
  return (
    <>
      <TextField
        name="contactName"
        label={f.contactName.label}
        required
        marks={marks}
        autoComplete="name"
        maxLength={LIMITS.contact}
        value={form.contactName}
        onValue={(value) => update("contactName", value)}
        onBlur={() => blur("contactName")}
        error={error("contactName")}
      />
      <RadioPills
        name="role"
        legend={f.role.legend}
        required
        marks={marks}
        value={form.role}
        onValue={(value) => update("role", value)}
        error={error("role")}
        options={ROLES.map((role) => ({ value: role, label: o.roles[role] }))}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          name="email"
          label={f.email.label}
          required
          marks={marks}
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={LIMITS.email}
          value={form.email}
          onValue={(value) => update("email", value)}
          onBlur={() => blur("email")}
          error={error("email")}
        />
        <TextField
          name="phone"
          label={f.phone.label}
          required
          marks={marks}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={LIMITS.phone}
          value={form.phone}
          onValue={(value) => update("phone", value)}
          onBlur={() => blur("phone")}
          error={error("phone")}
        />
      </div>
      <RadioPills
        name="replyLanguage"
        legend={f.replyLanguage.legend}
        required
        marks={marks}
        value={form.replyLanguage}
        onValue={(value) => update("replyLanguage", value)}
        error={error("replyLanguage")}
        options={locales.map((value) => ({ value, label: o.replyLanguages[value], lang: value === "zh" ? "zh-Hant" : "en" }))}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <SelectField
          name="bestTime"
          label={f.bestTime.label}
          marks={marks}
          placeholder={f.bestTime.none}
          value={form.bestTime}
          onValue={(value) => update("bestTime", value)}
          error={error("bestTime")}
          options={BEST_TIMES.map((value) => ({ value, label: o.bestTimes[value] }))}
        />
        <SelectField
          name="heardFrom"
          label={f.heardFrom.label}
          marks={marks}
          placeholder={f.heardFrom.none}
          value={form.heardFrom}
          onValue={(value) => update("heardFrom", value)}
          error={error("heardFrom")}
          options={HEARD_FROM.map((value) => ({ value, label: o.heardFrom[value] }))}
        />
      </div>
    </>
  );
}

function ReviewSection({ step, title, rows, editLabel, href, onEdit }: {
  step: Step;
  title: string;
  rows: [string, ReactNode][];
  editLabel: string;
  href: string;
  onEdit: () => void;
}) {
  const headingId = `pa-review-${step}`;
  return (
    <section aria-labelledby={headingId} className="rounded-2xl border border-line px-5 py-5 md:px-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 id={headingId} className="font-serif text-[19px] font-bold text-ink">{title}</h3>
        <a
          href={href}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            onEdit();
          }}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-semibold text-link hover:underline"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
          {editLabel}
          <span className="sr-only"> {title}</span>
        </a>
      </div>
      <dl className="grid gap-x-4 md:grid-cols-[180px_1fr] md:gap-y-2">
        {rows.map(([term, value]) => (
          <Fragment key={term}>
            <dt className="text-text-2">{term}</dt>
            <dd className="mb-2.5 break-words font-medium text-text md:mb-0">{value}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}

export function ReviewStep({ form, locale, update, error, stepHref, onEdit }: Omit<StepProps, "blur"> & {
  stepHref: (step: Step) => string;
  onEdit: (step: Step, focusId: string) => void;
}) {
  const { t, f, o, marks } = copyFor(locale);
  const l = t.review.labels;
  const sep = listSeparator(locale);
  const optionalRow = (label: string, value: string): [string, ReactNode][] => (value.trim() ? [[label, value.trim()]] : []);
  const city = form.city === "other" ? form.cityOther.trim() : cityName(form.city, locale);
  const openings = inOrder(form.ages, AGE_GROUPS)
    .filter((age) => form.openingsByAge[age as AgeGroup]?.trim())
    .map((age) => fill(t.review.ageCount, { n: Number(form.openingsByAge[age as AgeGroup]), age: o.ageNouns[age as AgeGroup].toLowerCase() }))
    .join(sep);
  const openingsLabel = form.openings in o.openings ? o.openings[form.openings as keyof typeof o.openings].label : "";
  const pick = <K extends string>(labels: Record<K, string>, value: string) => labels[value as K] ?? value;

  const sections: { step: Step; rows: [string, ReactNode][] }[] = [
    {
      step: 1,
      rows: [
        [l.programType, pick(Object.fromEntries(PROGRAM_TYPES.map((p) => [p, t.programType.options[p].review])), form.programType)],
        [l.daycareName, form.daycareName.trim()],
        [l.licenseNumber, licenseDigits(form.licenseNumber)],
        [l.capacity, fill(t.review.children, { n: Number(form.capacity) })],
        [l.city, city],
        ...optionalRow(l.zip, form.zip),
        [l.ages, inOrder(form.ages, AGE_GROUPS).map((age) => o.ages[age as AgeGroup]).join(sep)],
        ...optionalRow(l.languages, inOrder(form.languages, SPOKEN).map((x) => pick(o.languages, x)).join(sep)),
      ],
    },
    {
      step: 2,
      rows: [
        [l.openings, [openingsLabel, openings].filter(Boolean).join(" · ")],
        [l.tourDays, inOrder(form.tourDays, TOUR_DAYS).map((day) => o.days[day]).join(sep)],
        [l.tourTime, form.tourTime.trim()],
        ...optionalRow(l.website, form.website),
        ...optionalRow(l.about, form.about),
      ],
    },
    {
      step: 3,
      rows: [
        [l.contactName, `${form.contactName.trim()} (${pick(o.roles, form.role)})`],
        [l.email, form.email.trim()],
        [l.phone, form.phone.trim()],
        [l.replyLanguage, <span key="lang" lang={form.replyLanguage === "zh" ? "zh-Hant" : "en"}>{pick(o.replyLanguages, form.replyLanguage)}</span>],
        ...optionalRow(l.bestTime, form.bestTime && pick(o.bestTimes, form.bestTime)),
        ...optionalRow(l.heardFrom, form.heardFrom && pick(o.heardFrom, form.heardFrom)),
      ],
    },
  ];
  const privacyUrl = PROGRAM_TERMS.privacyUrl;

  return (
    <>
      <div className="grid gap-4">
        {sections.map(({ step, rows }) => (
          <ReviewSection
            key={step}
            step={step}
            title={t.steps[step - 1]}
            rows={rows}
            editLabel={t.review.edit}
            href={stepHref(step)}
            onEdit={() => onEdit(step, fieldId(STEP_FIELDS[step][0]))}
          />
        ))}
      </div>
      <div className="grid gap-3">
        <ConsentCheckbox
          name="consentAuthorised"
          label={f.consentAuthorised.label}
          marks={marks}
          checked={form.consentAuthorised}
          onChecked={(checked) => update("consentAuthorised", checked)}
          error={error("consentAuthorised")}
        />
        <ConsentCheckbox
          name="consentVerify"
          label={f.consentVerify.label}
          marks={marks}
          checked={form.consentVerify}
          onChecked={(checked) => update("consentVerify", checked)}
          error={error("consentVerify")}
        />
        <p className="text-sm text-text-2">
          {t.privacy}
          {privacyUrl && (
            <>
              {" "}
              <a href={privacyUrl} className="font-semibold text-link underline underline-offset-4">{t.privacyLink}</a>
            </>
          )}
        </p>
      </div>
    </>
  );
}
