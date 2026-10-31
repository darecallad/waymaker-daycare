import type { Partner } from "@/lib/types";
import { cityName, parseAddress } from "@/lib/site";

/** Daycare name, address and city in the page language (English when no translation). */
export function partnerText(partner: Partner, locale: "en" | "zh") {
  const zh = locale === "zh";
  const name = zh && partner.name_zh ? partner.name_zh : partner.name;
  return {
    name,
    shortName: zh ? name : name.replace(/\s+Daycare$/i, ""),
    address: zh && partner.address_zh ? partner.address_zh : partner.address,
    city: cityName(parseAddress(partner.address).addressLocality, locale),
  };
}

/**
 * Copy for /book-tour in both languages. Kept out of the page so tests can check that every
 * key exists in both locales and that the Chinese page has no stray English.
 */
export const bookTourCopy = {
  en: {
    title: "Schedule a Tour",
    subtitle: "Visit our partner daycares and find the perfect environment for your child.",
    sections: { tour: "Tour Details", parent: "Parent Information" },
    form: {
      name: "Parent's Name",
      phone: "Phone Number",
      email: "Email Address",
      childAge: "Child's Age",
      childAgePlaceholder: "e.g. 3 years old",
      location: "Select Daycare",
      date: "Select a Date",
      dateHint: "next 14 days",
      language: "Preferred Language",
      notes: "Additional Notes / Questions",
      optional: "(optional)",
      submit: "Request Tour",
      submitting: "Sending Request...",
      selectDaycarePlaceholder: "Choose a location...",
      change: "Change",
      license: "License #",
      noSlots: "No available slots for the next 2 weeks.",
      contactUs: "Contact us:",
      loadingSlots: "Loading available dates",
      selectDaycareFirst: "Please select a daycare above to see available times.",
      confirm: "We will contact you to confirm.",
      preferCall: "Prefer to call?",
    },
    errors: {
      required: "This field is required.",
      email: "Please enter a valid email address.",
      daycare: "Please choose a daycare.",
      date: "Please choose a date.",
    },
    summary: {
      title: "Your tour",
      empty: "Choose a daycare and date",
      daycare: "Daycare",
      date: "Date",
      address: "Address",
      questions: "Questions?",
    },
    success: {
      title: "Request Sent Successfully!",
      message:
        "Thank you for your interest. We have received your request and will contact you shortly to confirm your tour details.",
      requested: "Requested date",
      back: "Back to Daycares",
    },
    languages: { en: "English", zh: "Chinese (Mandarin)", both: "Both / Either" },
  },
  zh: {
    title: "預約參觀",
    subtitle: "參觀我們的合作幼兒園，為您的孩子尋找最適合的成長環境。",
    sections: { tour: "參觀詳情", parent: "家長資訊" },
    form: {
      name: "家長姓名",
      phone: "聯絡電話",
      email: "電子郵件",
      childAge: "孩子年齡",
      childAgePlaceholder: "例如：3 歲",
      location: "選擇幼兒園",
      date: "選擇日期",
      dateHint: "未來 14 天",
      language: "偏好語言",
      notes: "備註 / 問題",
      optional: "（選填）",
      submit: "預約參觀",
      submitting: "發送中...",
      selectDaycarePlaceholder: "選擇地點...",
      change: "更換",
      license: "執照號碼 #",
      noSlots: "未來兩週暫無可預約時段。",
      contactUs: "聯絡我們：",
      loadingSlots: "正在載入可預約日期",
      selectDaycareFirst: "請先選擇上方的幼兒園以查看可預約時間。",
      confirm: "我們會與您聯絡確認。",
      preferCall: "想直接打電話？",
    },
    errors: {
      required: "此欄位為必填。",
      email: "請輸入有效的電子郵件地址。",
      daycare: "請選擇幼兒園。",
      date: "請選擇參觀日期。",
    },
    summary: {
      title: "您的參觀",
      empty: "請選擇幼兒園和日期",
      daycare: "幼兒園",
      date: "日期",
      address: "地址",
      questions: "有問題嗎？",
    },
    success: {
      title: "預約已發送！",
      message: "感謝您的預約。我們已收到您的請求，將盡快與您聯繫確認參觀細節。",
      requested: "預約日期",
      back: "返回幼兒園列表",
    },
    languages: { en: "英文", zh: "中文 (普通話)", both: "皆可" },
  },
} as const;

export type BookTourCopy = (typeof bookTourCopy)[keyof typeof bookTourCopy];
