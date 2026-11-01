import { useEffect } from 'react';
import { useLang } from '../lib/i18n';

/*
  The logo intro is plain HTML, CSS and a tiny inline script in index.html: it paints immediately,
  lifts by itself about 1.7 s after the page starts (once the stylesheet is in), and a tap, key or
  scroll lifts it early. All the app does is translate its "Skip" label.
*/
export default function Intro() {
  const { t } = useLang();
  useEffect(() => {
    const el = document.getElementById('intro-skip');
    if (el) el.textContent = t('skip');
  }, [t]);
  return null;
}
