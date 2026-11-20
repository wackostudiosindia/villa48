import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/i18n';
import { reduceMotion } from '../lib/motion';
import { INSTAGRAM } from '../lib/site';
import Section, { SectionHead } from './Section';
import Reveal from './Reveal';
import { Icon } from './Icon';

const SRC = '/video/villa48-reel.mp4';
const POSTER = '/video/villa48-reel-poster.webp';

/*
  The 45-second villa reel in a tall phone-shaped frame. It plays silently on a loop while it is on screen
  (never with reduced motion), and the button restarts it with sound. preload=none: nothing downloads until it plays.
*/
export default function Reel() {
  const { t } = useLang();
  const box = useRef(null), vid = useRef(null);
  const [sound, setSound] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => {
      const v = vid.current;
      if (!v) return;
      if (e.isIntersecting && e.intersectionRatio > 0.35) {
        if (!reduceMotion || !v.muted) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    }, { rootMargin: '300px 0px', threshold: [0, 0.35] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggleSound = () => {
    const v = vid.current;
    if (!v) return;
    if (sound) { v.muted = true; setSound(false); return; }
    v.muted = false; v.currentTime = 0; v.play().catch(() => {}); setSound(true);
  };
  const togglePlay = () => {
    const v = vid.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };

  return (
    <Section id="reel" className="grid items-center gap-10 py-[clamp(48px,10vh,110px)] ch:grid-cols-[1fr_auto] ch:gap-20">
      <div className="flex min-w-0 flex-col gap-6">
        <SectionHead eyebrow={t('rl_e')} title={t('rl_h')} lead={t('rl_p')} />
        <Reveal delay={0.1} className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary max-sm:flex-[1_1_100%]" onClick={toggleSound} aria-pressed={sound}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="ico">
              {sound
                ? <path d="M4 9h4l5-4v14l-5-4H4zM17 9l4 6M21 9l-4 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                : <path d="M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
            {t(sound ? 'rl_mute' : 'rl_play')}
          </button>
          <a className="btn max-sm:flex-[1_1_100%]" href={INSTAGRAM} target="_blank" rel="noopener">
            <Icon name="i-ig" className="ico" />
            {t('rl_ig')}
          </a>
        </Reveal>
      </div>
      <Reveal delay={0.15} className="justify-self-center">
        <figure ref={box} className="frame reel m-0 w-[min(78vw,340px)]">
          <Icon name="chv" className="chev" />
          <div className="ph relative aspect-[9/16] overflow-hidden rounded-[22px]">
            <video
              ref={vid}
              className="absolute inset-0 h-full w-full object-cover"
              src={SRC}
              poster={POSTER}
              muted
              loop
              playsInline
              preload="none"
              aria-label={t('rl_h')}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            <button
              type="button"
              onClick={togglePlay}
              aria-label={t(playing ? 'rl_pause' : 'rl_start')}
              data-cursor="view"
              className={`absolute inset-0 grid place-items-center bg-transparent transition-opacity duration-300 ${playing ? 'opacity-0 hover:opacity-100 focus-visible:opacity-100' : 'opacity-100'}`}
            >
              <span className="grid size-16 place-items-center rounded-full border border-gold-light/70 bg-forest-deep/55 text-cream backdrop-blur-sm">
                {playing
                  ? <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-current"><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>
                  : <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-1 size-6 fill-current"><path d="M7 4.5v15l12-7.5z" /></svg>}
              </span>
            </button>
          </div>
        </figure>
      </Reveal>
    </Section>
  );
}
