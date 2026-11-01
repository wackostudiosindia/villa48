import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/i18n';
import Img from './Img';

export default function Lightbox({ items, index, onIndex, onClose }) {
  const { t } = useLang();
  const closeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const g = items[index];
  const step = (d) => { setLoading(true); onIndex((index + d + items.length) % items.length); };

  useEffect(() => {
    const last = document.activeElement;
    closeRef.current?.focus();
    return () => last && last.focus && last.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const ctl = 'absolute size-12 border border-cream/40 bg-cream/10 text-[22px] leading-none text-cream transition-colors hover:bg-cream/20';
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-60 flex animate-[fadeIn_.3s_ease_both] flex-col items-center justify-center gap-3 bg-[rgba(5,20,13,.94)] px-4"
      style={{ paddingTop: 'calc(56px + env(safe-area-inset-top,0px))', paddingBottom: 'calc(24px + env(safe-area-inset-bottom,0px))' }}
    >
      <button ref={closeRef} type="button" aria-label="Close" onClick={onClose} className={ctl} style={{ top: 'calc(8px + env(safe-area-inset-top,0px))', right: 'max(8px,env(safe-area-inset-right,0px))' }}>×</button>
      <button type="button" aria-label="Previous" onClick={() => step(-1)} className={`${ctl} top-1/2`} style={{ left: 'max(8px,env(safe-area-inset-left,0px))' }}>‹</button>
      <Img
        key={g.s}
        name={g.s}
        alt={t(g.k)}
        eager
        sizes="(min-width: 1200px) 1200px, 100vw"
        onLoad={() => setLoading(false)}
        imgRef={(el) => el && el.complete && loading && setLoading(false)}
        className={`max-h-[78vh] max-w-[min(1200px,100%)] object-contain shadow-[0_30px_80px_rgba(0,0,0,.45)] transition-[opacity,transform] duration-[350ms,450ms] ease-out-soft ${loading ? 'scale-[.985] opacity-0' : ''}`}
      />
      <p className="text-center text-xs leading-[1.3] font-medium tracking-[.16em] text-cream uppercase">
        {t(g.k)}  ·  {index + 1} / {items.length}
      </p>
      <button type="button" aria-label="Next" onClick={() => step(1)} className={`${ctl} top-1/2`} style={{ right: 'max(8px,env(safe-area-inset-right,0px))' }}>›</button>
    </div>
  );
}
