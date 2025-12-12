import { PartnersPageContent } from "@/components/partners/PartnersPageContent";
import { partners } from "@/data/partners";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Trusted Daycares in San Jose & Bay Area | Waymaker",
  description: "Explore our network of licensed, high-quality daycare centers and preschools in San Jose, Milpitas, Santa Clara, and surrounding areas. Book a tour today.",
  keywords: ["daycare", "preschool", "child care", "San Jose", "Bay Area", "licensed daycare", "Waymaker"],
  alternates: {
    languages: {
      'en-US': '/partners',
      'zh-TW': '/partners?lang=zh',
    },
  },
  openGraph: {
    title: "Find Trusted Daycares in San Jose & Bay Area | Waymaker",
    description: "Explore our network of licensed, high-quality daycare centers and preschools in San Jose, Milpitas, Santa Clara, and surrounding areas.",
    type: "website",
  },
};

export default function PartnersPage() {
  // Create JSON-LD for the list of daycares (ItemList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": partners.map((partner, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "ChildCare",
        "name": partner.name,
        "image": partner.images?.[0] ? `https://waymaker-daycare.com${partner.images[0]}` : undefined,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": partner.address.split(',')[0],
          "addressLocality": partner.address.split(',')[1]?.trim().split(' ')[0] || "San Jose",
          "addressRegion": "CA",
          "postalCode": partner.address.match(/\d{5}/)?.[0],
          "addressCountry": "US"
        },
        "telephone": partner.phone,
        "url": `https://waymaker-daycare.com/partners/${partner.slug}`
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PartnersPageContent />
    </>
  );
}
