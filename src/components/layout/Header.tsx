"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/ui/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { stripLocale } from "@/lib/i18n";

const copy = {
  en: { home: "Home", partners: "Our Partners", providers: "For Providers", bookTour: "Book a Tour", menu: "Menu", nav: "Main" },
  zh: { home: "首頁", partners: "合作幼兒園", providers: "開園諮詢", bookTour: "預約參觀", menu: "選單", nav: "主選單" },
};

const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/partners", key: "partners" },
  { href: "/for-providers", key: "providers" },
] as const;

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const { locale } = useLanguage();
  const t = copy[locale] ?? copy.en;
  // Compare against the English path so /zh/partners still marks "Our Partners".
  const pathname = stripLocale(usePathname() ?? "/");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Escape closes the mobile menu and returns focus to its toggle.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-gradient-to-r from-[#A8D5BA] via-[#D2EFE5] to-[#73BBD1] shadow-sm">
      <div className="container mx-auto flex h-[80px] items-center justify-between px-4 md:h-[100px] md:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg transition-opacity hover:opacity-90">
          <div className="relative h-[56px] w-[180px] md:h-[72px] md:w-[240px]">
            <Image src="/waymaker-logo.svg" alt="Waymaker Daycare home" fill className="object-contain" priority />
          </div>
        </Link>

        <nav aria-label={t.nav} className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? "page" : undefined}
              className="text-sm font-bold tracking-wide text-[#0F3B4C] underline-offset-8 transition-colors hover:text-[#0F6C8C] aria-[current=page]:underline aria-[current=page]:decoration-2"
            >
              {t[key]}
            </Link>
          ))}
          <LanguageToggle />
          <Button asChild className="rounded-full bg-[#0F3B4C] text-white shadow-md transition-all duration-300 hover:bg-[#0F6C8C] hover:shadow-lg">
            <Link href="/book-tour">{t.bookTour}</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#0F3B4C] transition-colors hover:bg-white/30"
            aria-label={t.menu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label={t.nav}
          className="absolute left-0 top-[80px] w-full border-b border-stone-100 bg-white shadow-xl motion-safe:animate-in motion-safe:slide-in-from-top-5 md:hidden"
        >
          <ul className="flex flex-col space-y-2 p-4">
            {NAV_LINKS.map(({ href, key }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMenu}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                  className={cn(
                    "block rounded-xl px-4 py-3 text-lg font-medium text-[#0F3B4C] transition-colors hover:bg-stone-50",
                    isActive(pathname, href) && "bg-[#F0F9F6] font-semibold",
                  )}
                >
                  {t[key]}
                </Link>
              </li>
            ))}
            <li className="px-4 pt-2">
              <Button asChild className="h-12 w-full rounded-full bg-[#0F3B4C] text-lg text-white hover:bg-[#0F6C8C]">
                <Link href="/book-tour" onClick={closeMenu}>{t.bookTour}</Link>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
