import type { Metadata } from "next";
import { ApplicationThanks } from "@/components/partner-program/ApplicationThanks";
import { joinCopy } from "@/data/partner-program";
import { REFERENCE_PATTERN } from "@/lib/partner-application";
import { resolveLocale, type LangParams } from "@/lib/page-metadata";

interface ThanksPageProps extends LangParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return { ...joinCopy[locale].thanksMeta, robots: { index: false, follow: true } };
}

export default async function ThanksPage({ searchParams }: ThanksPageProps) {
  const { ref } = await searchParams;
  // Only a reference we could have issued is shown, so the URL cannot put arbitrary text on the page.
  const reference = typeof ref === "string" && REFERENCE_PATTERN.test(ref) ? ref : null;
  return <ApplicationThanks reference={reference} />;
}
