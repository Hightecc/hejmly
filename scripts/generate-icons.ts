#!/usr/bin/env bun
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { composeIcon, encodeIco } from "./icons.ts";

const rasterize = (svg: string, size: number, opaque = false): Promise<Buffer> => {
  const pipeline = sharp(Buffer.from(svg)).resize(size, size);
  return (opaque ? pipeline.flatten({ background: "#0f172a" }) : pipeline)
    .png({ compressionLevel: 9 })
    .toBuffer();
};

const publicDir = resolve(import.meta.dirname, "../apps/web/public");
const iconsDir = resolve(publicDir, "icons");
mkdirSync(iconsDir, { recursive: true });

const rounded = composeIcon({ rounded: true, glyphPct: 58 });
const apple = composeIcon({ rounded: false, glyphPct: 62 });
const maskable = composeIcon({ rounded: false, glyphPct: 52 });

writeFileSync(resolve(publicDir, "favicon.svg"), rounded);

const [ico16, ico32, ico48] = await Promise.all([
  rasterize(rounded, 16),
  rasterize(rounded, 32),
  rasterize(rounded, 48),
]);
writeFileSync(
  resolve(publicDir, "favicon.ico"),
  encodeIco([
    { size: 16, data: ico16 },
    { size: 32, data: ico32 },
    { size: 48, data: ico48 },
  ]),
);

writeFileSync(resolve(publicDir, "apple-touch-icon.png"), await rasterize(apple, 180, true));
writeFileSync(resolve(iconsDir, "icon-192.png"), await rasterize(rounded, 192));
writeFileSync(resolve(iconsDir, "icon-512.png"), await rasterize(rounded, 512));
writeFileSync(resolve(iconsDir, "icon-maskable.png"), await rasterize(maskable, 512));

console.info("Generated favicon.svg, favicon.ico, apple-touch-icon.png, and PWA icons.");
