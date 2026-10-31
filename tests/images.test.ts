import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { partners } from "@/data/partners";
import photoLoader, { PHOTO_WIDTHS, photoVariant } from "@/lib/image-loader";
import nextConfig from "../next.config";

const photos = ["/home-hero.jpg", ...partners.flatMap((p) => p.images)];
const file = (url: string) => `public${url}`;

/** Does a JPEG/WebP carry EXIF with a GPS IFD? Checks the raw bytes for the EXIF + GPS tag. */
function hasGps(path: string): boolean {
  const bytes = readFileSync(path);
  const exif = bytes.indexOf("Exif\0\0");
  if (exif < 0) return false;
  const tiff = exif + 6;
  const le = bytes.toString("ascii", tiff, tiff + 2) === "II";
  const u16 = (p: number) => (le ? bytes.readUInt16LE(tiff + p) : bytes.readUInt16BE(tiff + p));
  const ifd0 = le ? bytes.readUInt32LE(tiff + 4) : bytes.readUInt32BE(tiff + 4);
  for (let i = 0; i < u16(ifd0); i++) if (u16(ifd0 + 2 + i * 12) === 0x8825) return true;
  return false;
}

test("every photo is a JPEG master with all three WebP sizes", () => {
  for (const url of photos) {
    assert.match(url, /\.jpg$/, `${url} should be a .jpg master`);
    assert.ok(existsSync(file(url)), `${url} exists`);
    for (const w of PHOTO_WIDTHS) assert.ok(existsSync(file(url.replace(/\.jpg$/, `-${w}.webp`))), `${url} @${w}`);
  }
});

test("no photo carries GPS location", () => {
  for (const url of photos) {
    assert.equal(hasGps(file(url)), false, `${url} has GPS`);
    for (const w of PHOTO_WIDTHS) assert.equal(hasGps(file(url.replace(/\.jpg$/, `-${w}.webp`))), false);
  }
});

test("phone-sized variants stay light: every 640 / 960 px WebP is at most 300 KB", () => {
  for (const url of photos) {
    for (const w of [640, 960]) {
      const size = statSync(file(url.replace(/\.jpg$/, `-${w}.webp`))).size;
      assert.ok(size <= 300_000, `${url} @${w} is ${Math.round(size / 1000)} KB`);
    }
  }
});

test("masters are at most 2400 px on the long edge", async () => {
  const { default: sharp } = await import("sharp");
  for (const url of photos) {
    const { width = 0, height = 0 } = await sharp(file(url)).metadata();
    assert.ok(Math.max(width, height) <= 2400, `${url} is ${width}x${height}`);
  }
});

test("loader picks the smallest generated file at least as wide as requested", () => {
  assert.equal(photoVariant("/partners/2904/IMG_3026.jpg", 390), "/partners/2904/IMG_3026-640.webp");
  assert.equal(photoVariant("/partners/2904/IMG_3026.jpg", 640), "/partners/2904/IMG_3026-640.webp");
  assert.equal(photoVariant("/partners/2904/IMG_3026.jpg", 828), "/partners/2904/IMG_3026-960.webp");
  assert.equal(photoVariant("/partners/2904/IMG_3026.jpg", 1080), "/partners/2904/IMG_3026-1280.webp");
  assert.equal(photoVariant("/home-hero.jpg", 3840), "/home-hero-1920.webp");
  assert.equal(photoLoader({ src: "/partners/962/1.jpg", width: 1280 }), "/partners/962/1-1280.webp");
});

test("loader leaves logos and other assets untouched", () => {
  assert.equal(photoVariant("/partners/dodokids.svg", 640), "/partners/dodokids.svg");
  assert.equal(photoVariant("/waymaker-logo.svg", 1920), "/waymaker-logo.svg");
  assert.equal(photoVariant("/partners/sunny-logomark.png", 640), "/partners/sunny-logomark.png");
});

test("next/image asks only for widths that exist on disk", () => {
  assert.equal(nextConfig.images?.loader, "custom");
  assert.deepEqual(nextConfig.images?.deviceSizes, [...PHOTO_WIDTHS]);
  assert.deepEqual(nextConfig.images?.imageSizes, []);
});
