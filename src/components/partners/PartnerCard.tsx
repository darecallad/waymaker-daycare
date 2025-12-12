import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Partner } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

interface PartnerCardProps {
  partner: Partner;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const { locale } = useLanguage();

  const copy = {
    en: {
      viewDetails: "View Details",
      noImage: "No Image Available",
      byAppointment: "By Appointment"
    },
    zh: {
      viewDetails: "查看詳情",
      noImage: "暫無圖片",
      byAppointment: "需預約"
    }
  };

  const t = copy[locale] ?? copy.en;
  const name = locale === 'zh' && partner.name_zh ? partner.name_zh : partner.name;
  const address = locale === 'zh' && partner.address_zh ? partner.address_zh : partner.address;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-stone-200/60">
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {partner.images?.[0] ? (
          <Image
            src={partner.images[0]}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <span className="text-sm">{t.noImage}</span>
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Logo Overlay */}
        <div className="absolute bottom-4 left-4 h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-white shadow-lg transition-transform duration-500 group-hover:scale-110">
          <Image
            src={partner.logo}
            alt={`${name} logo`}
            width={56}
            height={56}
            className="h-full w-full object-contain p-1.5"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-7">
        <div className="mb-4">
          <h3 className="font-serif text-2xl font-bold text-stone-900 transition-colors group-hover:text-indigo-900">
            {name}
          </h3>
          <div className="mt-3 flex items-start gap-2 text-sm text-stone-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <span className="line-clamp-1 font-medium">{address}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-stone-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{partner.tourHours || t.byAppointment}</span>
            </div>
            <Link
              href={`/partners/${partner.slug}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
            >
              {t.viewDetails} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
