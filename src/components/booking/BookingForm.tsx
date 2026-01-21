"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

// Zod Schema for Validation
const bookingSchema = z.object({
  parentName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  childAge: z.string().min(1, "Child's age is required"),
  preferredDate: z.string().min(1, "Please select a date"),
  message: z.string().min(1, "Message is required"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export function BookingForm() {
  const { locale } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const copy = {
    en: {
      formTitle: "Schedule a Tour",
      formDesc: "Visit our campus and meet the teachers.",
      parentName: "Parent Name",
      parentNamePlaceholder: "Jane Doe",
      phone: "Phone Number",
      phonePlaceholder: "(555) 123-4567",
      email: "Email Address",
      emailPlaceholder: "jane@example.com",
      childAge: "Child's Age",
      selectAge: "Select age group",
      infant: "Infant (0-12 mo)",
      toddler: "Toddler (1-2 yrs)",
      preschool: "Preschool (3-5 yrs)",
      preferredDate: "Preferred Date",
      message: "Message",
      messagePlaceholder: "Any specific questions or requirements?",
      submit: "Request Tour",
      submitting: "Submitting...",
      successTitle: "Request Received",
      successDesc: "Thank you! We have received your tour request and will contact you shortly to confirm.",
      bookAnother: "Book another tour",
    },
    zh: {
      formTitle: "預約參觀",
      formDesc: "參觀我們的校園並認識老師。",
      parentName: "家長姓名",
      parentNamePlaceholder: "王小明",
      phone: "電話號碼",
      phonePlaceholder: "0912-345-678",
      email: "電子郵件",
      emailPlaceholder: "example@email.com",
      childAge: "孩子年齡",
      selectAge: "選擇年齡層",
      infant: "嬰兒 (0-12 個月)",
      toddler: "幼兒 (1-2 歲)",
      preschool: "學齡前 (3-5 歲)",
      preferredDate: "預約日期",
      message: "留言",
      messagePlaceholder: "有任何具體問題或需求嗎？",
      submit: "送出預約",
      submitting: "提交中...",
      successTitle: "已收到預約",
      successDesc: "謝謝！我們已收到您的參觀請求，將盡快與您聯繫確認。",
      bookAnother: "預約另一次參觀",
    },
  };

  const t = copy[locale] ?? copy.en;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Booking Data:", data);
    setIsSubmitting(false);
    setIsSuccess(true);
    reset();
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl bg-green-50 p-8 text-center border border-green-100">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-serif font-semibold text-green-900">{t.successTitle}</h3>
        <p className="text-green-700">
          {t.successDesc}
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-6 text-sm font-medium text-green-800 underline hover:text-green-900"
        >
          {t.bookAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl bg-white p-8 shadow-xl shadow-stone-200/40 border border-stone-100">
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-semibold text-stone-900">{t.formTitle}</h2>
        <p className="text-stone-500">{t.formDesc}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">{t.parentName}</label>
          <input
            {...register("parentName")}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-stone-900 outline-none transition-all focus:border-[#73BBD1] focus:ring-2 focus:ring-[#73BBD1]/20"
            placeholder={t.parentNamePlaceholder}
          />
          {errors.parentName && <p className="text-xs text-red-500">{errors.parentName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">{t.phone}</label>
          <input
            {...register("phone")}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-stone-900 outline-none transition-all focus:border-[#73BBD1] focus:ring-2 focus:ring-[#73BBD1]/20"
            placeholder={t.phonePlaceholder}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">{t.email}</label>
        <input
          {...register("email")}
          type="email"
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-stone-900 outline-none transition-all focus:border-[#73BBD1] focus:ring-2 focus:ring-[#73BBD1]/20"
          placeholder={t.emailPlaceholder}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">{t.childAge}</label>
          <select
            {...register("childAge")}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-stone-900 outline-none transition-all focus:border-[#73BBD1] focus:ring-2 focus:ring-[#73BBD1]/20"
          >
            <option value="">{t.selectAge}</option>
            <option value="infant">{t.infant}</option>
            <option value="toddler">{t.toddler}</option>
            <option value="preschool">{t.preschool}</option>
          </select>
          {errors.childAge && <p className="text-xs text-red-500">{errors.childAge.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">{t.preferredDate}</label>
          <input
            {...register("preferredDate")}
            type="date"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-stone-900 outline-none transition-all focus:border-[#73BBD1] focus:ring-2 focus:ring-[#73BBD1]/20"
          />
          {errors.preferredDate && <p className="text-xs text-red-500">{errors.preferredDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">{t.message}</label>
        <textarea
          {...register("message")}
          rows={3}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-stone-900 outline-none transition-all focus:border-[#73BBD1] focus:ring-2 focus:ring-[#73BBD1]/20"
          placeholder={t.messagePlaceholder}
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-lg bg-[#0F3B4C] px-6 py-3 font-medium text-white transition-colors hover:bg-[#134E63] disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t.submitting}
          </>
        ) : (
          t.submit
        )}
      </button>
    </form>
  );
}
