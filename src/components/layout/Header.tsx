"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

export function Header() {
  const { locale } = useLanguage();

  const copy = {
    en: {
      home: "Home",
      partners: "Our Partners",
      bookTour: "Book a Tour",
    },
    zh: {
      home: "首頁",
      partners: "合作幼兒園",
      bookTour: "預約參觀",
    },
  };

  const t = copy[locale] ?? copy.en;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#CDE6E0] bg-gradient-to-r from-[#A8D5BA] via-[#D2EFE5] to-[#73BBD1]">
      <div className="container mx-auto flex h-[80px] items-center justify-between px-4 md:h-[100px] md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-[56px] w-[180px] md:h-[72px] md:w-[240px]">
            <Image
              src="/waymaker-logo.svg"
              alt="Waymaker Daycare Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-indigo-600"
          >
            {t.home}
          </Link>
          <Link
            href="/partners"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-indigo-600"
          >
            {t.partners}
          </Link>
          <LanguageToggle />
          <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700">
            <Link href="/book-tour">
              {t.bookTour}
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <LanguageToggle />
          <button className="p-2 text-stone-600">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
