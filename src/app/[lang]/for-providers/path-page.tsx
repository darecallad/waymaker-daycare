/**
 * Shared server pieces for the two licence-path routes, so each route file is two lines
 * and the metadata/JSON-LD logic exists once.
 */
import type { Metadata } from "next";
import { ProviderPathPage } from "@/components/providers/ProviderPathPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { PATH_ROUTES, hubCopy, pathCopy, type ProviderPath } from "@/data/consulting";
import { pageMetadata, resolveLocale, type LangParams } from "@/lib/page-metadata";
import { breadcrumbJsonLd, licensingHowToJsonLd, providerServiceJsonLd } from "@/lib/structured-data";

export function pathMetadata(path: ProviderPath) {
  return async ({ params }: LangParams): Promise<Metadata> => {
    const locale = await resolveLocale(params);
    return pageMetadata(PATH_ROUTES[path], locale, pathCopy[locale][path].meta);
  };
}

export function pathPage(path: ProviderPath) {
  return async function PathRoute({ params }: LangParams) {
    const locale = await resolveLocale(params);
    const hub = hubCopy[locale].breadcrumb;
    return (
      <>
        <JsonLd
          data={[
            providerServiceJsonLd(path, locale),
            licensingHowToJsonLd(path, locale),
            breadcrumbJsonLd(
              [
                { name: hub.home, path: "/" },
                { name: hub.page, path: "/for-providers" },
                { name: pathCopy[locale][path].name, path: PATH_ROUTES[path] },
              ],
              locale,
            ),
          ]}
        />
        <ProviderPathPage path={path} />
      </>
    );
  };
}
