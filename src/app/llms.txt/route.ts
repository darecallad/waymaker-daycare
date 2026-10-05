import { partners } from "@/data/partners";
import { PATH_ROUTES, PRICING, TIMELINE_ROUTE, TRACK_RECORD, formatUsd } from "@/data/consulting";
import { CONTACT, SITE_NAME, absoluteUrl, cityName, parseAddress, partnerCities } from "@/lib/site";
import { BOOKING_WINDOW_DAYS } from "@/lib/tour-slots";

// Plain-text site summary for AI assistants (https://llmstxt.org). Generated from
// the same data as the pages so the facts can never drift.
export const dynamic = "force-static";

export function GET() {
  const cities = partnerCities().map(({ city }) => city).join(", ");
  const partnerLines = partners
    .map((p) => `- [${p.name}](${absoluteUrl(`/partners/${p.slug}`)}): ${parseAddress(p.address).addressLocality}, CA. License #${p.license}. Tours: ${p.tourHours}.`)
    .join("\n");
  const partnersZh = partners
    .map((p) => `- [${p.name_zh ?? p.name}](${absoluteUrl(`/zh/partners/${p.slug}`)})：${cityName(parseAddress(p.address).addressLocality, "zh")}，加州執照 ${p.license}。`)
    .join("\n");

  const body = `# ${SITE_NAME}

> ${SITE_NAME} (${absoluteUrl("/")}) helps Bay Area families find state-licensed daycares and book in-person tours online. The site is available in English and Traditional Chinese.

## Key pages

- [Our partner daycares](${absoluteUrl("/partners")}): photos, address, California license number and tour hours for every partner.
- [Book a tour](${absoluteUrl("/book-tour")}): choose a daycare and an open date in the next ${BOOKING_WINDOW_DAYS} days.
- [Daycare consulting for providers](${absoluteUrl("/for-providers")}): bilingual (English/Chinese) help opening or growing a licensed daycare in California. Waymaker works with ${TRACK_RECORD.daycaresWorkedWith}+ Bay Area daycares. Licensing outcomes are not guaranteed; licenses are issued by the California Community Care Licensing Division.
  - [Family daycare (family child care home)](${absoluteUrl(PATH_ROUTES.family)}): about 6-12 children in the licensee's own home. ${formatUsd(PRICING.family.monthly)} per month.
  - [Child care center](${absoluteUrl(PATH_ROUTES.center)}): 12+ children at a non-residential site. ${formatUsd(PRICING.center.monthly)} per month.
  - [Licensing timeline](${absoluteUrl(TIMELINE_ROUTE)}): step-by-step California licensing process with official CDSS sources; estimated about 3-6 months (family) and 6-12+ months (center).

## Facts

- Partner daycares are located in ${cities}, California.
- Each partner page lists its California child care license number.
- Tours can be requested in English, Chinese (Mandarin), or either.
- Tuition is not published on this site; families ask the daycare during the tour or contact ${SITE_NAME}.

## Partner daycares

${partnerLines}

## 中文版 (Traditional Chinese)

The full site is also available in Traditional Chinese under ${absoluteUrl("/zh")}.

- [合作幼兒園](${absoluteUrl("/zh/partners")})：每家合作幼兒園的照片、地址、加州執照號碼與參觀時間。
- [預約參觀](${absoluteUrl("/zh/book-tour")})：選擇幼兒園與未來 ${BOOKING_WINDOW_DAYS} 天內的日期。
- [開園諮詢](${absoluteUrl("/zh/for-providers")})：中英雙語協助在加州開設或擴大持照幼兒園，已合作 ${TRACK_RECORD.daycaresWorkedWith} 家以上。
  - [家庭式托兒所](${absoluteUrl(`/zh${PATH_ROUTES.family}`)})：在自家約收 6–12 名孩子，每月 ${formatUsd(PRICING.family.monthly)}。
  - [托兒中心](${absoluteUrl(`/zh${PATH_ROUTES.center}`)})：12 名以上，每月 ${formatUsd(PRICING.center.monthly)}。
  - [執照時間表](${absoluteUrl(`/zh${TIMELINE_ROUTE}`)})：加州執照申請步驟與官方來源。
${partnersZh}

## Contact

- Email: ${CONTACT.email}
- Phone: ${CONTACT.phone}
- Office: ${CONTACT.streetAddress}, ${CONTACT.city}, ${CONTACT.region} ${CONTACT.postalCode}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
