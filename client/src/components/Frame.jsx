import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { onTick } from '../lib/ticker';
import { reduceMotion } from '../lib/motion';

/* A photo in a thin offset gold frame with the roof chevron, as in the logo. Optional gentle parallax. */
export default function Frame({ src, alt, width = 1600, height = 900, ratio = 'aspect-[4/3]', objectPosition, caption, parallax = true, eager = false, className = '', children }) {
  const phRef = useRef(null);

  useEffect(() => {
    if (!parallax || reduceMotion) return;
    return onTick(() => {
      const el = phRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.setProperty('--py', ((r.top + r.height / 2 - innerHeight / 2) * -0.06).toFixed(1) + 'px');
    });
  }, [parallax]);

  return (
    <figure className={`frame ${className}`}>
      <Icon name="chv" className="chev" />
      <div ref={phRef} className={`ph ${ratio} ${parallax ? 'par' : ''}`}>
        <img
          src={src}
          width={width}
          height={height}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          style={objectPosition ? { objectPosition } : undefined}
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
      {children}
    </figure>
  );
}
