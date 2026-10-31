# Villa 48 Farmhouse

Website for **Villa 48 · Farm Estate Retreat**, a private farmhouse 35 minutes from Surat for up to 20 guests.

The page tells one day at the villa as you scroll, from 09:00 to past midnight. The animated sky behind it moves from morning to night, and a gold line runs through every section. Enquiries go out on WhatsApp. The site is in English, Hinglish and Gujarati.

## Stack

- **React 19** with **Vite**, client code in `client/`
- **Tailwind CSS 4**: brand tokens and day/night colours in `client/src/styles/index.css`
- **Three.js** for the WebGL sky, loaded as its own chunk while the logo intro plays
- **Express 5** API in `server/`. It runs as a Vercel serverless function in `api/`, or as a plain Node server.

## Run it

```bash
npm install
npm run dev        # React on http://localhost:5173, API on http://localhost:3000
npm run build      # production build into dist/
npm start          # Express serves dist/ and the API on http://localhost:3000
```

## Common edits

| What | Where |
| --- | --- |
| Booked dates (shown as booked in the calendar) | `server/data/availability.json`, e.g. `{"booked": ["2026-12-31"]}` |
| All text, in all three languages | `client/src/data/strings.js` |
| House rules (full terms) | `client/src/data/rules.js` |
| Gallery photos and captions | `client/src/data/gallery.js` and `client/public/img/` |
| WhatsApp number, email, Instagram, Maps link | `client/src/lib/site.js` |
| Colours, fonts, breakpoints | `@theme` in `client/src/styles/index.css` |

## Project layout

```
api/index.js              Vercel function: every /api/* request goes to the Express app
server/app.js             Express API (/api/health, /api/availability)
server/index.js           Local/Node server: API + built site
server/data/              availability.json
client/index.html         HTML shell, fonts
client/public/img/        photos and logos
client/src/
  App.jsx                 page structure
  components/             Intro, Sky, Thread, Hero, Chapter, Gallery, Booking, ...
  lib/                    sky shader, shared animation ticker, i18n, booking state
  data/                   copy, rules, gallery list
  styles/index.css        Tailwind theme + effects
vercel.json               build settings and /api rewrite
```

## Deploying

On Vercel, import the repository. `vercel.json` sets the build command, the `dist` output and the API rewrite, so no other settings are needed. Every push to `main` deploys.

On any other Node host, run `npm ci && npm run build && npm start` and set `PORT` if needed.
