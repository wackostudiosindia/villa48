import { reduceMotion } from './motion';

/*
  One requestAnimationFrame loop shared by everything that animates with scroll:
  the sky, the gold thread, the drive, parallax and the progress bar.
  With reduced motion it only runs a frame when something calls kick() (scroll, resize).
*/
const subscribers = new Set();
let rafId = 0;
let last = 0;

function frame(ts) {
  rafId = 0;
  const dt = Math.min(Math.max((ts - last) / 1000, 0), 0.05);
  last = ts;
  subscribers.forEach((fn) => fn(ts / 1000, dt));
  if (!reduceMotion && subscribers.size) rafId = requestAnimationFrame(frame);
}

export function kick() {
  if (!rafId) rafId = requestAnimationFrame(frame);
}

export function onTick(fn) {
  subscribers.add(fn);
  kick();
  return () => subscribers.delete(fn);
}

if (typeof window !== 'undefined') {
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  document.addEventListener('visibilitychange', () => !document.hidden && kick());
}
