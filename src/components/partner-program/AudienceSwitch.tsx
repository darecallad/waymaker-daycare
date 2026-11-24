"use client";

import { Building2, Home } from "lucide-react";
import Link from "@/components/ui/link";
import { AUDIENCES, JOIN_ROUTE, joinCopy, type Audience } from "@/data/partner-program";
import { useLanguage } from "@/context/LanguageContext";
import { track } from "@/lib/analytics";

export const AUDIENCE_ICONS = { family: Home, center: Building2 } as const;

/** Two links, not tabs: each audience is a real URL, so it works without JavaScript and can be shared. */
export function AudienceSwitch({ type }: { type: Audience }) {
  const { locale } = useLanguage();
  const t = joinCopy[locale].hero;
  return (
    <div
      role="group"
      aria-label={t.switchLabel}
      className="flex w-full gap-1 rounded-full bg-white p-1 shadow-[inset_0_0_0_1.5px_var(--color-field)] md:inline-flex md:w-auto"
    >
      {AUDIENCES.map((audience) => {
        const Icon = AUDIENCE_ICONS[audience];
        return (
          <Link
            key={audience}
            href={audience === "family" ? JOIN_ROUTE : `${JOIN_ROUTE}?type=${audience}`}
            scroll={false}
            aria-current={audience === type ? "true" : undefined}
            onClick={() => track("pr_audience_switch", { to: audience })}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-2.5 text-sm font-bold text-ink transition-colors hover:bg-mint-tint aria-[current=true]:bg-ink aria-[current=true]:text-white aria-[current=true]:hover:bg-ink motion-reduce:transition-none sm:px-5 sm:text-[15px] md:flex-none"
          >
            <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
            {t.audiences[audience]}
          </Link>
        );
      })}
    </div>
  );
}
