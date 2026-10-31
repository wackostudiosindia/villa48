import { useLayoutEffect, useRef, useState } from 'react';
import { useInView } from '../hooks/useInView';
import { reduceMotion } from '../lib/motion';

/*
  Lifts and fades its content in when it scrolls into view.
  Anything already on screen at load is shown straight away.
*/
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);
  useLayoutEffect(() => {
    if (reduceMotion || !ref.current) return;
    if (ref.current.getBoundingClientRect().top > innerHeight * 0.95) setArmed(true);
  }, []);
  const seen = useInView(ref, { threshold: 0.1 });
  const pre = armed && !seen;
  return (
    <Tag ref={ref} className={`rv ${pre ? 'pre' : ''} ${className}`} style={{ '--d': `${delay}s`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
