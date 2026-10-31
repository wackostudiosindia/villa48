import { useEffect, useRef } from 'react';
import { useLang } from '../lib/i18n';
import { reduceMotion } from '../lib/motion';

const VIEW = { en: 'View', hi: 'Dekho', gu: 'જુઓ' };

/* Desktop cursor: a small gold dot and a soft ring that grows over links and says "View" over photos. */
export default function Cursor() {
  const { lang } = useLang();
  const dot = useRef(null), ring = useRef(null), label = useRef(null), langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    if (!fine || reduceMotion) return;
    const root = document.documentElement;
    let mx = -200, my = -200, rx = -200, ry = -200, raf = 0, seen = false;
    const loop = () => {
      raf = 0;
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      dot.current.style.transform = `translate3d(${mx}px,${my}px,0)`;
      ring.current.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) raf = requestAnimationFrame(loop);
    };
    const move = (e) => {
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; rx = mx; ry = my; root.classList.add('has-cur'); }
      dot.current.classList.add('on'); ring.current.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const over = (e) => {
      const t = e.target;
      if (!t?.closest) return;
      const isText = !!t.closest('input[type=text],input[type=tel],textarea');
      const hot = !!t.closest('a,button,summary,label,input') && !isText;
      const view = !!t.closest('[data-cursor=view]');
      dot.current.classList.toggle('txt', isText); ring.current.classList.toggle('txt', isText);
      ring.current.classList.toggle('hot', hot); dot.current.classList.toggle('hot', hot);
      ring.current.classList.toggle('lab', view);
      if (view) label.current.textContent = VIEW[langRef.current] || VIEW.en;
    };
    const leave = () => { dot.current.classList.remove('on'); ring.current.classList.remove('on'); };
    document.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over);
    root.addEventListener('mouseleave', leave);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      root.removeEventListener('mouseleave', leave);
      root.classList.remove('has-cur');
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cur cur-dot" aria-hidden="true" />
      <div ref={ring} className="cur cur-ring" aria-hidden="true"><span ref={label} /></div>
    </>
  );
}
