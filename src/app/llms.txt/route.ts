import { partners } from "@/data/partners";
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
${partnersZh}

## Contact

- Email: ${CONTACT.email}
- Phone: ${CONTACT.phone}
- Office: ${CONTACT.streetAddress}, ${CONTACT.city}, ${CONTACT.region} ${CONTACT.postalCode}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
