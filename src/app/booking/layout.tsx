import type { Metadata } from "next";

// Personal booking links (e.g. /booking/cancel?id=...) must stay out of search results.
export const metadata: Metadata = {
  title: "Manage Your Tour",
  robots: { index: false, follow: false },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
