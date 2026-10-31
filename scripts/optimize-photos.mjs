/**
 * One-off photo pipeline (not part of the build): `node scripts/optimize-photos.mjs`
 *
 * For every photo in public/partners/** and public/home-hero.jpg:
 *   - master JPEG <name>.jpg: long edge <= 2400 px, EXIF orientation baked in, ALL metadata
 *     dropped (GPS included: these are home daycares). Written only when needed (not yet a JPEG,
 *     carries metadata, or too large), so re-running never re-compresses a finished master.
 *   - responsive WebP <name>-<w>.webp for every width in WIDTHS. Quality starts at 75 and steps
 *     down (never below 55) only for very detailed photos that would exceed MAX_BYTES; the 1920
 *     size (large desktop screens only) is exempt. Missing sizes are filled in.
 * Never upscales. Transparent images (logos) are left alone.
 *
 * sharp ships with Next.js, so there is nothing extra to install. HEIC files (some iPhone photos
 * were saved with a .png name, which only Safari can display) are decoded with macOS `sips`
 * first, because sharp's prebuilt binary cannot decode HEVC.
 * Keep the untouched originals outside the repo before running.
 *
 * WIDTHS must match PHOTO_WIDTHS in src/lib/image-loader.ts (tests/images.test.ts checks this).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, parse } from "node:path";
import sharp from "sharp";

const MASTER_MAX = 2400;
const WIDTHS = [640, 960, 1280, 1920];
const MAX_BYTES = 300_000; // SPEC §F: any image <= 300 KB
const QUALITIES = [75, 70, 65, 60, 55];

/** WebP at the highest quality in QUALITIES that fits MAX_BYTES (or the lowest one if none fit). */
async function webp(master, width, capped) {
  for (const quality of QUALITIES) {
    const buffer = await sharp(master).resize({ width }).webp({ quality, effort: 6 }).toBuffer();
    if (!capped || buffer.length <= MAX_BYTES || quality === QUALITIES.at(-1)) return { buffer, quality };
  }
}
const ROOTS = ["public/partners", "public/home-hero.jpg"];

/** Path sharp can decode: HEIC goes through a lossless temp PNG (its EXIF is dropped below). */
async function decodable(file) {
  if ((await sharp(file).metadata()).format !== "heif") return file;
  const png = join(tmpdir(), `${parse(file).name}-${process.pid}.png`);
  execFileSync("sips", ["-s", "format", "png", file, "--out", png], { stdio: "ignore" });
  return png;
}

/** Writes <dir>/<name>.jpg from `file` when it is not already a clean master; returns its path. */
async function ensureMaster(file) {
  const { dir, name, ext } = parse(file);
  const master = join(dir, `${name}.jpg`);
  const meta = await sharp(file).metadata().catch(() => ({ format: "heif" }));
  const clean = ext === ".jpg" && meta.format === "jpeg" && !meta.exif && !meta.xmp && !meta.iptc
    && Math.max(meta.width, meta.height) <= MASTER_MAX;
  if (clean) return master;

  const input = await decodable(file);
  await sharp(input)
    .rotate()
    .resize({ width: MASTER_MAX, height: MASTER_MAX, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(`${master}.tmp`);
  rmSync(file);
  if (input !== file) rmSync(input);
  renameSync(`${master}.tmp`, master);
  console.log(`master ${String(Math.round(statSync(master).size / 1e3)).padStart(5)} KB  ${master}`);
  return master;
}

const photos = [];
const walk = (path) => {
  if (statSync(path).isDirectory()) readdirSync(path).forEach((f) => walk(join(path, f)));
  else if (/\.(png|jpe?g)$/i.test(path)) photos.push(path);
};
ROOTS.forEach(walk);

for (const file of photos) {
  const input = await decodable(file);
  const { hasAlpha } = await sharp(input).metadata();
  const transparent = hasAlpha && !(await sharp(input).stats()).isOpaque;
  if (input !== file) rmSync(input);
  if (transparent) {
    console.log(`skip (transparent graphic)  ${file}`);
    continue;
  }

  const master = await ensureMaster(file);
  const { dir, name } = parse(master);
  const { width } = await sharp(master).metadata();
  for (const w of WIDTHS) {
    const out = join(dir, `${name}-${w}.webp`);
    if (existsSync(out)) continue;
    const { buffer, quality } = await webp(master, Math.min(w, width), w < 1920);
    writeFileSync(out, buffer);
    console.log(`webp   ${String(Math.round(buffer.length / 1e3)).padStart(5)} KB q${quality}  ${out}`);
  }
}
