"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck, User, Phone, Mail, ImageIcon, ArrowLeft, Globe, Star, Clock, ArrowRight } from "lucide-react";
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
      tourHours: "Tour Hours"
    },
    zh: {
      backToAll: "è¿”å›žæ‰€æœ‰å¹¼å…’åœ’",
      childcareCenter: "å¹¼å…’ä¸­å¿ƒ",
      licensedDaycare: "æŒç…§å¹¼å…’åœ’",
      licenseNum: "åŸ·ç…§è™Ÿç¢¼ #",
      aboutUs: "é—œæ–¼æˆ‘å€‘",
      photoGallery: "ç…§ç‰‡é›†",
      photoComingSoon: "ç…§ç‰‡å³å°‡ä¸Šç·š",
      contactInfo: "è¯çµ¡è³‡è¨Š",
      owner: "è² è²¬äºº",
      ownerPhone: "åœ’æ‰€é›»è©±",
      ownerEmail: "åœ’æ‰€ä¿¡ç®±",
      admissionsPhone: "æ‹›ç”Ÿå°ˆç·š",
      admissionsEmail: "æ‹›ç”Ÿä¿¡ç®±",
      website: "ç¶²ç«™",
      address: "åœ°å€",
      location: "ä½ç½®",
      openMaps: "åœ¨ Google åœ°åœ–ä¸­é–‹å•Ÿ",
      readReviews: "é–±è®€ Google è©•è«–",
      bookTour: "é ç´„åƒè§€",
      bookTourDesc: "å°é€™å®¶å¹¼å…’åœ’æ„Ÿèˆˆè¶£å—Žï¼Ÿè«‹è¯ç¹«æˆ‘å€‘å®‰æŽ’åƒè§€ã€‚",
      contactNow: "ç«‹å³è¯ç¹«",
      reviews: "è©•è«–",
      reviewsDesc: "é¼“å‹µå®¶é•·ç•™ä¸‹è©•è«–ï¼Œè®“æ›´å¤šäººçœ‹è¦‹å„ªç§€çš„å­¸æ ¡ã€‚",
      leaveReview: "ç•™ä¸‹è©•è«–",
      tourHours: "åƒè§€æ™‚é–“"
    },
  };

  const t = copy[locale] ?? copy.en;
  const name = locale === 'zh' && partner.name_zh ? partner.name_zh : partner.name;
  const description = locale === 'zh' && partner.description_zh ? partner.description_zh : partner.description;
  const address = locale === 'zh' && partner.address_zh ? partner.address_zh : partner.address;

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20 pt-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <Link 
          href="/partners" 
          className="inline-flex items-center text-stone-500 hover:text-[#0F3B4C] font-medium mb-8 transition-colors group"
        >
          <div className="bg-white p-2 rounded-full shadow-sm border border-stone-100 mr-3 group-hover:border-[#73BBD1] transition-colors">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </div>
          {t.backToAll}
        </Link>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/40 border border-stone-100 overflow-hidden">
          {/* Hero Banner */}
          <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
             {partner.images?.[0] ? (
                <>
                  <Image 
                    src={partner.images[0]} 
                    alt="Banner" 
                    fill 
                    priority
                    className="object-cover blur-sm scale-105 opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0F3B4C]/60 via-transparent to-white/90"></div>
                </>
             ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F3B4C] to-[#134E63]">
                    <div className="absolute inset-0 opacity-20 bg-[url('/pattern.png')]"></div>
                </div>
             )}
          </div>

          <div className="px-6 md:px-12 -mt-40 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8 pb-10 border-b border-stone-100">
            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-stone-300/50 border border-stone-100 h-48 w-48 md:h-56 md:w-56 flex-shrink-0 flex items-center justify-center overflow-hidden relative group">
               <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
                 <Image 
                    src={partner.logo} 
                    alt={name}
                    fill
                    className="object-contain p-2"
                 />
               </div>
            </div>
            
            <div className="text-center md:text-left flex-1 pb-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <span className="inline-flex items-center rounded-full bg-[#D2EFE5] px-4 py-1.5 text-xs font-bold text-[#0F3B4C] ring-1 ring-inset ring-[#A8D5BA] shadow-sm">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  {t.licensedDaycare}
                </span>
                <span className="inline-flex items-center rounded-full bg-stone-100 px-4 py-1.5 text-xs font-bold text-stone-600 ring-1 ring-inset ring-stone-200">
                  {t.licenseNum} {partner.license}
                </span>
              </div>
              
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#0F3B4C] mb-4 tracking-tight">
                {name}
              </h1>
              
              <div className="flex flex-col md:flex-row items-center gap-6 text-stone-600 text-sm font-medium">
                <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                  <MapPin className="h-4 w-4 text-[#73BBD1]" />
                  <span>{address}</span>
                </div>
                {partner.tourHours && (
                  <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                    <Clock className="h-4 w-4 text-[#73BBD1]" />
                    <span>{t.tourHours}: {partner.tourHours}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 pb-4">
               <Button asChild size="lg" className="h-14 px-8 rounded-full bg-[#0F3B4C] hover:bg-[#134E63] text-white shadow-lg shadow-[#0F3B4C]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-base font-bold">
                  <Link href="/book-tour">{t.bookTour}</Link>
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 md:p-12">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-16">
              {/* About Section */}
              <section>
                <h2 className="font-serif text-3xl font-bold text-[#0F3B4C] mb-8 flex items-center gap-3">
                  <div className="p-2 bg-[#D2EFE5] rounded-xl text-[#0F3B4C]">
                    <User className="h-6 w-6" />
                  </div>
                  {t.aboutUs}
                </h2>
                <div className="prose prose-lg prose-stone max-w-none text-stone-600 leading-relaxed">
                  <p>{description}</p>
                </div>
              </section>

              {/* Gallery Section */}
              <section>
                <h2 className="font-serif text-3xl font-bold text-[#0F3B4C] mb-8 flex items-center gap-3">
                  <div className="p-2 bg-[#D2EFE5] rounded-xl text-[#0F3B4C]">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  {t.photoGallery}
                </h2>
                
                {partner.images && partner.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {partner.images.map((image, index) => (
                      <div 
                        key={index} 
                        className={`group relative overflow-hidden rounded-2xl bg-stone-100 shadow-md hover:shadow-xl transition-all duration-300 ${
                            index === 0 ? 'md:col-span-2 aspect-[2/1]' : 'aspect-[4/3]'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${name} photo ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes={index === 0 ? "(max-width: 768px) 100vw, 80vw" : "(max-width: 768px) 100vw, 40vw"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-3xl bg-stone-50 border-2 border-dashed border-stone-200 text-stone-400">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 mb-4 opacity-30" />
                      <p className="font-medium">{t.photoComingSoon}</p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
                <div className="sticky top-24 space-y-8">
                  {/* Contact Card */}
                  <div className="rounded-3xl bg-white p-8 shadow-xl shadow-stone-200/50 border border-stone-100">
                    <h3 className="font-serif text-xl font-bold text-[#0F3B4C] mb-8 pb-4 border-b border-stone-100">
                      {t.contactInfo}
                    </h3>
                    
                    <div className="space-y-6">
                      {partner.owner && (
                        <div className="flex items-start gap-4 group">
                          <div className="rounded-xl bg-[#F0F9F6] p-3 text-[#0F3B4C] group-hover:bg-[#0F3B4C] group-hover:text-white transition-colors">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{t.owner}</p>
                            <p className="font-medium text-stone-800">{partner.owner}</p>
                          </div>
                        </div>
                      )}

                      {partner.ownerPhone && (
                        <div className="flex items-start gap-4 group">
                          <div className="rounded-xl bg-[#F0F9F6] p-3 text-[#0F3B4C] group-hover:bg-[#0F3B4C] group-hover:text-white transition-colors">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{t.ownerPhone}</p>
                            <a href={`tel:${partner.ownerPhone}`} className="font-medium text-stone-800 hover:text-[#0F6C8C] transition-colors">
                              {partner.ownerPhone}
                            </a>
                          </div>
                        </div>
                      )}

                      {partner.ownerEmail && (
                        <div className="flex items-start gap-4 group">
                          <div className="rounded-xl bg-[#F0F9F6] p-3 text-[#0F3B4C] group-hover:bg-[#0F3B4C] group-hover:text-white transition-colors">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{t.ownerEmail}</p>
                            <a href={`mailto:${partner.ownerEmail}`} className="font-medium text-stone-800 hover:text-[#0F6C8C] transition-colors break-all">
                              {partner.ownerEmail}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-stone-100">
                        <div className="flex items-start gap-4 group">
                          <div className="rounded-xl bg-[#F0F9F6] p-3 text-[#0F3B4C] group-hover:bg-[#0F3B4C] group-hover:text-white transition-colors">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{t.location}</p>
                            <p className="font-medium text-stone-800 mb-3 leading-snug">{address}</p>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-[#0F6C8C] hover:text-[#0F3B4C] inline-flex items-center gap-1 group/link"
                            >
                              {t.openMaps} <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Card */}
                  {partner.googleReviewUrl && (
                    <div className="rounded-3xl bg-gradient-to-br from-[#0F3B4C] to-[#134E63] p-8 text-white shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                      
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                          <Star className="h-6 w-6 text-[#FCD34D] fill-[#FCD34D]" />
                        </div>
                        <h3 className="font-serif text-xl font-bold">{t.reviews}</h3>
                      </div>
                      
                      <p className="text-white/90 mb-8 leading-relaxed relative z-10 font-light">
                        {t.reviewsDesc}
                      </p>
                      
                      <Button asChild variant="secondary" className="w-full bg-white text-[#0F3B4C] hover:bg-stone-50 font-bold h-12 rounded-xl shadow-lg border-0 relative z-10">
                        <a href={partner.googleReviewUrl} target="_blank" rel="noopener noreferrer">
                          {t.readReviews}
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
  );
}
