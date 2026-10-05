import type { Metadata } from "next";
import { ProvidersContent } from "@/components/providers/ProvidersContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { consultingCopy, getConsultingFaq } from "@/data/consulting";
import { pageMetadata, resolveLocale, type LangParams } from "@/lib/page-metadata";
import { breadcrumbJsonLd, consultingServiceJsonLd, faqJsonLd } from "@/lib/structured-data";

const PATH = "/for-providers";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata(PATH, locale, consultingCopy[locale].meta);
}

export default async function ForProvidersPage({ params }: LangParams) {
  const locale = await resolveLocale(params);
  const t = consultingCopy[locale];

  return (
    <>
      <JsonLd
        data={[
          consultingServiceJsonLd(locale),
          faqJsonLd(getConsultingFaq(locale), locale),
          breadcrumbJsonLd([{ name: t.breadcrumb.home, path: "/" }, { name: t.breadcrumb.page, path: PATH }], locale),
        ]}
      />
      <ProvidersContent />
    </>
  );
}
