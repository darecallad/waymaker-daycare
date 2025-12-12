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
    <Link href={`/partners/${partner.slug}`} className="group block h-full">
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/5 border border-stone-100">
        {/* Image Section */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          {partner.images?.[0] ? (
            <Image
              src={partner.images[0]}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-400 bg-stone-50">
              <span className="text-sm font-medium">{t.noImage}</span>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-70" />
          
          {/* Logo Overlay - Floating Badge Style */}
          <div className="absolute top-4 right-4 h-12 w-12 overflow-hidden rounded-full bg-white p-1 shadow-lg ring-1 ring-black/5 transition-transform duration-500 group-hover:scale-110">
            <Image
              src={partner.logo}
              alt={`${name} logo`}
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Quick Info on Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
             <div className="flex items-center gap-2 text-xs font-medium bg-black/30 backdrop-blur-md rounded-full px-3 py-1 w-fit mb-2 border border-white/10">
              <Clock className="h-3 w-3" />
              <span>{partner.tourHours || t.byAppointment}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-4">
            <h3 className="font-serif text-xl font-bold text-stone-900 transition-colors group-hover:text-[#0F3B4C] line-clamp-1">
              {name}
            </h3>
            <div className="mt-3 flex items-start gap-2 text-sm text-stone-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#73BBD1]" />
              <span className="line-clamp-2 font-medium leading-relaxed">{address}</span>
            </div>
          </div>

          <div className="mt-auto pt-4 flex items-center justify-end">
            <span className="inline-flex items-center gap-1 text-sm font-bold text-[#0F3B4C] transition-all group-hover:gap-2">
              {t.viewDetails} <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
