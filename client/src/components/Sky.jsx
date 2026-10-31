import { useEffect, useRef } from 'react';
import { onTick } from '../lib/ticker';
import { clamp, reduceMotion } from '../lib/motion';
import { skyStore } from '../lib/skyStore';

/*
  Fixed sky behind the page. Scroll progress (0 at the top, 1 at the night chapter) sets the time of day,
  the page's day/night tone and the header clock.
*/
export default function Sky() {
  const ref = useRef(null);

  useEffect(() => {
    // Three.js is loaded as its own chunk while the logo intro plays.
    let cleanup = () => {};
    let cancelled = false;
    import('../lib/sky').then(({ createSky }) => {
      if (cancelled || !ref.current) return;
      cleanup = start(createSky(ref.current));
    });
    return () => { cancelled = true; cleanup(); };
  }, []);

  function start(sky) {
    const root = document.documentElement;
    sky.resize(true);
    const target = () => {
      const night = document.getElementById('night');
      return clamp(scrollY / Math.max(night ? night.offsetTop : 1, 1), 0, 1);
    };
    let p = target();
    let tone = '';
    const stop = onTick((t, dt) => {
      const goal = target();
      p = reduceMotion ? goal : p + (goal - p) * Math.min(1, dt * 6 + 0.02);
      if (Math.abs(goal - p) < 0.0005) p = goal;
      const s = sky.render(p, t, dt);
      if (s.tone !== tone) {
        tone = s.tone;
        if (tone === 'night') root.setAttribute('data-tone', 'night');
        else root.removeAttribute('data-tone');
      }
      root.style.setProperty('--sky-bot', s.skyBottom);
      skyStore.set({ clock: s.clock, phase: s.phase });
    });
    const onResize = () => sky.resize();
    addEventListener('resize', onResize);
    return () => {
      stop();
      removeEventListener('resize', onResize);
      sky.destroy();
    };
  }

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="sky-canvas pointer-events-none fixed top-0 left-0 z-0 block h-lvh w-full"
    />
  );
}
