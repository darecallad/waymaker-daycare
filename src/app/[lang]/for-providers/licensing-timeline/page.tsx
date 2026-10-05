import type { Metadata } from "next";
import { TimelinePage } from "@/components/providers/TimelinePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { TIMELINE_ROUTE, hubCopy, timelineCopy } from "@/data/consulting";
import { pageMetadata, resolveLocale, type LangParams } from "@/lib/page-metadata";
import { breadcrumbJsonLd, licensingHowToJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata(TIMELINE_ROUTE, locale, timelineCopy[locale].meta);
}

export default async function LicensingTimelineRoute({ params }: LangParams) {
  const locale = await resolveLocale(params);
  const hub = hubCopy[locale].breadcrumb;
  return (
    <>
      <JsonLd
        data={[
          licensingHowToJsonLd("family", locale),
          licensingHowToJsonLd("center", locale),
          breadcrumbJsonLd(
            [
              { name: hub.home, path: "/" },
              { name: hub.page, path: "/for-providers" },
              { name: timelineCopy[locale].breadcrumb, path: TIMELINE_ROUTE },
            ],
            locale,
          ),
        ]}
      />
      <TimelinePage />
    </>
  );
}
