import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useLang } from '../lib/i18n';
import { useBooking } from '../lib/booking';
import { skyStore } from '../lib/skyStore';
import { onTick } from '../lib/ticker';
import { clamp } from '../lib/motion';

const LANGS = [
  ['en', 'EN'],
  ['hi', 'Hinglish'],
  ['gu', 'ગુજ'],
];

export default function Header() {
  const { t, lang, setLang } = useLang();
  const { drawerOpen, openDrawer, closeDrawer } = useBooking();
  const { clock, phase } = useSyncExternalStore(skyStore.subscribe, skyStore.get);
  const barRef = useRef(null);

  // scroll progress line under the bar
  useEffect(
    () =>
      onTick(() => {
        const h = document.documentElement.scrollHeight - innerHeight;
        barRef.current?.style.setProperty('--p', h > 0 ? clamp(scrollY / h, 0, 1).toFixed(4) : 0);
      }),
    [],
  );

  return (
    <header
      ref={barRef}
      className="progress fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-bar backdrop-blur-[14px] transition-colors duration-500"
      style={{
        padding:
          'calc(8px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) 8px max(16px,env(safe-area-inset-left,0px))',
      }}
    >
      <a href="#top" aria-label="Villa 48" className="block leading-none">
        <img className="tone-d h-[38px] w-auto sm:h-11" src="/img/icon_dark.png" width="520" height="685" alt="Villa 48" />
        <img className="tone-n h-[38px] w-auto sm:h-11" src="/img/icon_light.png" width="520" height="685" alt="Villa 48" />
      </a>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 text-[11px] leading-none font-medium tracking-[.14em] whitespace-nowrap uppercase sm:flex" aria-hidden="true">
          <i className="size-[7px] rounded-full bg-gold" />
          <span>{clock}</span>
          <span>{(t('phase') || [])[phase]}</span>
        </div>
        <button
          type="button"
          aria-expanded={drawerOpen}
          aria-controls="quick-booking"
          onClick={drawerOpen ? closeDrawer : openDrawer}
          className="btn-cta caps relative isolate min-h-10 overflow-hidden px-2.5 text-[10px] leading-none font-bold tracking-[.1em] whitespace-nowrap transition-transform hover:-translate-y-px sm:px-4 sm:text-[11px]"
        >
          {t('btn_book')}
        </button>
        <div className="inline-flex overflow-hidden rounded-[2px] border border-line" role="group" aria-label="Language">
          {LANGS.map(([code, label]) => (
            <button
              key={code}
              type="button"
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
              className={`min-h-10 px-[9px] py-[11px] text-xs leading-none font-medium tracking-[.06em] text-fg sm:px-3 ${lang === code ? 'is-on' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
