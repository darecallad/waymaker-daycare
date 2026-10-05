import type { Metadata } from "next";
import { PartnersPageContent } from "@/components/partners/PartnersPageContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { partners } from "@/data/partners";
import { breadcrumbJsonLd, partnerListJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Licensed Daycares in Sunnyvale, Santa Clara & Newark",
  description:
    "Browse licensed daycares in Sunnyvale, Santa Clara and Newark. Compare photos, license numbers and tour hours, then book an in-person tour.",
  alternates: { canonical: "/partners" },
  openGraph: {
    title: "Licensed Daycares in Sunnyvale, Santa Clara & Newark | Waymaker Daycare",
    description: "Compare licensed Bay Area daycares and book an in-person tour.",
    url: "/partners",
  },
};

export default function PartnersPage() {
  return (
    <>
      <JsonLd
        data={[
          partnerListJsonLd(partners),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Our Partners", path: "/partners" },
          ]),
        ]}
      />
      <PartnersPageContent />
    </>
  );
}
