/**
 * Parent FAQ. Every answer must be verifiable from the site itself (partner
 * data, booking flow, contact details). No pricing, availability promises or
 * claims we cannot back up -- these answers are quoted verbatim by search and
 * AI engines via FAQPage JSON-LD.
 */
import { CONTACT } from "@/lib/site";
import { BOOKING_WINDOW_DAYS } from "@/lib/tour-slots";

export interface FaqItem {
  question: string;
  answer: string;
}

type Locale = "en" | "zh";

export function getFaq(locale: Locale, cities: string[]): FaqItem[] {
  const cityList = cities.join(", ");

  if (locale === "zh") {
    return [
      {
        question: "Waymaker Daycare 是什麼？",
        answer:
          "Waymaker Daycare 協助灣區家庭尋找合格的持照幼兒園，並直接在網站上預約實地參觀。網站提供英文和中文兩種語言。",
      },
      {
        question: "合作的幼兒園都有執照嗎？",
        answer:
          "有。每一家合作幼兒園都有加州的托育執照，執照號碼會顯示在該園所的介紹頁面上，方便您自行查證。",
      },
      {
        question: "合作幼兒園位於哪些城市？",
        answer: `目前合作的幼兒園位於 ${cityList}。您可以在「合作幼兒園」頁面依城市或名稱搜尋。`,
      },
      {
        question: "要怎麼預約參觀？",
        answer: `在「預約參觀」頁面選擇幼兒園和日期，填寫聯絡資料後送出即可。可預約的日期為未來 ${BOOKING_WINDOW_DAYS} 天內，每家園所的參觀時段不同。送出後我們會與您聯絡確認。`,
      },
      {
        question: "參觀時可以用中文溝通嗎？",
        answer: "可以。預約時可以選擇偏好語言：英文、中文，或兩者皆可。",
      },
      {
        question: "學費是多少？",
        answer: `學費依園所和孩子的年齡而不同。請在參觀時直接詢問園所，或寄信到 ${CONTACT.email}、致電 ${CONTACT.phone} 與我們聯絡。`,
      },
    ];
  }

  return [
    {
      question: "What is Waymaker Daycare?",
      answer:
        "Waymaker Daycare helps Bay Area families find licensed daycares and book in-person tours directly on this website. The site is available in English and Chinese.",
    },
    {
      question: "Are the partner daycares licensed?",
      answer:
        "Yes. Every partner daycare holds a California child care license, and the license number is listed on each daycare's page so you can verify it yourself.",
    },
    {
      question: "Which cities are the partner daycares in?",
      answer: `Partner daycares are currently located in ${cityList}. You can search by city or name on the Our Partners page.`,
    },
    {
      question: "How do I book a daycare tour?",
      answer: `Open the Book a Tour page, choose a daycare and a date, and submit your contact details. Dates are available up to ${BOOKING_WINDOW_DAYS} days ahead, and each daycare has its own tour hours. We will contact you to confirm.`,
    },
    {
      question: "Can I tour a daycare in Chinese?",
      answer: "Yes. When you book, you can choose English, Chinese (Mandarin), or either as your preferred language.",
    },
    {
      question: "How much does daycare cost?",
      answer: `Tuition depends on the daycare and your child's age. Ask the daycare during your tour, or contact us at ${CONTACT.email} or ${CONTACT.phone}.`,
    },
  ];
}
