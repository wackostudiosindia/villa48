import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

/*
  index.html can reference optimised images by name:
    %IMG:name:width%  -> URL of the smallest variant at least that wide
    %SRCSET:name%     -> full srcset string
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
          const v = m[n].variants;
          return (v.find(([, vw]) => vw >= +w) || v[v.length - 1])[0];
        })
        .replace(/%SRCSET:([\w-]+)%/g, (_, n) => m[n].variants.map(([u, w]) => `${u} ${w}w`).join(', '));
    },
  };
}

/*
  The logo intro is painted by inline CSS in index.html and covers the page for ~3 s,
  so the main stylesheet doesn't need to block the first paint: load it asynchronously.
*/
function asyncCss() {
  return {
    name: 'villa48-async-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html) =>
        html.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g,
          (_, href) => `<link rel="preload" as="style" crossorigin href="${href}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`),
    },
  };
}

// The React app lives in client/. `npm run build` writes it to dist/, which Express serves in production.
export default defineConfig({
  root: 'client',
  plugins: [react(), tailwindcss(), imageTokens(), asyncCss()],
  build: { outDir: '../dist', emptyOutDir: true, chunkSizeWarningLimit: 900 },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
});
