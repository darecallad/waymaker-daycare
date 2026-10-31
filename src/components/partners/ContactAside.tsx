import type { ReactNode } from "react";
import Link from "@/components/ui/link";
import { ArrowUpRight, Star } from "lucide-react";
import type { Partner } from "@/lib/types";
import { mapsUrl, telHref } from "@/lib/partner-detail";
import type { PartnerDetailCopy } from "@/components/partners/partner-detail-copy";

export const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-[#0F3B4C] px-8 font-bold text-white hover:bg-[#134E63] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0F6C8C]";
export const textLink =
  "font-semibold text-[#0F6C8C] underline underline-offset-2 hover:text-[#0F3B4C] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0F6C8C]";

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <dt className="text-[13px] font-bold uppercase tracking-[.05em] text-[#57534E]">{label}</dt>
      <dd className="mt-0.5 font-semibold text-[#1C1917]">{children}</dd>
    </div>
  );
}

interface ContactAsideProps {
  partner: Partner;
  address: string;
  t: PartnerDetailCopy;
}

export function ContactAside({ partner, address, t }: ContactAsideProps) {
  return (
    <aside
      aria-labelledby="contact-heading"
      className="mt-10 self-start rounded-3xl border border-[#E7E5E4] bg-white p-6 shadow-[0_12px_32px_-20px_rgba(15,59,76,0.35)] lg:sticky lg:top-[120px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0"
    >
      <h2 id="contact-heading" className="mb-4 font-serif text-[22px] font-bold text-[#0F3B4C]">
        {t.contactInfo}
      </h2>
      <dl>
        {partner.owner && <Item label={t.owner}>{partner.owner}</Item>}
        {partner.ownerPhone && (
          <Item label={t.ownerPhone}>
            <a href={telHref(partner.ownerPhone)} className={textLink}>{partner.ownerPhone}</a>
          </Item>
        )}
        {partner.ownerEmail && (
          <Item label={t.ownerEmail}>
            <a href={`mailto:${partner.ownerEmail}`} className={`${textLink} break-all`}>{partner.ownerEmail}</a>
          </Item>
        )}
        <Item label={t.location}>
          <span className="block leading-snug">{address}</span>
          <a href={mapsUrl(partner.address)} target="_blank" rel="noopener noreferrer" className={`${textLink} mt-1 inline-flex min-h-11 items-center gap-1 text-sm`}>
            {t.openMaps}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">{t.newTab}</span>
          </a>
        </Item>
      </dl>

      <Link href={`/book-tour?partner=${partner.slug}`} className={`${primaryButton} mt-5 h-12 w-full`}>
        {t.bookTour}
      </Link>

      {partner.googleReviewUrl && (
        <section aria-labelledby="reviews-heading" className="mt-6 border-t border-[#E7E5E4] pt-5">
          <h3 id="reviews-heading" className="flex items-center gap-2 font-bold text-[#0F3B4C]">
            <Star aria-hidden="true" className="h-5 w-5 fill-[#B45309] text-[#B45309]" />
            {t.reviews}
          </h3>
          <p className="mt-1.5 text-[15px] text-[#57534E]">{t.reviewsDesc}</p>
          <a href={partner.googleReviewUrl} target="_blank" rel="noopener noreferrer" className={`${textLink} mt-1 inline-flex min-h-11 items-center gap-1`}>
            {t.readReviews}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">{t.newTab}</span>
          </a>
        </section>
      )}
    </aside>
  );
}
