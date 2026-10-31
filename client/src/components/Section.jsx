import { useRef } from 'react';
import { useInView } from '../hooks/useInView';
import Reveal from './Reveal';

/* A page section that gets the `lit` class when reached, which settles its photo frames and eyebrow lines. */
export default function Section({ id, className = '', children }) {
  const ref = useRef(null);
  const lit = useInView(ref, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  return (
    <section ref={ref} id={id} className={`relative z-1 mx-auto max-w-[1180px] ${lit ? 'lit' : ''} ${className}`}>
      {children}
    </section>
  );
}

/* Eyebrow, heading and intro line at the top of a section. */
export function SectionHead({ eyebrow, title, lead, small, className = '' }) {
  return (
    <Reveal className={`flex min-w-0 flex-col gap-3.5 ${className}`}>
      {eyebrow && <span className="eyebrow halo">{eyebrow}</span>}
      {title && <h2 className="halo">{title}</h2>}
      {lead && <p className="lead halo">{lead}</p>}
      {small && <p className="halo text-[13px] text-fg-soft">{small}</p>}
    </Reveal>
  );
}
