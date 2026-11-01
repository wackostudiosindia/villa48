import { useEffect, useRef, useState } from 'react';
import { reduceMotion } from '../lib/motion';

/*
  Lifts and fades its content in when it scrolls into view.
  Anything already on screen at load is simply shown. The first IntersectionObserver report tells us
  where the element is, so nothing has to be measured while the page renders.
*/
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null);
  const [state, setState] = useState('idle'); // idle -> pre (waiting below the fold) -> shown
  useEffect(() => {
    const el = ref.current;
    if (reduceMotion || !el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setState('shown'); io.disconnect(); }
        else if (e.boundingClientRect.top > 0) setState((s) => (s === 'idle' ? 'pre' : s));
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`rv ${state === 'pre' ? 'pre' : ''} ${className}`} style={{ '--d': `${delay}s`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
