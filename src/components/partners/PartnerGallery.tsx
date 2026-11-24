"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoLightbox } from "@/components/partners/PhotoLightbox";
import type { PartnerDetailCopy } from "@/components/partners/partner-detail-copy";

/** Desktop grid shows at most this many; the rest are in the carousel and lightbox. */
const GRID_MAX = 4;

/** Desktop grid per photo count (SPEC: 1 -> full width, 2/3 -> 2fr 1fr, 4 -> 2fr 1fr 1fr). */
const GRID = {
  1: { grid: "md:grid-cols-1 md:grid-rows-1", cells: [""], sizes: ["1200px"] },
  2: { grid: "md:grid-cols-[2fr_1fr] md:grid-rows-1", cells: ["", ""], sizes: ["760px", "400px"] },
  3: { grid: "md:grid-cols-[2fr_1fr] md:grid-rows-2", cells: ["md:row-span-2", "", ""], sizes: ["760px", "400px", "400px"] },
  4: { grid: "md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2", cells: ["md:row-span-2", "", "", "md:col-span-2"], sizes: ["600px", "300px", "300px", "600px"] },
} as const;

interface PartnerGalleryProps {
  images: string[];
  name: string;
  t: PartnerDetailCopy;
}

export function PartnerGallery({ images, name, t }: PartnerGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center bg-stone-100 text-text-2 md:rounded-[20px]">
        <p className="flex flex-col items-center gap-3 font-medium">
          <ImageIcon aria-hidden="true" className="h-10 w-10" />
          {t.photoComingSoon}
        </p>
      </div>
    );
  }

  const layout = GRID[Math.min(images.length, GRID_MAX) as keyof typeof GRID];
  const show = (index: number, from: HTMLElement) => {
    trigger.current = from;
    setOpen(index);
  };
  const alt = (index: number) => t.photoAlt(name, index + 1, images.length);

  return (
    <div className="relative">
      <ul
        aria-label={t.photoGallery}
        onScroll={(e) => setCurrent(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className={cn(
          "flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:grid md:aspect-auto md:h-[460px] md:gap-2 md:overflow-hidden md:rounded-[20px]",
          layout.grid,
        )}
      >
        {images.map((src, index) => (
          <li
            key={src}
            className={cn("relative w-full shrink-0 snap-center", index >= GRID_MAX ? "md:hidden" : layout.cells[index])}
          >
            <button
              type="button"
              onClick={(e) => show(index, e.currentTarget)}
              className="group relative block h-full w-full overflow-hidden bg-line focus-visible:-outline-offset-[3px]"
            >
              <Image
                src={src}
                alt={alt(index)}
                fill
                priority={index === 0}
                sizes={`(max-width: 767px) 100vw, ${layout.sizes[Math.min(index, GRID_MAX - 1)] ?? "300px"}`}
                className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      {images.length > 1 && (
        <>
          <p aria-hidden="true" className="absolute bottom-3 right-3 rounded-full bg-black/[.62] px-2.5 py-1 text-[13px] font-bold text-white md:hidden">
            {current + 1} / {images.length}
          </p>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-3.5 flex justify-center gap-1.5 md:hidden">
            {images.map((src, index) => (
              <i key={src} className={cn("h-2 w-2 rounded-full", index === current ? "bg-white" : "bg-white/60")} />
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => show(0, e.currentTarget)}
            className="absolute bottom-4 right-4 hidden min-h-11 items-center rounded-full bg-white px-4 text-sm font-bold text-ink shadow-[0_8px_24px_-12px_rgba(15,59,76,0.45)] md:inline-flex"
          >
            {t.viewAll(images.length)}
          </button>
        </>
      )}

      {open !== null && (
        <PhotoLightbox
          images={images}
          start={open}
          alt={alt}
          t={t}
          label={t.photosDialog(name)}
          onClose={() => {
            setOpen(null);
            trigger.current?.focus();
          }}
        />
      )}
    </div>
  );
}
