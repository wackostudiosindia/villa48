import { reduceMotion } from './motion';

/*
  One requestAnimationFrame loop shared by everything that animates with scroll:
  the sky, the gold thread, the drive, parallax and the progress bar.

  Each subscriber can have a `read` step (measure the page) and a `write` step (change it).
  All reads run before any write in a frame, so the browser lays the page out at most once per frame.
  With reduced motion the loop only runs when something calls kick() (scroll, resize).
*/
const subscribers = new Set();
let rafId = 0;
let last = 0;

function frame(ts) {
  rafId = 0;
  const dt = Math.min(Math.max((ts - last) / 1000, 0), 0.05);
  last = ts;
  const t = ts / 1000;
  subscribers.forEach((s) => s.read && s.read(t, dt));
  subscribers.forEach((s) => s.write && s.write(t, dt));
  if (!reduceMotion && subscribers.size) rafId = requestAnimationFrame(frame);
}

export function kick() {
  if (!rafId) rafId = requestAnimationFrame(frame);
}

/* onTick(fn) runs fn as a write step; onTick({ read, write }) runs both phases. */
export function onTick(sub) {
  const s = typeof sub === 'function' ? { write: sub } : sub;
  subscribers.add(s);
  kick();
  return () => subscribers.delete(s);
}

if (typeof window !== 'undefined') {
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  document.addEventListener('visibilitychange', () => !document.hidden && kick());
}
