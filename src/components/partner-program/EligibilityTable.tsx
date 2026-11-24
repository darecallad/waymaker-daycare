"use client";

import type { ReactNode } from "react";
import { NewTabLink, eyebrowClass, fillNodes, h2Class } from "@/components/partner-program/shared";
import { CCLD_SEARCH_URL, PROGRAM_TERMS, fill, joinCopy, plural } from "@/data/partner-program";
import { useLanguage } from "@/context/LanguageContext";
import { SERVICE_AREAS, cityName } from "@/lib/site";
import { cn } from "@/lib/utils";

function Tag({ kind, children }: { kind: "required" | "helpful"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 align-middle text-[13px] font-bold",
        kind === "required" ? "bg-mint-soft text-ink" : "bg-white text-text-2 ring-1 ring-inset ring-field",
      )}
    >
      {children}
    </span>
  );
}

// Below md the table becomes stacked cards; the header row stays for screen readers.
const rowClass = "border-b border-line last:border-b-0 max-md:grid max-md:gap-1 max-md:px-4 max-md:py-3";
const cellClass = "px-5 py-4 text-left align-top max-md:p-0";

/** Real table: rows are requirements, columns the two audiences. Cells that need an owner answer are omitted. */
export function EligibilityTable() {
  const { locale } = useLanguage();
  const t = joinCopy[locale].elig;
  const value = joinCopy[locale].value;
  const terms = PROGRAM_TERMS;
  const cities = SERVICE_AREAS.map((city) => cityName(city, locale)).join(locale === "zh" ? "、" : ", ");
  const tours = terms.minTourSlotsPerWeek ? plural(value.minTourSlots, terms.minTourSlotsPerWeek) : value.tourSlots;
  const separator = locale === "zh" ? "。" : ". ";

  const rows: { label: string; tag: "required" | "helpful"; cells: [ReactNode] | [ReactNode, ReactNode] }[] = [
    { label: t.license.label, tag: "required", cells: [t.license.family, t.license.center] },
    {
      label: t.location.label,
      tag: "required",
      cells: [`${fill(t.location.text, { cities })}${terms.acceptOtherCities ? `${separator}${t.location.otherCities}` : ""}`],
    },
    { label: t.tours, tag: "required", cells: [tours] },
    { label: t.photos.label, tag: "helpful", cells: [terms.photoPolicy ? `${t.photos.text}${separator}${terms.photoPolicy[locale]}` : t.photos.text] },
  ];
  if (terms.extraRequirements.length > 0) {
    rows.push({
      label: t.other,
      tag: "required",
      cells: [<ul key="other" className="list-disc space-y-1 pl-5">{terms.extraRequirements.map((r) => <li key={r.en}>{r[locale]}</li>)}</ul>],
    });
  }

  return (
    <section id="eligibility" aria-labelledby="join-elig-heading" className="scroll-mt-20 bg-white py-14 md:scroll-mt-[100px] md:py-24">
      <div className="container mx-auto max-w-[960px] px-4 md:px-6">
        <div className="mb-8 text-center">
          <p className={eyebrowClass(locale)}>{t.eyebrow}</p>
          <h2 id="join-elig-heading" className={h2Class}>{t.title}</h2>
        </div>
        <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
          <table aria-labelledby="join-elig-heading" className="w-full border-collapse text-base">
            <thead className="max-md:sr-only">
              <tr className="bg-ink text-[15px] text-white">
                <th scope="col" className="w-[30%] px-5 py-4 text-left">{t.head.requirement}</th>
                <th scope="col" className="px-5 py-4 text-left">{t.head.family}</th>
                <th scope="col" className="px-5 py-4 text-left">{t.head.center}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className={rowClass}>
                  <th scope="row" className={cn(cellClass, "font-semibold text-ink")}>
                    {row.label}
                    <Tag kind={row.tag}>{row.tag === "required" ? t.required : t.helpful}</Tag>
                  </th>
                  {row.cells.length === 2
                    ? row.cells.map((cell, index) => <td key={index} className={cn(cellClass, "text-text")}>{cell}</td>)
                    : <td colSpan={2} className={cn(cellClass, "text-text")}>{row.cells[0]}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-text-2">
          {fillNodes(t.note, {
            link: <NewTabLink href={CCLD_SEARCH_URL} newTab={joinCopy[locale].newTab} className="font-medium">{t.noteLink}</NewTabLink>,
          })}
        </p>
      </div>
    </section>
  );
}
