import type { Metadata } from "next";
import { JoinLanding } from "@/components/partner-program/JoinLanding";
import { JsonLd } from "@/components/seo/JsonLd";
import { hubCopy } from "@/data/consulting";
import { AUDIENCES, JOIN_ROUTE, getJoinFaq, joinCopy, type Audience } from "@/data/partner-program";
import { pageMetadata, resolveLocale, type LangParams } from "@/lib/page-metadata";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/structured-data";

interface JoinPageProps extends LangParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Canonical is the bare path: `?type=` only switches the audience copy.
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata(JOIN_ROUTE, locale, joinCopy[locale].meta, { absoluteTitle: true });
}

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const locale = await resolveLocale(params);
  const { type } = await searchParams;
  const audience: Audience = AUDIENCES.find((a) => a === type) ?? "family";
  const hub = hubCopy[locale].breadcrumb;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: hub.home, path: "/" },
              { name: hub.page, path: "/for-providers" },
              { name: joinCopy[locale].breadcrumb, path: JOIN_ROUTE },
            ],
            locale,
          ),
          faqJsonLd(getJoinFaq(locale), locale),
        ]}
      />
      <JoinLanding type={audience} />
    </>
  );
}
