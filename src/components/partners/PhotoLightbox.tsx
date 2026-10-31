"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PartnerDetailCopy } from "@/components/partners/partner-detail-copy";

interface PhotoLightboxProps {
  images: string[];
  start: number;
  alt: (index: number) => string;
  label: string;
  t: PartnerDetailCopy;
  /** Called on Esc / close button / backdrop; the caller restores focus to its trigger. */
  onClose: () => void;
}

const SWIPE_MIN = 40;
const navButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-white";

/** Native modal <dialog>: focus trap, Esc and inert background come from the browser. */
export function PhotoLightbox({ images, start, alt, label, t, onClose }: PhotoLightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const [index, setIndex] = useState(start);
  const go = (step: number) => setIndex((i) => (i + step + images.length) % images.length);

  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    return () => el?.close();
  }, []);

  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) >= SWIPE_MIN) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <dialog
      ref={dialog}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-3">
          <p aria-live="polite" className="px-2 text-sm font-bold">
            {index + 1} / {images.length}
          </p>
          <button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label={t.close} className={navButton}>
            <X aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="relative min-h-0 flex-1">
          <Image key={images[index]} src={images[index]} alt={alt(index)} fill sizes="100vw" className="object-contain" />
        </div>
        {images.length > 1 && (
          <div className="flex justify-center gap-4 p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
            <button type="button" onClick={() => go(-1)} aria-label={t.previousPhoto} className={navButton}>
              <ChevronLeft aria-hidden="true" className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={t.nextPhoto} className={navButton}>
              <ChevronRight aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
