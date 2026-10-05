"use client";

import Image from "next/image";
import Link from "@/components/ui/link";
import { MapPin, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { Partner } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

interface PartnerCardProps {
  partner: Partner;
  /** Keep the document outline valid wherever the card is placed. */
  headingLevel?: "h2" | "h3";
  /** Above-the-fold cards should load eagerly. */
  priority?: boolean;
}

const copy = {
  en: { viewDetails: "View details", noImage: "Photos coming soon", byAppointment: "By appointment", tours: "Tours", licensed: "Licensed" },
  zh: { viewDetails: "查看詳情", noImage: "照片即將上線", byAppointment: "需預約", tours: "參觀", licensed: "持照" },
};

export function PartnerCard({ partner, headingLevel: Heading = "h3", priority = false }: PartnerCardProps) {
  const { locale } = useLanguage();
  const t = copy[locale] ?? copy.en;
  const name = locale === "zh" && partner.name_zh ? partner.name_zh : partner.name;
  const address = locale === "zh" && partner.address_zh ? partner.address_zh : partner.address;

  return (
    <Link
      href={`/partners/${partner.slug}`}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F6C8C] focus-visible:ring-offset-2"
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0F3B4C]/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          {partner.images?.[0] ? (
            <Image
              src={partner.images[0]}
              alt=""
              fill
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-stone-50 text-stone-500">
              <span className="text-sm font-medium">{t.noImage}</span>
            </div>
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

          <div className="absolute right-4 top-4 h-12 w-12 overflow-hidden rounded-full bg-white p-1 shadow-lg ring-1 ring-black/5">
            <Image src={partner.logo} alt="" width={48} height={48} className="h-full w-full object-contain" />
          </div>

          <p className="absolute bottom-4 left-4 right-4 flex w-fit items-start gap-2 rounded-2xl border border-white/10 bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <Clock aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
            <span>
              <span className="sr-only">{t.tours}: </span>
              {partner.tourHours || t.byAppointment}
            </span>
          </p>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <Heading className="line-clamp-2 font-serif text-xl font-bold text-stone-900 transition-colors group-hover:text-[#0F3B4C]">
            {name}
          </Heading>
          <p className="mt-3 flex items-start gap-2 text-sm text-stone-600">
            <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#0F6C8C]" />
            <span className="line-clamp-2 font-medium leading-relaxed">{address}</span>
          </p>

          <div className="mt-auto flex items-center justify-between pt-5">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#D2EFE5] px-2.5 py-1 text-xs font-bold text-[#0F3B4C]">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              {t.licensed}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-[#0F3B4C] transition-all group-hover:gap-2">
              {t.viewDetails} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
