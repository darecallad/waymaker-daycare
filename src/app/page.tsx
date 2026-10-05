import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFaq } from "@/data/faq";
import { partnerCities } from "@/lib/site";
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: { absolute: "Waymaker Daycare | Licensed Daycares in Sunnyvale & the Bay Area" },
  description:
    "Compare licensed daycares in Sunnyvale, Santa Clara and Newark. See photos, license numbers and tour hours, then book an in-person tour online in English or Chinese.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Waymaker Daycare | Licensed Bay Area Daycares",
    description: "See photos, license numbers and tour hours for licensed Bay Area daycares, then book a tour online.",
    url: "/",
  },
};

export default function Home() {
  const cities = partnerCities().map(({ city }) => city);

  return (
    <>
      {/* FAQ JSON-LD stays in English: it is what crawlers render by default. */}
      <JsonLd data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(getFaq("en", cities))]} />
      <HomeContent />
    </>
  );
}
