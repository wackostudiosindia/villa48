import { useCallback, useEffect, useState } from 'react';
import { useLang } from '../lib/i18n';
import { reduceMotion } from '../lib/motion';
import { layoutChanged } from '../lib/skyStore';

/*
  Logo intro: the V48 mark rises in with a gold glow and a metallic shine, the wordmark fades up,
  then the screen lifts like a curtain. Tap, a key, a scroll or "Skip" ends it early.
*/
export default function Intro() {
  const { t } = useLang();
  const [stage, setStage] = useState('show'); // show -> out -> gone

  const finish = useCallback(() => setStage((s) => (s === 'show' ? 'out' : s)), []);

  useEffect(() => {
    document.documentElement.classList.add('intro');
    const start = Date.now();
    const minTime = reduceMotion ? 900 : 3300;
    let timer;
    const go = () => { timer = setTimeout(finish, Math.max(0, minTime - (Date.now() - start))); };
    if (document.readyState === 'complete') go();
    else addEventListener('load', go, { once: true });
    const failsafe = setTimeout(finish, 6000);
    const onKey = (e) => ['Escape', 'Enter', ' '].includes(e.key) && finish();
    const onWheel = () => Date.now() - start > 1200 && finish();
    addEventListener('keydown', onKey);
    addEventListener('wheel', onWheel, { passive: true });
    return () => {
      clearTimeout(timer); clearTimeout(failsafe);
      removeEventListener('load', go);
      removeEventListener('keydown', onKey);
      removeEventListener('wheel', onWheel);
    };
  }, [finish]);

  useEffect(() => {
    if (stage !== 'out') return;
    document.documentElement.classList.remove('intro');
    const id = setTimeout(() => { setStage('gone'); layoutChanged(); }, 1300);
    return () => clearTimeout(id);
  }, [stage]);

  if (stage === 'gone') return null;

  return (
    <div
      aria-hidden="true"
      onClick={finish}
      className={`intro-bg fixed inset-0 z-[100] grid place-items-center text-cream ${stage === 'out' ? 'out' : ''}`}
    >
      <div className="intro-content grid justify-items-center gap-[26px]">
        <div className="intro-mark relative aspect-[520/685] w-[min(30vw,132px)]">
          <i className="intro-glow pointer-events-none absolute -inset-[60%]" />
          <img className="relative block h-auto w-full" src="/img/icon_light.png" width="520" height="685" alt="" />
          <i className="intro-shine absolute inset-0" />
        </div>
        <img className="intro-word h-auto w-[min(62vw,250px)]" src="/img/word_light.png" width="520" height="235" alt="" />
      </div>
      <button
        type="button"
        tabIndex={-1}
        onClick={finish}
        className="intro-skip absolute left-1/2 -translate-x-1/2 bg-transparent px-[18px] py-3.5 text-[10px] leading-none font-semibold tracking-[.24em] text-cream/60 uppercase hover:text-cream"
        style={{ bottom: 'calc(22px + env(safe-area-inset-bottom,0px))' }}
      >
        {t('skip')}
      </button>
    </div>
  );
}
