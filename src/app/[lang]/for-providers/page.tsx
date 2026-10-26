import type { Metadata } from "next";
import { ProvidersHub } from "@/components/providers/ProvidersHub";
import { JsonLd } from "@/components/seo/JsonLd";
import { getConsultingFaq, hubCopy } from "@/data/consulting";
import { pageMetadata, resolveLocale, type LangParams } from "@/lib/page-metadata";
import { breadcrumbJsonLd, faqJsonLd, providerHubJsonLd } from "@/lib/structured-data";

const PATH = "/for-providers";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata(PATH, locale, hubCopy[locale].meta);
}

export default async function ForProvidersPage({ params }: LangParams) {
  const locale = await resolveLocale(params);
  const t = hubCopy[locale];
  return (
    <>
      <JsonLd
        data={[
          providerHubJsonLd(locale),
          faqJsonLd(getConsultingFaq(locale), locale),
          breadcrumbJsonLd([{ name: t.breadcrumb.home, path: "/" }, { name: t.breadcrumb.page, path: PATH }], locale),
        ]}
      />
      <ProvidersHub />
    </>
  );
}
