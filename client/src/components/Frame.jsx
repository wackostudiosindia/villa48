import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { onTick } from '../lib/ticker';
import { reduceMotion } from '../lib/motion';
import { onLayout, pageTop } from '../lib/layout';
import Img from './Img';

/* A photo in a thin offset gold frame with the roof chevron, as in the logo. Optional gentle parallax. */
export default function Frame({ name, alt, sizes = '(min-width: 860px) 600px, 100vw', ratio = 'aspect-[4/3]', objectPosition, caption, parallax = true, eager = false, className = '', children }) {
  const phRef = useRef(null);

  useEffect(() => {
    if (!parallax || reduceMotion) return;
    let next = null, last = null, top = 0, height = 0;
    const stopLayout = onLayout(() => {
      const el = phRef.current;
      if (el) { top = pageTop(el); height = el.offsetHeight; }
    });
    const stopTick = onTick({
      read: () => {
        next = null;
        const y = top - scrollY;
        if (y + height < 0 || y > innerHeight) return;
        next = ((y + height / 2 - innerHeight / 2) * -0.06).toFixed(1) + 'px';
      },
      write: () => {
        if (next !== null && next !== last) { last = next; phRef.current.style.setProperty('--py', next); }
      },
    });
    return () => { stopLayout(); stopTick(); };
  }, [parallax]);

  return (
    <figure className={`frame ${className}`}>
      <Icon name="chv" className="chev" />
      <div ref={phRef} className={`ph ${ratio} ${parallax ? 'par' : ''}`}>
        <Img name={name} alt={alt} sizes={sizes} eager={eager} style={objectPosition ? { objectPosition } : undefined} />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
      {children}
    </figure>
  );
}
