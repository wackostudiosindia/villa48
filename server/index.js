import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';

/* Local / any Node host: the API plus the built React app from dist/. */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const PORT = Number(process.env.PORT) || 3000;

if (existsSync(DIST)) {
  // Hashed build assets are cached for a year, images for a week; index.html always revalidates.
  app.use('/assets', express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use('/img', express.static(path.join(DIST, 'img'), { maxAge: '7d' }));
  app.use(express.static(DIST, { index: false, maxAge: 0 }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || !req.accepts('html')) return next();
    res.set('Cache-Control', 'no-cache').sendFile(path.join(DIST, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => res.type('text').send('No build found. Run `npm run build`, or use `npm run dev` for development.'));
}

app.listen(PORT, () => console.log(`Villa 48 server on http://localhost:${PORT}`));
