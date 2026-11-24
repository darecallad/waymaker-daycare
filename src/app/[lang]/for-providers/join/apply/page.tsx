import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationSkeleton, PartnerApplicationForm } from "@/components/partner-program/PartnerApplicationForm";
import { joinCopy } from "@/data/partner-program";
import { resolveLocale, type LangParams } from "@/lib/page-metadata";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return { ...joinCopy[locale].applyMeta, robots: { index: false, follow: true } };
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<ApplicationSkeleton />}>
      <PartnerApplicationForm />
    </Suspense>
  );
}
