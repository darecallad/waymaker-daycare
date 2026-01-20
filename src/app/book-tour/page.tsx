"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ShieldCheck, Clock, Globe, Calendar, MapPin, User, Baby, Loader2, ChevronRight, Sparkles, Mail, Phone } from "lucide-react";
import { partners } from "@/data/partners";
import { cn } from "@/lib/utils";

function BookTourContent() {
  const { locale } = useLanguage();
  const searchParams = useSearchParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPartnerSlug, setSelectedPartnerSlug] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    const partnerParam = searchParams.get("partner");
    if (partnerParam) {
      setSelectedPartnerSlug(partnerParam);
    }
  }, [searchParams]);

  const selectedPartner = useMemo(() => 
    partners.find(p => p.slug === selectedPartnerSlug), 
  [selectedPartnerSlug]);

  const copy = {
    en: {
      title: "Schedule a Tour",
      subtitle: "Visit our partner daycares and find the perfect environment for your child.",
      sections: {
        parent: "Parent Information",
        child: "Child Information",
        tour: "Tour Details"
      },
      form: {
        name: "Parent's Name",
        phone: "Phone Number",
        email: "Email Address",
        childAge: "Child's Age",
        location: "Select Daycare",
        date: "Select a Date",
        language: "Preferred Language",
        notes: "Additional Notes / Questions",
        submit: "Request Tour",
        submitting: "Sending Request...",
        tourHours: "Available Time:",
        tourStartNote: "Note: Tours resume from Jan 5th.",
        selectDaycarePlaceholder: "Choose a location...",
        noSlots: "No available slots for the next 2 weeks.",
        selectDaycareFirst: "Please select a daycare above to see available times."
      },
      success: {
        title: "Request Sent Successfully!",
        message: "Thank you for your interest. We have received your request and will contact you shortly to confirm your tour details.",
        back: "Back to Daycares",
      },
      languages: {
        en: "English",
        zh: "Chinese (Mandarin)",
        both: "Both / Either"
      }
    },
    zh: {
      title: "預約參觀",
      subtitle: "參觀我們的合作幼兒園，為您的孩子尋找最適合的成長環境。",
      sections: {
        parent: "家長資訊",
        child: "孩子資訊",
        tour: "參觀詳情"
      },
      form: {
        name: "家長姓名",
        phone: "聯絡電話",
        email: "電子郵件",
        childAge: "孩子年齡",
        location: "選擇幼兒園",
        date: "選擇日期",
        language: "偏好語言",
        notes: "備註 / 問題",
        submit: "預約參觀",
        submitting: "發送中...",
        tourHours: "參觀時間：",
        tourStartNote: "注意：參觀活動將於 1 月 5 日後開始。",
        selectDaycarePlaceholder: "選擇地點...",
        noSlots: "未來兩週暫無可預約時段。",
        selectDaycareFirst: "請先選擇上方的幼兒園以查看可預約時間。"
      },
      success: {
        title: "預約已發送！",
        message: "感謝您的預約。我們已收到您的請求，將盡快與您聯繫確認參觀細節。",
        back: "返回幼兒園列表",
      },
      languages: {
        en: "英文",
        zh: "中文 (普通話)",
        both: "皆可"
      }
    },
  };

  const t = copy[locale] ?? copy.en;

  // Helper to parse tour hours and generate slots
  const availableSlots = useMemo(() => {
    if (!selectedPartner?.tourHours) return [];
    
    const tourHours = selectedPartner.tourHours;
    // Find where the time starts (first digit)
    const timeStartIndex = tourHours.search(/\d/);
    if (timeStartIndex === -1) return [];
    
    const daysPart = tourHours.substring(0, timeStartIndex).trim();
    const timePart = tourHours.substring(timeStartIndex).trim();
    
    const dayMap: Record<string, number> = {
      "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6
    };
    
    const allowedDays = new Set<number>();
    
    // Split by comma for multiple segments
    const segments = daysPart.split(',').map(s => s.trim());
    
    segments.forEach(segment => {
      if (segment.includes('-')) {
        // Range like Mon-Fri
        const [start, end] = segment.split('-').map(s => s.trim());
        const startIdx = dayMap[start];
        const endIdx = dayMap[end];
        if (startIdx !== undefined && endIdx !== undefined) {
          let current = startIdx;
          while (current !== endIdx) {
            allowedDays.add(current);
            current = (current + 1) % 7;
          }
          allowedDays.add(endIdx);
        }
      } else {
        // Single day
        const idx = dayMap[segment];
        if (idx !== undefined) allowedDays.add(idx);
      }
    });
    
    // Generate dates
    const slots = [];
    // User specifically asked for Jan 5th start. 
    // Since current date is Dec 2025, we must target Jan 5, 2026.
    const startDate = new Date("2026-01-05"); 
    const today = new Date();
    
    // Start from tomorrow to exclude today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Ensure we start from Jan 5th, 2026 or later, and not today
    let current = startDate > tomorrow ? startDate : tomorrow;
    
    // Clone current to avoid reference issues
    current = new Date(current);

    // US Holidays for 2026
    const holidays = [
      "2026-01-01", // New Year's Day
      "2026-01-19", // Martin Luther King Jr. Day
      "2026-02-16", // Presidents' Day
      "2026-05-25", // Memorial Day
      "2026-06-19", // Juneteenth
      "2026-07-04", // Independence Day
      "2026-09-07", // Labor Day
      "2026-10-12", // Columbus Day
      "2026-11-11", // Veterans Day
      "2026-11-26", // Thanksgiving Day
      "2026-12-25"  // Christmas Day
    ];
    
    // Get blocked dates for this partner
    const blockedDates = selectedPartner?.blockedDates || [];

    // Generate for next 2 weeks (14 days)
    for (let i = 0; i < 14; i++) {
      // Double check we are not adding dates before Jan 5th
      if (current >= startDate) {
        const dayIdx = current.getDay();
        const dateStr = current.toISOString().split('T')[0];

        if (allowedDays.has(dayIdx) && !holidays.includes(dateStr) && !blockedDates.includes(dateStr)) {
          const displayDate = current.toLocaleDateString(locale === 'zh' ? 'zh-TW' : 'en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });
          slots.push({
            value: dateStr,
            label: displayDate,
            time: timePart
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    return slots;
  }, [selectedPartner, locale]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const selectedDateValue = formData.get("date") as string;
    const selectedSlot = availableSlots.find(s => s.value === selectedDateValue);
    const tourTime = selectedSlot?.time || "10:00 AM - 11:00 AM";

    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      category: "Daycare",
      locale: locale,
      preferredDate: selectedDateValue,
      tourTime: tourTime,
      organization: selectedPartner?.name,
      daycareSlug: selectedPartnerSlug,
      message: `
        Daycare Tour Request
        --------------------
        Child's Age: ${formData.get("childAge")}
        Preferred Daycare: ${selectedPartner?.name || "Not Selected"}
        Preferred Date: ${selectedDateValue}
        Time: ${tourTime}
        Preferred Language: ${formData.get("language")}
        Notes: ${formData.get("notes")}
      `
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
        <Card className="max-w-lg w-full border-none bg-white shadow-2xl rounded-3xl animate-fade-in-up overflow-hidden">
          <div className="h-2 bg-[#0F3B4C] w-full"></div>
          <CardContent className="pt-12 pb-12 text-center px-8">
            <div className="w-20 h-20 bg-[#A8D5BA]/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in">
              <Check className="w-10 h-10 text-[#5da87b]" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#0F3B4C] mb-4">{t.success.title}</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">{t.success.message}</p>
            <Button 
              onClick={() => window.location.href = '/partners'}
              className="bg-[#0F3B4C] hover:bg-[#092530] text-white w-full h-14 text-lg rounded-xl shadow-lg shadow-[#0F3B4C]/20 transition-all hover:scale-[1.02]"
            >
              {t.success.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      {/* Hero Section */}
      <div className="relative bg-[#0F3B4C] text-white pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern-bg.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#73BBD1] rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#A8D5BA] rounded-full blur-[100px] opacity-20 -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#73BBD1] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Book Your Visit</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          
          {/* Section 1: Parent Info */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0F3B4C]/10 flex items-center justify-center text-[#0F3B4C]">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-[#0F3B4C]">{t.sections.parent}</h2>
                <p className="text-sm text-gray-500">Your contact information</p>
              </div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">{t.form.name}</Label>
                <div className="relative">
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-[#0F3B4C] focus:ring-[#0F3B4C]"
                    placeholder="John Doe"
                  />
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">{t.form.email}</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-[#0F3B4C] focus:ring-[#0F3B4C]"
                    placeholder="john@example.com"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">{t.form.phone}</Label>
                <div className="relative">
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    required 
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-[#0F3B4C] focus:ring-[#0F3B4C]"
                    placeholder="+1 (555) 000-0000"
                  />
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Child Info */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#73BBD1]/10 flex items-center justify-center text-[#73BBD1]">
                <Baby className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-[#0F3B4C]">{t.sections.child}</h2>
                <p className="text-sm text-gray-500">Who we'll be caring for</p>
              </div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="childAge" className="text-gray-700 font-medium">{t.form.childAge}</Label>
                <Input 
                  id="childAge" 
                  name="childAge" 
                  required 
                  className="h-12 rounded-xl border-gray-200 focus:border-[#0F3B4C] focus:ring-[#0F3B4C]"
                  placeholder="e.g. 3 years old"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language" className="text-gray-700 font-medium">{t.form.language}</Label>
                <div className="relative">
                  <select 
                    id="language" 
                    name="language" 
                    required
                    className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0F3B4C] focus:border-[#0F3B4C] disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all hover:border-[#73BBD1]"
                    defaultValue="en"
                  >
                    <option value="en">{t.languages.en}</option>
                    <option value="zh">{t.languages.zh}</option>
                    <option value="both">{t.languages.both}</option>
                  </select>
                  <Globe className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Tour Details */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#A8D5BA]/20 flex items-center justify-center text-[#5da87b]">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-[#0F3B4C]">{t.sections.tour}</h2>
                <p className="text-sm text-gray-500">When would you like to visit?</p>
              </div>
            </div>
            <div className="p-8 space-y-8">
              
              {/* Location Selection */}
              <div className="space-y-3">
                <Label htmlFor="location" className="text-base font-medium text-gray-900">{t.form.location}</Label>
                <div className="relative">
                  <select 
                    id="location" 
                    name="location"
                    required
                    className="flex h-14 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 text-base shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0F3B4C] focus:border-[#0F3B4C] disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-[#73BBD1] appearance-none"
                    value={selectedPartnerSlug}
                    onChange={(e) => {
                      setSelectedPartnerSlug(e.target.value);
                      setSelectedDate(""); 
                    }}
                  >
                    <option value="" disabled>{t.form.selectDaycarePlaceholder}</option>
                    {partners.map((partner) => (
                      <option key={partner.slug} value={partner.slug}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4">
                <Label htmlFor="date" className="text-base font-medium text-gray-900">{t.form.date}</Label>
                <input type="hidden" name="date" value={selectedDate} required />
                
                {selectedPartner ? (
                  <div className="animate-fade-in-down">
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedDate === slot.value;
                          return (
                            <button
                              key={slot.value}
                              type="button"
                              onClick={() => setSelectedDate(slot.value)}
                              className={cn(
                                "relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-1 group",
                                isSelected 
                                  ? "bg-[#0F3B4C] border-[#0F3B4C] text-white shadow-lg shadow-[#0F3B4C]/20 scale-[1.02]" 
                                  : "bg-white border-gray-100 text-gray-600 hover:border-[#73BBD1] hover:bg-[#73BBD1]/5 hover:shadow-md"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={cn(
                                  "text-sm font-medium uppercase tracking-wider",
                                  isSelected ? "text-[#73BBD1]" : "text-gray-400"
                                )}>
                                  {slot.label.split(',')[0]} {/* Day name */}
                                </span>
                                {isSelected && <Check className="w-5 h-5 text-white" />}
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className={cn(
                                  "text-lg font-bold",
                                  isSelected ? "text-white" : "text-gray-900"
                                )}>
                                  {slot.label.split(',').slice(1).join(',')} {/* Date */}
                                </span>
                              </div>
                              <div className={cn(
                                "flex items-center gap-1.5 text-sm mt-1",
                                isSelected ? "text-gray-300" : "text-[#0F3B4C]"
                              )}>
                                <Clock className="w-4 h-4" />
                                <span>{slot.time}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">{t.form.noSlots}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">{t.form.selectDaycareFirst}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-700 font-medium">{t.form.notes}</Label>
                <Textarea 
                  id="notes" 
                  name="notes"
                  placeholder={t.form.notes}
                  className="min-h-[120px] bg-gray-50/50 focus:bg-white transition-colors resize-none rounded-xl border-gray-200 focus:border-[#0F3B4C] focus:ring-[#0F3B4C]"
                />
              </div>
            </div>
          </div>

          {/* Security Note & Submit */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4 text-[#A8D5BA]" />
              <span>Your information is secure and encrypted.</span>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#0F3B4C] hover:bg-[#092530] text-white text-lg h-16 rounded-2xl shadow-xl shadow-[#0F3B4C]/20 transition-all hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t.form.submitting}
                </>
              ) : (
                t.form.submit
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function BookTourPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]"><Loader2 className="w-8 h-8 animate-spin text-[#0F3B4C]" /></div>}>
      <BookTourContent />
    </Suspense>
  );
}
