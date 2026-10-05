import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Licensed Daycares in Sunnyvale & the Bay Area`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Find licensed daycares in Sunnyvale, Santa Clara and Newark, and book an in-person tour online in English or Chinese.",
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW"],
    images: [{ url: "/home-hero.jpg", alt: "Children doing an art project with a teacher at a daycare" }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  icons: {
    icon: "/favicon.svg",
  },
  verification: {
    google: "wqsmfv5CDzDhVmznMsZq5qhD-w-oSxBYQO3U4pMEazo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased text-stone-900 bg-white flex min-h-screen flex-col`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#0F3B4C] focus:px-5 focus:py-3 focus:text-white"
        >
          Skip to main content
        </a>
        <LanguageProvider>
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
