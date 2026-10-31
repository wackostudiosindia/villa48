import express from 'express';
import compression from 'compression';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/*
  The API. Used by server/index.js locally and on any Node host,
  and by api/index.js as a Vercel serverless function.
*/
const app = express();
app.disable('x-powered-by');
app.use(compression());

const router = express.Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

// Booked check-in dates: edit server/data/availability.json and redeploy.
router.get('/availability', (_req, res) => {
  let booked = [];
  try {
    const data = require('./data/availability.json');
    booked = (Array.isArray(data.booked) ? data.booked : []).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  } catch (err) {
    console.error('availability:', err.message);
  }
  res.set('Cache-Control', 'public, max-age=0, s-maxage=60').json({ booked });
});

router.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use('/api', router);

export default app;
