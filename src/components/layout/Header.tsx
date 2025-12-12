"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

export function Header() {
  const { locale } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-gradient-to-r from-[#A8D5BA] via-[#D2EFE5] to-[#73BBD1] shadow-sm">
      <div className="container mx-auto flex h-[80px] items-center justify-between px-4 md:h-[100px] md:px-6">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
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
            className="text-sm font-bold tracking-wide text-[#0F3B4C] transition-colors hover:text-[#0F6C8C]"
          >
            {t.home}
          </Link>
          <Link
            href="/partners"
            className="text-sm font-bold tracking-wide text-[#0F3B4C] transition-colors hover:text-[#0F6C8C]"
          >
            {t.partners}
          </Link>
          <LanguageToggle />
          <Button asChild className="rounded-full bg-[#0F3B4C] text-white hover:bg-[#0F6C8C] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <Link href="/book-tour">
              {t.bookTour}
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <LanguageToggle />
          <button 
            onClick={toggleMenu}
            className="p-2 text-[#0F3B4C] hover:bg-white/20 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-[80px] left-0 w-full bg-white border-b border-stone-100 shadow-xl md:hidden animate-in slide-in-from-top-5">
          <nav className="flex flex-col p-4 space-y-4">
            <Link
              href="/"
              className="px-4 py-3 text-lg font-medium text-[#0F3B4C] hover:bg-stone-50 rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t.home}
            </Link>
            <Link
              href="/partners"
              className="px-4 py-3 text-lg font-medium text-[#0F3B4C] hover:bg-stone-50 rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t.partners}
            </Link>
            <div className="px-4 pt-2">
              <Button asChild className="w-full rounded-full bg-[#0F3B4C] text-white hover:bg-[#0F6C8C] h-12 text-lg">
                <Link href="/book-tour" onClick={() => setIsMenuOpen(false)}>
                  {t.bookTour}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
