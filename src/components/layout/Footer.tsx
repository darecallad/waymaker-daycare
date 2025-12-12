"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const { locale } = useLanguage();

  const copy = {
    en: {
      desc: "Connecting families with trusted, high-quality daycare centers in your community. We are dedicated to providing safe and nurturing environments for children to grow and learn.",
      company: "Company",
      about: "About Us",
      careers: "Careers",
      contact: "Contact",
      resources: "Resources",
      findDaycare: "Find a Daycare",
      blog: "Parenting Blog",
      faq: "FAQs",
      contactTitle: "Contact Us",
      serviceArea: "Service Areas",
      serviceAreaDesc: "Proudly serving families in Mountain View, Sunnyvale, Cupertino, Santa Clara, San Jose, Milpitas, Fremont, Newark, San Lorenzo, Los Altos, and Campbell.",
      rights: "Waymaker Daycare. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      newsletterTitle: "Stay Updated",
      newsletterDesc: "Subscribe to our newsletter for the latest parenting tips and daycare updates.",
      subscribe: "Subscribe",
      emailPlaceholder: "Enter your email"
    },
    zh: {
      desc: "連結家庭與社區中值得信賴、高品質的幼兒園。我們致力於為孩子提供安全和培育的環境，讓他們成長和學習。",
      company: "公司",
      about: "關於我們",
      careers: "職涯機會",
      contact: "聯絡我們",
      resources: "資源",
      findDaycare: "尋找幼兒園",
      blog: "育兒部落格",
      faq: "常見問題",
      contactTitle: "聯絡資訊",
      serviceArea: "服務區域",
      serviceAreaDesc: "榮幸為山景城、桑尼維爾、庫比蒂諾、聖塔克拉拉、聖荷西、苗必達、弗里蒙特、紐瓦克、聖洛倫佐、洛斯阿爾托斯和坎貝爾的家庭服務。",
      rights: "Waymaker Daycare. 版權所有。",
      privacy: "隱私政策",
      terms: "服務條款",
      newsletterTitle: "保持更新",
      newsletterDesc: "訂閱我們的電子報，獲取最新的育兒技巧和幼兒園更新。",
      subscribe: "訂閱",
      emailPlaceholder: "輸入您的電子郵件"
    },
  };

  const t = copy[locale] ?? copy.en;

  const serviceAreas = [
    "San Jose", "Milpitas", "Santa Clara", "Sunnyvale", 
    "Cupertino", "Mountain View", "Fremont", "Newark", 
    "Campbell", "Los Altos", "San Lorenzo"
  ];

  return (
    <footer className="bg-gradient-to-r from-[#A8D5BA] via-[#D2EFE5] to-[#73BBD1] text-stone-700 pt-20 pb-10 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A8D5BA] via-[#D2EFE5] to-[#73BBD1]"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative h-[60px] w-[200px]">
                <Image
                  src="/waymaker-logo.svg"
                  alt="Waymaker Daycare Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-stone-700 leading-relaxed max-w-sm font-medium">
              {t.desc}
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className="mb-6 font-serif text-lg font-bold text-[#0F3B4C]">{t.company}</h4>
            <ul className="space-y-4">
              <li><a href="https://cpr.waymakerbiz.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#0F6C8C] transition-colors duration-200 font-medium">{t.about}</a></li>
              <li><a href="https://cpr.waymakerbiz.com/consulting" target="_blank" rel="noopener noreferrer" className="hover:text-[#0F6C8C] transition-colors duration-200 font-medium">{t.careers}</a></li>
              <li><a href="https://cpr.waymakerbiz.com/contact" target="_blank" rel="noopener noreferrer" className="hover:text-[#0F6C8C] transition-colors duration-200 font-medium">{t.contact}</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-6 font-serif text-lg font-bold text-[#0F3B4C]">{t.resources}</h4>
            <ul className="space-y-4">
              <li><Link href="/partners" className="hover:text-[#0F6C8C] transition-colors duration-200 font-medium">{t.findDaycare}</Link></li>
              <li><a href="https://www.sunnychildcare.com/resources/blog" target="_blank" rel="noopener noreferrer" className="hover:text-[#0F6C8C] transition-colors duration-200 font-medium">{t.blog}</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4">
            <h4 className="mb-6 font-serif text-lg font-bold text-[#0F3B4C]">{t.contactTitle}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <MapPin className="h-5 w-5 text-[#0F6C8C] mt-0.5 group-hover:text-[#0F3B4C] transition-colors" />
                <span className="group-hover:text-[#0F3B4C] transition-colors font-medium">2586 Seaboard Ave<br />San Jose, CA 95131</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="h-5 w-5 text-[#0F6C8C] group-hover:text-[#0F3B4C] transition-colors" />
                <a href="mailto:daycare@waymakerbiz.com" className="hover:text-[#0F3B4C] transition-colors font-medium">
                  daycare@waymakerbiz.com
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="h-5 w-5 text-[#0F6C8C] group-hover:text-[#0F3B4C] transition-colors" />
                <a href="tel:4085903617" className="hover:text-[#0F3B4C] transition-colors font-medium">
                  (408) 590-3617
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Service Area */}
        <div className="border-t border-[#0F3B4C]/10 pt-10 pb-10">
          <h4 className="mb-6 font-serif text-sm font-bold text-[#0F3B4C] text-center tracking-widest uppercase opacity-80">{t.serviceArea}</h4>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-sm text-stone-600">
            {serviceAreas.map((area, index) => (
              <div key={area} className="flex items-center">
                <span className="hover:text-[#0F3B4C] transition-colors cursor-default font-medium">{area}</span>
                {index < serviceAreas.length - 1 && (
                  <span className="ml-3 text-[#0F3B4C]/40">•</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#0F3B4C]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-600 font-medium">
          <p>&copy; {new Date().getFullYear()} {t.rights}</p>
        </div>
      </div>
    </footer>
  );
}
