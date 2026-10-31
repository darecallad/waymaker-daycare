/**
 * next/image loader for pre-generated photos (no runtime image optimisation).
 *
 * `scripts/optimize-photos.mjs` writes `<name>-<width>.webp` (PHOTO_WIDTHS) next to every photo master
 * (`<name>.jpg`). This maps each width next/image asks for to the smallest generated file that
 * is at least that wide, so the browser picks from a real `srcset`. Anything else (SVG logos,
 * transparent PNGs, external URLs) is returned untouched.
 */
export const PHOTO_WIDTHS = [640, 960, 1280, 1920] as const;

const PHOTO = /^\/(?:partners\/.+|home-hero)\.jpe?g$/;

export function photoVariant(src: string, width: number): string {
  if (!PHOTO.test(src)) return src;
  const size = PHOTO_WIDTHS.find((w) => w >= width) ?? PHOTO_WIDTHS[PHOTO_WIDTHS.length - 1];
  return src.replace(/\.jpe?g$/, `-${size}.webp`);
}

export default function photoLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  return photoVariant(src, width);
}
