import type { Metadata } from "next";
import { PartnersPageContent } from "@/components/partners/PartnersPageContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { partners } from "@/data/partners";
import { pageMetadata, resolveLocale, type LangParams } from "@/lib/page-metadata";
import { breadcrumbJsonLd, partnerListJsonLd } from "@/lib/structured-data";

const COPY = {
  en: {
    title: "Licensed Daycares in Sunnyvale, Santa Clara & Newark",
    description:
      "Browse licensed daycares in Sunnyvale, Santa Clara and Newark. Compare photos, license numbers and tour hours, then book an in-person tour.",
    socialDescription: "Compare licensed Bay Area daycares and book an in-person tour.",
    home: "Home",
    partners: "Our Partners",
  },
  zh: {
    title: "桑尼維爾、聖克拉拉與紐瓦克的持照幼兒園",
    description: "瀏覽桑尼維爾、聖克拉拉與紐瓦克的持照幼兒園。比較照片、執照號碼與參觀時間，並線上預約實地參觀。",
    socialDescription: "比較灣區持照幼兒園，線上預約實地參觀。",
    home: "首頁",
    partners: "合作幼兒園",
  },
};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata("/partners", locale, COPY[locale]);
}

export default async function PartnersPage({ params }: LangParams) {
  const locale = await resolveLocale(params);
  const t = COPY[locale];

  return (
    <>
      <JsonLd
        data={[
          partnerListJsonLd(partners, locale),
          breadcrumbJsonLd([{ name: t.home, path: "/" }, { name: t.partners, path: "/partners" }], locale),
        ]}
      />
      <PartnersPageContent />
    </>
  );
}
