import { useEffect, useRef } from 'react';
import { onTick } from '../lib/ticker';
import { clamp, reduceMotion } from '../lib/motion';
import { skyStore } from '../lib/skyStore';
import { hasHardwareWebGL } from '../lib/gpu';
import { onLayout } from '../lib/layout';

/*
  Fixed sky behind the page. Scroll progress (0 at the top, 1 at the night chapter) sets the time of day,
  the page's day/night tone and the header clock.

  The sky loads once the page has finished loading and the browser is idle, so it never competes with
  the first paint. Devices with real GPU acceleration get the WebGL sky (Three.js, its own chunk);
  others get a light 2D sky and never download Three.js. While the page is still, the WebGL sky redraws
  at ~30 fps (24 on phones) and the 2D sky only redraws for the night's stars; while scrolling both follow every frame.
*/
const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 300));

export default function Sky() {
  const ref = useRef(null);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    const boot = () =>
      idle(() =>
        Promise.all([import('../lib/sky'), hasHardwareWebGL() ? import('../lib/skyGL') : null]).then(([{ createSky }, glMod]) => {
          if (cancelled || !ref.current) return;
          const gl = glMod ? glMod.createGL(ref.current) : null;
          cleanup = start(createSky(ref.current, gl));
        }),
      );
    if (document.readyState === 'complete') boot();
    else addEventListener('load', boot, { once: true });
    return () => { cancelled = true; removeEventListener('load', boot); cleanup(); };
  }, []);

  function start(sky) {
    const root = document.documentElement;
    const night = document.getElementById('night');
    sky.resize(true);
    let goal = 0, p = -1, tone = '', bottom = '', lastDraw = -1, nightTop = 1;
    const stopLayout = onLayout(() => { nightTop = Math.max(night ? night.offsetTop : 1, 1); });
    const stop = onTick({
      read: () => { goal = clamp(scrollY / nightTop, 0, 1); },
      write: (t, dt) => {
        const prev = p;
        p = p < 0 || reduceMotion ? goal : p + (goal - p) * Math.min(1, dt * 6 + 0.02);
        if (Math.abs(goal - p) < 0.0005) p = goal;
        const moving = p !== prev;
        const minGap = !sky.gl ? (p > 0.6 ? 1 / 12 : Infinity) : innerWidth < 700 ? 1 / 24 : 1 / 30;
        if (!moving && lastDraw >= 0 && t - lastDraw < minGap) return;
        lastDraw = t;
        const s = sky.render(p, t, dt);
        if (s.tone !== tone) {
          tone = s.tone;
          if (tone === 'night') root.setAttribute('data-tone', 'night');
          else root.removeAttribute('data-tone');
        }
        if (s.skyBottom !== bottom) { bottom = s.skyBottom; root.style.setProperty('--sky-bot', bottom); }
        skyStore.set({ clock: s.clock, phase: s.phase });
      },
    });
    const onResize = () => sky.resize();
    addEventListener('resize', onResize);
    return () => {
      stop();
      stopLayout();
      removeEventListener('resize', onResize);
      sky.destroy();
    };
  }

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="sky-canvas pointer-events-none fixed top-0 left-0 z-0 block h-lvh w-full bg-[linear-gradient(#efe6cd,#f8f3e6)]"
    />
  );
}
