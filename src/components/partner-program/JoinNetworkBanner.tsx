"use client";

import { ArrowRight, Building2 } from "lucide-react";
import Link from "@/components/ui/link";
import { buttonClass } from "@/components/partner-program/shared";
import { JOIN_ROUTE } from "@/data/partner-program/options";
import { entryCopy } from "@/data/partner-program/entry";
import { useLanguage } from "@/context/LanguageContext";
import { track } from "@/lib/analytics";

/** Providers' way in from /partners. Placed after the daycare grid: the parents' task comes first. */
export function JoinNetworkBanner() {
  const { locale } = useLanguage();
  const t = entryCopy[locale].partners;
  return (
    <section
      aria-labelledby="join-network-banner"
      className="mt-8 grid items-center gap-4 rounded-3xl border-[1.5px] border-dashed border-field bg-white p-5 md:mt-10 md:grid-cols-[auto_1fr_auto] md:gap-6 md:px-7 md:py-6"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-sky-tint text-ink">
        <Building2 aria-hidden="true" className="h-6 w-6" />
      </span>
      <div>
        <h2 id="join-network-banner" className="font-serif text-xl font-bold leading-snug text-ink md:text-[22px]">{t.title}</h2>
        <p className="mt-1 text-text-2">{t.body}</p>
      </div>
      <Link href={JOIN_ROUTE} onClick={() => track("pr_cta_click", { location: "partners_banner" })} className={buttonClass.primary}>
        {t.cta}
        <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" />
      </Link>
    </section>
  );
}
