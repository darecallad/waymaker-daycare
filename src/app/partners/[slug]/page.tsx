import { notFound } from "next/navigation";
import { partners } from "@/data/partners";
import { Metadata } from "next";
import { PartnerDetailContent } from "@/components/partners/PartnerDetailContent";

interface PartnerDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return partners.map((partner) => ({
    slug: partner.slug,
  }));
}

export async function generateMetadata({ params }: PartnerDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const partner = partners.find((p) => p.slug === slug);
  if (!partner) return { title: "Partner Not Found" };

  return {
    title: `${partner.name} | Waymaker Daycare`,
    description: partner.description,
    openGraph: {
      title: partner.name,
      description: partner.description,
      images: partner.images?.[0] ? [partner.images[0]] : [],
    },
  };
}

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { slug } = await params;
  const partner = partners.find((p) => p.slug === slug);

  if (!partner) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ChildCare",
    "name": partner.name,
    "image": partner.images,
    "description": partner.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": partner.address, 
      "addressCountry": "US"
    },
    "telephone": partner.phone,
    "email": partner.email,
    "url": partner.website || `https://waymaker-daycare.com/partners/${partner.slug}`,
    "openingHours": partner.tourHours
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PartnerDetailContent partner={partner} />
    </>
  );
}
