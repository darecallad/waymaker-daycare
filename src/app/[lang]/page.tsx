import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFaq } from "@/data/faq";
import { pageMetadata, resolveLocale, type LangParams } from "@/lib/page-metadata";
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";

const COPY = {
  en: {
    title: "Waymaker Daycare | Licensed Daycares in Sunnyvale & the Bay Area",
    description:
      "Compare licensed daycares in Sunnyvale, Santa Clara and Newark. See photos, license numbers and tour hours, then book an in-person tour online in English or Chinese.",
    socialDescription: "See photos, license numbers and tour hours for licensed Bay Area daycares, then book a tour online.",
  },
  zh: {
    title: "Waymaker Daycare | 桑尼維爾與灣區持照幼兒園、托兒所",
    description:
      "比較桑尼維爾、聖克拉拉與紐瓦克的持照幼兒園與家庭式托兒所。查看照片、執照號碼與參觀時間，用中文或英文線上預約實地參觀。",
    socialDescription: "查看灣區持照幼兒園的照片、執照號碼與參觀時間，線上預約參觀。",
  },
};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata("/", locale, COPY[locale], { absoluteTitle: true });
}

export default async function Home({ params }: LangParams) {
  const locale = await resolveLocale(params);

  return (
    <>
      <JsonLd data={[organizationJsonLd(locale), websiteJsonLd(locale), faqJsonLd(getFaq(locale), locale)]} />
      <HomeContent />
    </>
  );
}
