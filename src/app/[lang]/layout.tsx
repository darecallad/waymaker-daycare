import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RootDocument } from "@/components/layout/RootDocument";
import { LanguageProvider } from "@/context/LanguageContext";
import { OG_LOCALE, isLocale, locales } from "@/lib/i18n";
import { resolveLocale, type LangParams } from "@/lib/page-metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/** Both languages are built ahead of time; any other first segment is a 404. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

const SITE_COPY = {
  en: {
    title: `${SITE_NAME} | Licensed Daycares in Sunnyvale & the Bay Area`,
    description:
      "Find licensed daycares in Sunnyvale, Santa Clara and Newark, and book an in-person tour online in English or Chinese.",
    heroAlt: "Children doing an art project with a teacher at a daycare",
    skip: "Skip to main content",
  },
  zh: {
    title: `${SITE_NAME} | 桑尼維爾與灣區持照幼兒園`,
    description: "尋找桑尼維爾、聖克拉拉與紐瓦克的持照幼兒園，並用中文或英文線上預約實地參觀。",
    heroAlt: "孩子們和老師在幼兒園一起做美勞",
    skip: "跳到主要內容",
  },
};

/** Site-wide defaults in the page's language; each page still sets its own title. */
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const copy = SITE_COPY[locale];

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: copy.title, template: `%s | ${SITE_NAME}` },
    description: copy.description,
    applicationName: SITE_NAME,
    openGraph: {
      siteName: SITE_NAME,
      type: "website",
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[locale === "en" ? "zh" : "en"]],
      images: [{ url: "/home-hero.jpg", alt: copy.heroAlt }],
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
    icons: { icon: "/favicon.svg" },
    verification: { google: "wqsmfv5CDzDhVmznMsZq5qhD-w-oSxBYQO3U4pMEazo" },
  };
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <RootDocument locale={lang}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#0F3B4C] focus:px-5 focus:py-3 focus:text-white"
      >
        {SITE_COPY[lang].skip}
      </a>
      <LanguageProvider locale={lang}>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
        <Footer />
      </LanguageProvider>
    </RootDocument>
  );
}
