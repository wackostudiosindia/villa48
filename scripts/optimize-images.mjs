/*
  Turns the original photos and logos in images/ into small WebP files in several widths
  (client/public/img/<name>-<width>.<hash>.webp) and writes client/src/data/images.json,
  which the <Img> component uses to build srcset. Run after adding or replacing a photo:

    npm run images
*/
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'images';
const OUT = 'client/public/img';
const MANIFEST = 'client/src/data/images.json';
const PHOTO_WIDTHS = [480, 800, 1200, 1600];
const LOGO_WIDTHS = { icon: [96, 280], word: [300, 520] };
const CROP_WIDTHS = [400, 640, 960, 1280];
/* Pre-cropped versions for photos shown in fixed-shape frames (x/y = which part to keep, like object-position). */
const CROPS = {
  'exterior-hero': { from: 'exterior', aspect: 4 / 5, x: 0.44, y: 0.5 },
  'poollawn-square': { from: 'poollawn', aspect: 1, x: 0.14, y: 0.55 },
  'entrance-4x3': { from: 'entrance', aspect: 4 / 3, x: 0.5, y: 0.62 },
  'pool-4x3': { from: 'pool', aspect: 4 / 3, x: 0.5, y: 0.5 },
  'swing-4x3': { from: 'swing', aspect: 4 / 3, x: 0.5, y: 0.5 },
  'theatre-4x3': { from: 'theatre', aspect: 4 / 3, x: 0.5, y: 0.5 },
};

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const manifest = {};
for (const file of (await readdir(SRC)).sort()) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
  const name = path.basename(file, ext);
  const input = sharp(path.join(SRC, file));
  const { width, height } = await input.metadata();
  const isLogo = ext === '.png';
  const widths = (isLogo ? LOGO_WIDTHS[name.split('_')[0]] : PHOTO_WIDTHS).filter((w) => w <= width);
  if (!isLogo || !widths.length) widths.push(Math.min(width, isLogo ? 600 : 1600));
  const variants = [];
  for (const w of [...new Set(widths)].sort((a, b) => a - b)) {
    const buf = await sharp(path.join(SRC, file))
      .resize({ width: w })
      .webp(isLogo ? { quality: 90, alphaQuality: 100, effort: 6 } : { quality: 70, effort: 6, smartSubsample: true })
      .toBuffer();
    const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
    const out = `${name}-${w}.${hash}.webp`;
    await writeFile(path.join(OUT, out), buf);
    variants.push([`/img/${out}`, w, buf.length]);
  }
  manifest[name] = { width, height, variants: variants.map(([u, w]) => [u, w]) };
  console.log(name.padEnd(12), variants.map(([, w, b]) => `${w}w ${Math.round(b / 1024)}KB`).join('  '));
}
for (const [name, c] of Object.entries(CROPS)) {
  const file = (await readdir(SRC)).find((f) => path.basename(f, path.extname(f)) === c.from);
  const { width, height } = await sharp(path.join(SRC, file)).metadata();
  let cw = width, ch = height;
  if (width / height > c.aspect) cw = Math.round(height * c.aspect); else ch = Math.round(width / c.aspect);
  const region = { left: Math.round((width - cw) * c.x), top: Math.round((height - ch) * c.y), width: cw, height: ch };
  const variants = [];
  const cropWidths = CROP_WIDTHS.filter((w) => w < cw);
  cropWidths.push(Math.min(cw, 1280));
  for (const w of cropWidths) {
    const buf = await sharp(path.join(SRC, file)).extract(region).resize({ width: w }).webp({ quality: 70, effort: 6, smartSubsample: true }).toBuffer();
    const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
    const out = `${name}-${w}.${hash}.webp`;
    await writeFile(path.join(OUT, out), buf);
    variants.push([`/img/${out}`, w, buf.length]);
  }
  manifest[name] = { width: cw, height: ch, variants: variants.map(([u, w]) => [u, w]) };
  console.log(name.padEnd(16), variants.map(([, w, b]) => `${w}w ${Math.round(b / 1024)}KB`).join('  '));
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
