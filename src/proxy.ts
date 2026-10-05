import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, localizePath, routePath } from "@/lib/i18n";

/**
 * Maps public URLs onto the `app/[lang]` tree.
 *
 * - `/zh/...` is served as is: the Chinese site.
 * - `/en/...` redirects to the bare path, so English has exactly one URL per page.
 * - Anything else is English and is rewritten to `/en/...` without the visitor seeing it,
 *   so every URL that existed before the Chinese pages keeps working.
 *
 * A visitor who explicitly picked Chinese (the language toggle sets a cookie) is sent from
 * an English URL to its Chinese one. Crawlers never carry that cookie, so they always get
 * the page the URL names.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/zh" || pathname.startsWith("/zh/")) return NextResponse.next();

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(pathname, defaultLocale);
    return NextResponse.redirect(url, 308);
  }

  if (request.cookies.get(LOCALE_COOKIE)?.value === "zh") {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(pathname, "zh");
    return NextResponse.redirect(url, 307);
  }

  const url = request.nextUrl.clone();
  url.pathname = routePath(pathname, defaultLocale);
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except the dashboard, booking links from emails, APIs, Next internals and
  // files with an extension (images, robots.txt, sitemap.xml, llms.txt).
  matcher: ["/((?!api/|admin(?:/|$)|booking(?:/|$)|_next/|_vercel/|.*\\.[^/]+$).*)"],
};
