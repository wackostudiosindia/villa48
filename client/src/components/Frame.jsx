import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { onTick } from '../lib/ticker';
import { reduceMotion } from '../lib/motion';
import { onLayout, pageTop } from '../lib/layout';
import Img from './Img';

/*
  A photo in a thin offset gold frame with the roof chevron, as in the logo. Optional gentle parallax.
  zoom: the photo also eases from a close crop (1.2x) to its full frame as it crosses the screen, like a slow camera pull-back.
*/
export default function Frame({ name, alt, sizes = '(min-width: 860px) 600px, 100vw', ratio = 'aspect-[4/3]', objectPosition, caption, parallax = true, zoom = false, eager = false, priority = false, className = '', children }) {
  const phRef = useRef(null);

  useEffect(() => {
    if (!parallax || reduceMotion) return;
    let next = null, last = null, nextZ = null, lastZ = null, top = 0, height = 0;
    const stopLayout = onLayout(() => {
      const el = phRef.current;
      if (el) { top = pageTop(el); height = el.offsetHeight; }
    });
    const stopTick = onTick({
      read: () => {
        next = null; nextZ = null;
        const y = top - scrollY;
        if (y + height < 0 || y > innerHeight) return;
        next = ((y + height / 2 - innerHeight / 2) * -0.06).toFixed(1) + 'px';
        if (zoom) {
          // 0 when the photo's top enters at the bottom of the screen, 1 when its middle reaches the middle
          const p = Math.min(1, Math.max(0, (innerHeight - y) / (innerHeight / 2 + height / 2)));
          nextZ = (1.2 - 0.12 * (1 - (1 - p) ** 3)).toFixed(4);
        }
      },
      write: () => {
        const st = phRef.current.style;
        if (next !== null && next !== last) { last = next; st.setProperty('--py', next); }
        if (nextZ !== null && nextZ !== lastZ) { lastZ = nextZ; st.setProperty('--pz', nextZ); }
      },
    });
    return () => { stopLayout(); stopTick(); };
  }, [parallax, zoom]);

  return (
    <figure className={`frame ${className}`}>
      <Icon name="chv" className="chev" />
      <div ref={phRef} className={`ph ${ratio} ${parallax ? 'par' : ''}`}>
        <Img name={name} alt={alt} sizes={sizes} eager={eager} priority={priority} style={objectPosition ? { objectPosition } : undefined} />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
      {children}
    </figure>
  );
}
