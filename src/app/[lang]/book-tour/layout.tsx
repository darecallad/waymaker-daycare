import type { Metadata } from "next";
import { pageMetadata, resolveLocale, type LangParams } from "@/lib/page-metadata";

const COPY = {
  en: {
    title: "Book a Daycare Tour in Sunnyvale, Santa Clara & Newark",
    description:
      "Schedule an in-person tour at a licensed Bay Area daycare. Choose a daycare, pick an open date in the next two weeks, and tour in English or Chinese.",
    socialDescription: "Pick a licensed Bay Area daycare and an open date, then visit in person.",
  },
  zh: {
    title: "預約參觀桑尼維爾、聖克拉拉與紐瓦克的幼兒園",
    description: "線上預約灣區持照幼兒園的實地參觀。選擇幼兒園和未來兩週內的日期，可用中文或英文參觀。",
    socialDescription: "選擇灣區持照幼兒園與日期，實地參觀。",
  },
};

// The page itself is a client component, so its metadata lives in this layout.
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata("/book-tour", locale, COPY[locale]);
}

export default function BookTourLayout({ children }: { children: React.ReactNode }) {
  return children;
}
