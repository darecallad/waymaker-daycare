"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck, User, Phone, Mail, ImageIcon, ArrowLeft, Globe, Star } from "lucide-react";
import { Partner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface PartnerDetailContentProps {
  partner: Partner;
}

export function PartnerDetailContent({ partner }: PartnerDetailContentProps) {
  const { locale } = useLanguage();

  const copy = {
    en: {
      backToAll: "Back to All Daycares",
      childcareCenter: "Childcare Center",
      licensedDaycare: "Licensed Daycare",
      licenseNum: "License #",
      aboutUs: "About Us",
      photoGallery: "Photo Gallery",
      photoComingSoon: "Photo Coming Soon",
      contactInfo: "Contact Information",
      owner: "Owner",
      ownerPhone: "Direct Phone",
      ownerEmail: "Direct Email",
      admissionsPhone: "Admissions Phone",
      admissionsEmail: "Admissions Email",
      website: "Website",
      address: "Address",
      location: "Location",
      openMaps: "Open in Google Maps",
      readReviews: "Read Google Reviews",
      bookTour: "Book a Tour",
      bookTourDesc: "Interested in this daycare? Contact us to schedule a visit.",
      contactNow: "Contact Now",
      reviews: "Reviews",
      reviewsDesc: "Encourage parents to leave comments so that good schools can be seen by more people.",
      leaveReview: "Leave a Review",
    },
    zh: {
      backToAll: "返回所有幼兒園",
      childcareCenter: "幼兒中心",
      licensedDaycare: "持照幼兒園",
      licenseNum: "執照號碼 #",
      aboutUs: "關於我們",
      photoGallery: "照片集",
      photoComingSoon: "照片即將上線",
      contactInfo: "聯絡資訊",
      owner: "負責人",
      ownerPhone: "園所電話",
      ownerEmail: "園所信箱",
      admissionsPhone: "招生專線",
      admissionsEmail: "招生信箱",
      website: "網站",
      address: "地址",
      location: "位置",
      openMaps: "在 Google 地圖中開啟",
      readReviews: "閱讀 Google 評論",
      bookTour: "預約參觀",
      bookTourDesc: "對這家幼兒園感興趣嗎？請聯繫我們安排參觀。",
      contactNow: "立即聯繫",
      reviews: "評論",
      reviewsDesc: "鼓勵家長留下評論，讓更多人看見優秀的學校。",
      leaveReview: "留下評論",
    },
  };

  const t = copy[locale] ?? copy.en;
  const name = locale === 'zh' && partner.name_zh ? partner.name_zh : partner.name;
  const description = locale === 'zh' && partner.description_zh ? partner.description_zh : partner.description;
  const address = locale === 'zh' && partner.address_zh ? partner.address_zh : partner.address;

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <Link 
          href="/partners" 
          className="inline-flex items-center text-stone-600 hover:text-indigo-600 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToAll}
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-[#A8D5BA] via-[#D2EFE5] to-[#73BBD1] h-48 md:h-64 relative">
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 bg-gradient-to-t from-white/40 to-transparent">
            </div>
          </div>

          <div className="px-6 md:px-12 -mt-24 relative z-10 flex flex-col items-center text-center">
            <div className="bg-white rounded-3xl p-4 shadow-xl border border-stone-100 mb-6 h-40 w-40 md:h-56 md:w-56 flex items-center justify-center overflow-hidden">
               <div className="relative w-full h-full">
                 <Image 
                    src={partner.logo} 
                    alt={name}
                    fill
                    className="object-contain"
                 />
               </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4 font-serif">
              {name}
            </h1>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                partner.type === 'Center' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                  : 'bg-green-50 text-green-700 border border-green-100'
              }`}>
                <ShieldCheck className="w-4 h-4" />
                {partner.type === 'Center' ? t.childcareCenter : t.licensedDaycare}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-sm font-medium border border-stone-200">
                {t.licenseNum} {partner.license}
              </span>
            </div>
          </div>

          <div className="px-6 md:px-12 pb-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h2 className="text-2xl font-bold text-stone-900 mb-4 font-serif">{t.aboutUs}</h2>
                  <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-line">
                    {description}
                  </p>
                </section>

                {/* Gallery Placeholders */}
                <section>
                  <h2 className="text-2xl font-bold text-stone-900 mb-6 font-serif">{t.photoGallery}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partner.images && partner.images.length > 0 ? (
                      partner.images.map((image, i) => (
                        <div key={i} className="aspect-video bg-stone-100 rounded-xl overflow-hidden border border-stone-200 relative group">
                          <Image 
                            src={image} 
                            alt={`${name} - Photo ${i + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ))
                    ) : (
                      [1, 2].map((i) => (
                        <div key={i} className="aspect-video bg-stone-100 rounded-xl flex items-center justify-center border border-stone-200">
                          <div className="text-center text-stone-400">
                            <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <span className="text-sm">{t.photoComingSoon}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100">
                  <h2 className="text-xl font-bold text-indigo-900 mb-6 font-serif">{t.contactInfo}</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <User className="w-5 h-5 text-indigo-600 mt-1" />
                      <div>
                        <p className="font-medium text-stone-900">{t.owner}</p>
                        <p className="text-stone-600">{partner.owner}</p>
                      </div>
                    </div>
                    
                    {partner.ownerPhone && (
                      <div className="flex items-start gap-4">
                        <Phone className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="font-medium text-stone-900">{t.ownerPhone}</p>
                          <p className="text-stone-600">{partner.ownerPhone}</p>
                        </div>
                      </div>
                    )}

                    {partner.ownerEmail && (
                      <div className="flex items-start gap-4">
                        <Mail className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="font-medium text-stone-900">{t.ownerEmail}</p>
                          <p className="text-stone-600">{partner.ownerEmail}</p>
                        </div>
                      </div>
                    )}

                    {partner.phone && (
                      <div className="flex items-start gap-4">
                        <Phone className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="font-medium text-stone-900">{t.admissionsPhone}</p>
                          <p className="text-stone-600">{partner.phone}</p>
                        </div>
                      </div>
                    )}

                    {partner.email && (
                      <div className="flex items-start gap-4">
                        <Mail className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="font-medium text-stone-900">{t.admissionsEmail}</p>
                          <p className="text-stone-600">{partner.email}</p>
                        </div>
                      </div>
                    )}

                    {partner.website && (
                      <div className="flex items-start gap-4">
                        <Globe className="w-5 h-5 text-indigo-600 mt-1" />
                        <div>
                          <p className="font-medium text-stone-900">{t.website}</p>
                          <a 
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="text-indigo-600 hover:underline break-all"
                          >
                            {partner.website}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-indigo-600 mt-1" />
                      <div>
                        <p className="font-medium text-stone-900">{t.address}</p>
                        <p className="text-stone-600">{partner.address}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Google Maps Embed */}
                <section>
                  <h2 className="text-2xl font-bold text-stone-900 mb-6 font-serif">{t.location}</h2>
                  <div className="w-full h-[300px] bg-stone-100 rounded-2xl overflow-hidden border border-stone-200">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(partner.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  </div>
                  <div className="mt-2 text-right flex justify-end gap-4">
                      {partner.googleReviewUrl && (
                        <a
                            href={partner.googleReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                        >
                            {t.readReviews} <Globe className="w-3 h-3" />
                        </a>
                      )}
                      <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                      >
                          {t.openMaps} <MapPin className="w-3 h-3" />
                      </a>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-6">
                    <h3 className="text-xl font-bold text-stone-900 mb-4 font-serif">
                      {t.bookTour}
                    </h3>
                    <p className="text-stone-500 mb-6 text-sm">
                      {t.bookTourDesc}
                    </p>
                    <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-xl text-lg shadow-md">
                      <Link href="/book-tour">
                        <Phone className="w-5 h-5 mr-2" />
                        {t.contactNow}
                      </Link>
                    </Button>
                  </div>

                  {partner.googleReviewUrl && (
                    <div className="bg-blue-50 rounded-2xl shadow-lg border border-blue-100 p-6">
                      <h3 className="text-xl font-bold text-blue-900 mb-4 font-serif flex items-center gap-2">
                        <Star className="w-5 h-5 fill-blue-600 text-blue-600" />
                        {t.reviews}
                      </h3>
                      <p className="text-blue-700 mb-6 text-sm leading-relaxed">
                        {t.reviewsDesc}
                      </p>
                      <Button asChild variant="outline" className="w-full bg-white hover:bg-blue-50 text-blue-600 border-blue-200 font-bold py-6 rounded-xl text-lg shadow-sm">
                        <a href={partner.googleReviewUrl} target="_blank" rel="noopener noreferrer">
                          <Star className="w-5 h-5 mr-2" />
                          {t.leaveReview}
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}