import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Daycare Tour in Sunnyvale, Santa Clara & Newark",
  description:
    "Schedule an in-person tour at a licensed Bay Area daycare. Choose a daycare, pick an open date in the next two weeks, and tour in English or Chinese.",
  alternates: { canonical: "/book-tour" },
  openGraph: {
    title: "Book a Daycare Tour | Waymaker Daycare",
    description: "Pick a licensed Bay Area daycare and an open date, then visit in person.",
    url: "/book-tour",
  },
};

export default function BookTourLayout({ children }: { children: React.ReactNode }) {
  return children;
}
