import { useEffect } from 'react';
import { useLang } from '../lib/i18n';
import { reduceMotion } from '../lib/motion';
import { layoutChanged } from '../lib/skyStore';

/*
  Controls the logo intro. The intro itself is plain HTML + inline CSS in index.html, so it paints
  immediately, before this app has loaded. Here we time it, let visitors skip it, and lift it away:
  the V48 mark rises in with a gold glow and a shine, the wordmark fades up, then the screen lifts like a curtain.
*/
export default function Intro() {
  const { t } = useLang();

  useEffect(() => {
    const el = document.getElementById('intro-skip');
    if (el) el.textContent = t('skip');
  }, [t]);

  useEffect(() => {
    const intro = document.getElementById('intro');
    const root = document.documentElement;
    if (!intro) { root.classList.remove('intro'); return; }
    let done = false;
    const start = 0; // the intro has been on screen since the page started loading
    const minTime = reduceMotion ? 900 : 3300;
    const timers = [];
    const finish = () => {
      if (done) return;
      done = true;
      intro.classList.add('out');
      root.classList.remove('intro');
      timers.push(setTimeout(() => { intro.remove(); layoutChanged(); }, 1250));
    };
    const go = () => timers.push(setTimeout(finish, Math.max(0, minTime - (performance.now() - start))));
    if (document.readyState === 'complete') go();
    else addEventListener('load', go, { once: true });
    timers.push(setTimeout(finish, 6000));
    const onKey = (e) => ['Escape', 'Enter', ' '].includes(e.key) && finish();
    const onWheel = (e) => { if (done) return; e.preventDefault(); if (performance.now() - start > 1200) finish(); };
    intro.addEventListener('click', finish);
    addEventListener('keydown', onKey);
    addEventListener('wheel', onWheel, { passive: false });
    return () => {
      timers.forEach(clearTimeout);
      intro.removeEventListener('click', finish);
      removeEventListener('load', go);
      removeEventListener('keydown', onKey);
      removeEventListener('wheel', onWheel);
    };
  }, []);

  return null;
}
