"use client";

import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const copy = {
  en: { title: "Page not found", body: "The page you are looking for has moved or no longer exists.", home: "Back to home", partners: "Browse daycares" },
  zh: { title: "找不到這個頁面", body: "您要找的頁面可能已經移動或不存在。", home: "回到首頁", partners: "瀏覽幼兒園" },
};

/** 404 inside the site, in the language of the URL that missed. */
export default function NotFound() {
  const { locale } = useLanguage();
  const t = copy[locale];

  return (
    <section className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-[#0F6C8C]">404</p>
      <h1 className="font-serif text-3xl font-bold text-[#0F3B4C] md:text-4xl">{t.title}</h1>
      <p className="max-w-md text-stone-600">{t.body}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full bg-[#0F3B4C] text-white hover:bg-[#0F6C8C]">
          <Link href="/">{t.home}</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-[#0F3B4C]/30 text-[#0F3B4C]">
          <Link href="/partners">{t.partners}</Link>
        </Button>
      </div>
    </section>
  );
}
