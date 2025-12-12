import { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";

export const metadata: Metadata = {
  title: "Waymaker Daycare | Premium Childcare & Early Education Partners",
  description: "Discover top-rated, licensed daycare centers near you. Waymaker partners with trusted facilities to provide safe, nurturing environments for your children.",
  alternates: {
    canonical: "https://waymaker-daycare.com",
  },
  openGraph: {
    title: "Waymaker Daycare | Premium Childcare Partners",
    description: "Find the perfect daycare for your child. Verified reviews, licensed facilities, and trusted care.",
    url: "https://waymaker-daycare.com",
    siteName: "Waymaker Daycare",
    images: [
      {
        url: "/home-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Waymaker Daycare Happy Children",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Waymaker Daycare",
    "url": "https://waymaker-daycare.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://waymaker-daycare.com/partners?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Waymaker Daycare",
    "url": "https://waymaker-daycare.com",
    "logo": "https://waymaker-daycare.com/waymaker-logo.svg",
    "description": "A premium service by Waymaker connecting families with top-rated daycare centers.",
    "sameAs": [
      "https://www.facebook.com/waymaker",
      "https://www.instagram.com/waymaker"
    ],
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 37.3382,
        "longitude": -121.8863
      },
      "geoRadius": "50000"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <HomeContent />
    </>
  );
}
