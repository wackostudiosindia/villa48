import { useEffect, useState } from 'react';

/* True once the element has scrolled into view (and stays true). */
export function useInView(ref, { threshold = 0.1, rootMargin = '0px', initial = false } = {}) {
  const [inView, setInView] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }),
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, rootMargin, inView]);
  return inView;
}
