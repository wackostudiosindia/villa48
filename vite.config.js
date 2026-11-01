import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

/*
  index.html can reference optimised images by name:
    %IMG:name:width%  -> URL of the smallest variant at least that wide
    %SRCSET:name%     -> WebP srcset string
    %AVIFSET:name%    -> AVIF srcset string
  (see scripts/optimize-images.mjs, which writes client/src/data/images.json)
*/
function imageTokens() {
  const images = () => JSON.parse(readFileSync(new URL('./client/src/data/images.json', import.meta.url), 'utf8'));
  return {
    name: 'villa48-image-tokens',
    transformIndexHtml(html) {
      const m = images();
      return html
        .replace(/%IMG:([\w-]+):(\d+)%/g, (_, n, w) => {
          const v = m[n].webp;
          return (v.find(([, vw]) => vw >= +w) || v[v.length - 1])[0];
        })
        .replace(/%SRCSET:([\w-]+)%/g, (_, n) => m[n].webp.map(([u, w]) => `${u} ${w}w`).join(', '))
        .replace(/%AVIFSET:([\w-]+)%/g, (_, n) => m[n].avif.map(([u, w]) => `${u} ${w}w`).join(', '));
    },
  };
}

/*
  The logo intro is painted by inline CSS in index.html and covers the page while the stylesheet loads,
  so the stylesheet doesn't need to block the first paint: load it asynchronously, and tell the intro
  (window.__v48.ready) when it's in, so the intro can lift.
*/
function asyncCss() {
  return {
    name: 'villa48-async-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html) =>
        html.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g,
          (_, href) => `<link rel="preload" as="style" crossorigin href="${href}" onload="this.onload=null;this.rel='stylesheet';window.__v48&&__v48.ready()"><noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`),
    },
  };
}

/* Preload the Latin font so text settles in its final face early (one variable font file). */
function preloadFont() {
  return {
    name: 'villa48-preload-font',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const font = Object.keys(ctx.bundle || {}).find((f) => f.includes('plus-jakarta-sans-latin-wght') && f.endsWith('.woff2'));
        if (!font) return html;
        return html.replace('</title>', `</title>\n  <link rel="preload" as="font" type="font/woff2" crossorigin href="/${font}">`);
      },
    },
  };
}

// The React app lives in client/. `npm run build` writes it to dist/, which Express serves in production.
export default defineConfig(({ isSsrBuild }) => ({
  root: 'client',
  plugins: [react(), tailwindcss(), imageTokens(), asyncCss(), preloadFont()],
  build: { outDir: '../dist', emptyOutDir: true, chunkSizeWarningLimit: 900, copyPublicDir: !isSsrBuild },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
}));
