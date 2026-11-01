/*
  Turns the original photos and logos in images/ into small files in several widths and writes
  client/src/data/images.json, which the <Img> component uses to build <picture> sources:

    photos: AVIF (smallest) + WebP fallback      client/public/img/<name>-<width>.<hash>.avif|webp
    logos:  WebP with transparency

  Framed photos also get pre-cropped versions (CROPS), so phones don't download pixels that are cut off.
  Run after adding or replacing a photo:

    npm run images
*/
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'images';
const OUT = 'client/public/img';
const MANIFEST = 'client/src/data/images.json';
const PHOTO_WIDTHS = [480, 720, 1080, 1600];
const CROP_WIDTHS = [400, 560, 720, 960, 1280];
const LOGO_WIDTHS = { icon: [96, 280], word: [300, 520] };
const WEBP = { quality: 66, effort: 6, smartSubsample: true };
const AVIF = { quality: 54, effort: 5 };

/* Pre-cropped versions for photos shown in fixed-shape frames (x/y = which part to keep, like object-position). */
const CROPS = {
  'exterior-hero': { from: 'exterior', aspect: 4 / 5, x: 0.44, y: 0.5 },
  'poollawn-square': { from: 'poollawn', aspect: 1, x: 0.14, y: 0.55 },
  'entrance-4x3': { from: 'entrance', aspect: 4 / 3, x: 0.5, y: 0.62 },
  'pool-4x3': { from: 'pool', aspect: 4 / 3, x: 0.5, y: 0.5 },
  'swing-4x3': { from: 'swing', aspect: 4 / 3, x: 0.5, y: 0.5 },
  'theatre-4x3': { from: 'theatre', aspect: 4 / 3, x: 0.5, y: 0.5 },
};

async function save(buf, name, w, ext) {
  const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const out = `${name}-${w}.${hash}.${ext}`;
  await writeFile(path.join(OUT, out), buf);
  return [`/img/${out}`, w, buf.length];
}

/* Encode one source (optionally cropped) at each width. */
async function encode(file, name, widths, { logo = false, region = null } = {}) {
  const webp = [], avif = [];
  for (const w of widths) {
    const base = () => {
      let s = sharp(path.join(SRC, file));
      if (region) s = s.extract(region);
      return s.resize({ width: w });
    };
    if (logo) {
      webp.push(await save(await base().webp({ quality: 90, alphaQuality: 100, effort: 6 }).toBuffer(), name, w, 'webp'));
    } else {
      webp.push(await save(await base().webp(WEBP).toBuffer(), name, w, 'webp'));
      avif.push(await save(await base().avif(AVIF).toBuffer(), name, w, 'avif'));
    }
  }
  const kb = (list) => list.map(([, w, b]) => `${w}w ${Math.round(b / 1024)}KB`).join(' ');
  console.log(name.padEnd(16), 'webp', kb(webp), avif.length ? ' | avif ' + kb(avif) : '');
  const strip = (list) => list.map(([u, w]) => [u, w]);
  return { webp: strip(webp), ...(avif.length ? { avif: strip(avif) } : {}) };
}

/* Widths below the source width, plus the source width itself (capped) as the largest. */
function widthsFor(list, full, cap) {
  const ws = list.filter((w) => w < full);
  ws.push(Math.min(full, cap));
  return [...new Set(ws)];
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).sort().filter((f) => /\.(jpe?g|png)$/i.test(f));
const manifest = {};
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const name = path.basename(file, ext);
  const { width, height } = await sharp(path.join(SRC, file)).metadata();
  const logo = ext === '.png';
  const widths = logo ? LOGO_WIDTHS[name.split('_')[0]].filter((w) => w <= width) : widthsFor(PHOTO_WIDTHS, width, 1600);
  manifest[name] = { width, height, ...(await encode(file, name, widths, { logo })) };
}
for (const [name, c] of Object.entries(CROPS)) {
  const file = files.find((f) => path.basename(f, path.extname(f)) === c.from);
  const { width, height } = await sharp(path.join(SRC, file)).metadata();
  let cw = width, ch = height;
  if (width / height > c.aspect) cw = Math.round(height * c.aspect); else ch = Math.round(width / c.aspect);
  const region = { left: Math.round((width - cw) * c.x), top: Math.round((height - ch) * c.y), width: cw, height: ch };
  manifest[name] = { width: cw, height: ch, ...(await encode(file, name, widthsFor(CROP_WIDTHS, cw, 1280), { region })) };
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
