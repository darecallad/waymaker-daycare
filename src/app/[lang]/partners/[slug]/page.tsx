import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnerDetailContent } from "@/components/partners/PartnerDetailContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { partners } from "@/data/partners";
import { locales, type Locale } from "@/lib/i18n";
import { pageMetadata, resolveLocale } from "@/lib/page-metadata";
import { cityName, parseAddress } from "@/lib/site";
import { breadcrumbJsonLd, childCareJsonLd } from "@/lib/structured-data";
import type { Partner } from "@/lib/types";

interface PartnerDetailPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

const findPartner = (slug: string) => partners.find((p) => p.slug === slug);

export function generateStaticParams() {
  return locales.flatMap((lang) => partners.map(({ slug }) => ({ lang, slug })));
}

export const dynamicParams = false;

function pageCopy(partner: Partner, locale: Locale) {
  const city = cityName(parseAddress(partner.address).addressLocality, locale);

  if (locale === "zh") {
    const name = partner.name_zh ?? partner.name;
    const description = partner.description_zh ?? partner.description;
    return {
      name,
      title: `${name}（${partner.name}）｜${city}持照幼兒園`,
      description: `${description} 加州執照號碼 ${partner.license}。參觀時間：${partner.tourHours}。可線上預約參觀。`,
      socialDescription: description,
      imageAlt: `${name}的教室`,
      crumbs: ["首頁", "合作幼兒園"],
    };
  }

  return {
    name: partner.name,
    title: `${partner.name} – Licensed Daycare in ${city}, CA`,
    description: `${partner.description} License #${partner.license}. Tour hours: ${partner.tourHours}. Book a tour online.`,
    socialDescription: partner.description,
    imageAlt: `${partner.name} classroom`,
    crumbs: ["Home", "Our Partners"],
  };
}

export async function generateMetadata({ params }: PartnerDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const partner = findPartner(slug);
  if (!partner) return {};

  const locale = await resolveLocale(params);
  const copy = pageCopy(partner, locale);
  const images = partner.images[0] ? [{ url: partner.images[0], alt: copy.imageAlt }] : undefined;

  return pageMetadata(`/partners/${partner.slug}`, locale, copy, { images });
}

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { slug } = await params;
  const partner = findPartner(slug);
  if (!partner) notFound();

  const locale = await resolveLocale(params);
  const copy = pageCopy(partner, locale);
  const [home, list] = copy.crumbs;

  return (
    <>
      <JsonLd
        data={[
          childCareJsonLd(partner, locale),
          breadcrumbJsonLd(
            [
              { name: home, path: "/" },
              { name: list, path: "/partners" },
              { name: copy.name, path: `/partners/${partner.slug}` },
            ],
            locale,
          ),
        ]}
      />
      <PartnerDetailContent partner={partner} />
    </>
  );
}
