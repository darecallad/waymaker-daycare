import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RootDocument } from "@/components/layout/RootDocument";
import { LanguageProvider } from "@/context/LanguageContext";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Personal booking links (e.g. /booking/cancel?id=...) must stay out of search results.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Manage Your Tour", template: `%s | ${SITE_NAME}` },
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

/**
 * Root layout for links sent in booking emails. These URLs are already in parents'
 * inboxes, so they stay where they are (no language segment) and render in English.
 */
export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument locale="en">
      <LanguageProvider locale="en">
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </LanguageProvider>
    </RootDocument>
  );
}
