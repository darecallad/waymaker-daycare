import { Inter, Noto_Sans_TC, Playfair_Display } from "next/font/google";
import { HTML_LANG, type Locale } from "@/lib/i18n";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
/**
 * Chinese glyphs for both stacks (Inter / Playfair have none, so headings fell back to a
 * Ming/Song serif on Windows). Not preloaded: Google serves it in unicode-range slices and the
 * browser fetches only the slices a page actually uses.
 */
const notoTC = Noto_Sans_TC({ weight: ["400", "700"], variable: "--font-cjk", display: "swap", preload: false });

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
        className={`${inter.variable} ${playfair.variable} ${notoTC.variable} font-sans antialiased text-stone-900 bg-white flex min-h-screen flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
