/**
 * Error codes returned by the public booking endpoints (`{ error, code }`).
 *
 * `error` stays in English for logs and older clients; the browser shows the message for
 * `code` in the page language, so the Chinese form never surfaces an English server string.
 */
export const BOOKING_ERROR = {
  RATE_LIMITED: "RATE_LIMITED",
  MISSING_FIELDS: "MISSING_FIELDS",
  NO_DAYCARE_OR_DATE: "NO_DAYCARE_OR_DATE",
  UNKNOWN_DAYCARE: "UNKNOWN_DAYCARE",
  DATE_UNAVAILABLE: "DATE_UNAVAILABLE",
  ALREADY_BOOKED: "ALREADY_BOOKED",
  FULLY_BOOKED: "FULLY_BOOKED",
  SERVER: "SERVER",
} as const;

export type BookingErrorCode = (typeof BOOKING_ERROR)[keyof typeof BOOKING_ERROR];

const MESSAGES: Record<BookingErrorCode, { en: string; zh: string }> = {
  RATE_LIMITED: {
    en: "Too many requests. Please try again later.",
    zh: "請求次數過多，請稍後再試。",
  },
  MISSING_FIELDS: {
    en: "Missing required fields",
    zh: "請填寫所有必填欄位。",
  },
  NO_DAYCARE_OR_DATE: {
    en: "Please choose a daycare and an available tour date.",
    zh: "請選擇幼兒園和可預約的參觀日期。",
  },
  UNKNOWN_DAYCARE: {
    en: "Unknown daycare.",
    zh: "找不到這間幼兒園，請重新選擇。",
  },
  DATE_UNAVAILABLE: {
    en: "This date is no longer available for tours. Please pick another date.",
    zh: "這個日期已無法預約參觀，請選擇其他日期。",
  },
  ALREADY_BOOKED: {
    en: "You already have a tour booked on this date. Please choose a different date.",
    zh: "您在這一天已經預約過參觀，請選擇其他日期。",
  },
  FULLY_BOOKED: {
    en: "This time slot is fully booked.",
    zh: "這個時段已額滿，請選擇其他日期。",
  },
  SERVER: {
    en: "Something went wrong. Please try again.",
    zh: "發生錯誤，請再試一次。",
  },
};

/** English message for a code, used as the `error` field of API responses. */
export function bookingErrorText(code: BookingErrorCode): string {
  return MESSAGES[code].en;
}

/** Message for an API response in the page language; unknown or missing codes fall back to SERVER. */
export function bookingErrorMessage(code: unknown, locale: "en" | "zh"): string {
  const known = typeof code === "string" && Object.hasOwn(MESSAGES, code) ? (code as BookingErrorCode) : BOOKING_ERROR.SERVER;
  return MESSAGES[known][locale];
}
