/**
 * Client-side checks for the tour form, kept pure so they can be unit-tested.
 * The server still validates everything (`/api/contact`); this only gives inline messages.
 */
export type TourField = "daycare" | "date" | "name" | "phone" | "email" | "childAge";
export type TourErrors = Partial<Record<TourField, string>>;

export interface TourValues {
  daycare: string;
  date: string;
  name: string;
  phone: string;
  email: string;
  childAge: string;
}

interface Messages {
  required: string;
  email: string;
  daycare: string;
  date: string;
}

/** Same rule as `<input type="email">`: something@something.tld, no spaces. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Field order is the visual order, so the first key is where focus should go. */
export function validateTour(values: TourValues, m: Messages): TourErrors {
  const errors: TourErrors = {};
  if (!values.daycare) errors.daycare = m.daycare;
  if (!values.date) errors.date = m.date;
  for (const field of ["name", "phone", "email", "childAge"] as const) {
    if (!values[field].trim()) errors[field] = m.required;
  }
  if (!errors.email && !EMAIL.test(values.email.trim())) errors.email = m.email;
  return errors;
}

/** Body for POST /api/contact. Unchanged payload; Notes is optional so it may be empty. */
export function buildTourMessage(v: {
  childAge: string;
  daycareName?: string;
  date: string;
  time: string;
  language: string;
  notes: string;
}): string {
  return `
        Daycare Tour Request
        --------------------
        Child's Age: ${v.childAge}
        Preferred Daycare: ${v.daycareName || "Not Selected"}
        Preferred Date: ${v.date}
        Time: ${v.time}
        Preferred Language: ${v.language}
        Notes: ${v.notes.trim() || "-"}
      `;
}
