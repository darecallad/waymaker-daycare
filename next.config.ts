import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Option B (owner decision): no Vercel image optimisation. Photos are pre-generated as WebP by
  // scripts/optimize-photos.mjs and src/lib/image-loader.ts maps each srcset width to a file.
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [640, 960, 1280, 1920], // = PHOTO_WIDTHS, so every srcset entry is a real file
    imageSizes: [],
  },
};

export default nextConfig;
