import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnerDetailContent } from "@/components/partners/PartnerDetailContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { partners } from "@/data/partners";
import { parseAddress } from "@/lib/site";
import { breadcrumbJsonLd, childCareJsonLd } from "@/lib/structured-data";

interface PartnerDetailPageProps {
  params: Promise<{ slug: string }>;
}

const findPartner = (slug: string) => partners.find((p) => p.slug === slug);

export function generateStaticParams() {
  return partners.map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PartnerDetailPageProps): Promise<Metadata> {
  const partner = findPartner((await params).slug);
  if (!partner) return {};

  const { addressLocality } = parseAddress(partner.address);
  const title = `${partner.name} – Licensed Daycare in ${addressLocality}, CA`;
  const description = `${partner.description} License #${partner.license}. Tour hours: ${partner.tourHours}. Book a tour online.`;
  const path = `/partners/${partner.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: partner.description,
      url: path,
      images: partner.images[0] ? [{ url: partner.images[0], alt: `${partner.name} classroom` }] : undefined,
    },
  };
}

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const partner = findPartner((await params).slug);
  if (!partner) notFound();

  return (
    <>
      <JsonLd
        data={[
          childCareJsonLd(partner),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Our Partners", path: "/partners" },
            { name: partner.name, path: `/partners/${partner.slug}` },
          ]),
        ]}
      />
      <PartnerDetailContent partner={partner} />
    </>
  );
}
