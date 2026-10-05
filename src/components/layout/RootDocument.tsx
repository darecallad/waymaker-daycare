import { Inter, Playfair_Display } from "next/font/google";
import { HTML_LANG, type Locale } from "@/lib/i18n";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

/**
 * The `<html>` shell shared by the site's root layouts.
 *
 * The public site (`app/[lang]`) and the private pages (`app/admin`, `app/booking`) are
 * separate root layouts so `<html lang>` comes from the URL on the server: a single root
 * layout above them could not see the `[lang]` segment.
 */
export function RootDocument({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={HTML_LANG[locale]}>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased text-stone-900 bg-white flex min-h-screen flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
