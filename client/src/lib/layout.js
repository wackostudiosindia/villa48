/*
  Cached page measurements. Reading element positions every animation frame forces the browser to
  recalculate layout, so the animations read these cached values instead. They are refreshed (all at once,
  in one frame) only when the page actually changes size: resize, fonts/images settling, sections rendering,
  language switches or opened accordions.
*/
const measurers = new Set();
let scheduled = false;

function measureAll() {
  scheduled = false;
  measurers.forEach((fn) => fn());
}

export function remeasure() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(measureAll); }
}

/* Run fn now and whenever the layout changes. Returns an unsubscribe function. */
export function onLayout(fn) {
  measurers.add(fn);
  remeasure();
  return () => measurers.delete(fn);
}

/* Distance from the top of the document to the element's top edge. */
export const pageTop = (el) => el.getBoundingClientRect().top + scrollY;

if (typeof window !== 'undefined') {
  addEventListener('resize', remeasure);
  addEventListener('load', remeasure);
  addEventListener('v48:layout', remeasure);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(remeasure);
    const watch = () => ro.observe(document.body);
    if (document.body) watch(); else addEventListener('DOMContentLoaded', watch);
  }
}
