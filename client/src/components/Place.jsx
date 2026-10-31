import { useEffect, useRef } from 'react';
import { useLang } from '../lib/i18n';
import { onTick } from '../lib/ticker';
import { clamp, reduceMotion } from '../lib/motion';
import { INSTAGRAM, MAPS } from '../lib/site';
import Section, { SectionHead } from './Section';
import Reveal from './Reveal';
import { Icon } from './Icon';

const ROAD = 'M70 250 C 190 70, 330 310, 470 180 S 660 60, 735 85';

/* The 35-minute drive: as you scroll, a car drives from Surat to the villa, trees pop up and the minutes count up. */
export default function Place() {
  const { t } = useLang();
  const road = useRef(null), trail = useRef(null), car = useRef(null), pin = useRef(null), mins = useRef(null), treesG = useRef(null);

  useEffect(() => {
    const path = road.current;
    const len = path.getTotalLength();
    const ns = 'http://www.w3.org/2000/svg';
    const trees = [];
    treesG.current.textContent = '';
    for (let i = 0; i < 16; i++) {
      const tt = (i + 1) / 17 + ((i % 3) - 1) * 0.012;
      const pt = path.getPointAtLength(tt * len);
      const pt2 = path.getPointAtLength(Math.min(tt * len + 2, len));
      const a = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) + Math.PI / 2;
      const off = (30 + ((i * 7) % 16)) * (i % 2 ? 1 : -1);
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('transform', `translate(${(pt.x + Math.cos(a) * off).toFixed(1)} ${(pt.y + Math.sin(a) * off).toFixed(1)})`);
      const inner = document.createElementNS(ns, 'g');
      inner.innerHTML = `<rect x="-1.5" y="-2" width="3" height="9" fill="var(--fg-soft)" opacity=".5"/><circle cx="0" cy="-9" r="${8 + (i % 3) * 2}" fill="var(--tree)"/>`;
      Object.assign(inner.style, { transformBox: 'fill-box', transformOrigin: '50% 100%', transform: reduceMotion ? 'scale(1)' : 'scale(0)', transition: 'transform .5s cubic-bezier(.3,1.7,.5,1)' });
      g.appendChild(inner);
      treesG.current.appendChild(g);
      trees.push({ t: tt, el: inner, on: false });
    }
    trail.current.style.strokeDasharray = len;
    let s = reduceMotion ? 1 : 0;
    return onTick(() => {
      const r = path.ownerSVGElement.parentElement.getBoundingClientRect();
      const goal = reduceMotion ? 1 : clamp((innerHeight * 0.9 - r.top) / (innerHeight * 0.6), 0, 1);
      s = reduceMotion ? 1 : s + (goal - s) * 0.12;
      if (Math.abs(goal - s) < 0.001) s = goal;
      const L = s * len;
      const p = path.getPointAtLength(L), p2 = path.getPointAtLength(Math.min(L + 2, len)), p0 = path.getPointAtLength(Math.max(L - 2, 0));
      const ang = (Math.atan2(p2.y - p0.y, p2.x - p0.x) * 180) / Math.PI;
      car.current.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      trail.current.style.strokeDashoffset = (len * (1 - s)).toFixed(1);
      mins.current.textContent = Math.round(35 * s);
      pin.current.classList.toggle('on', s > 0.97);
      if (!reduceMotion) trees.forEach((tr) => { const on = s >= tr.t; if (on !== tr.on) { tr.on = on; tr.el.style.transform = on ? 'scale(1)' : 'scale(0)'; } });
    });
  }, []);

  return (
    <Section id="place" className="grid gap-8 py-[clamp(48px,9vh,100px)]">
      <SectionHead eyebrow={t('p_e')} title={t('p_h')} />
      <Reveal className="panel grid items-center gap-7 overflow-hidden p-[clamp(18px,3vw,30px)] min-[900px]:grid-cols-[.62fr_1.38fr] min-[900px]:gap-9">
        <div className="grid min-w-0 gap-[18px]">
          <div className="flex items-baseline gap-3" role="img" aria-label="35 minutes">
            <b ref={mins} aria-hidden="true" className="gold-text text-[clamp(84px,14vw,168px)] leading-[.85] font-bold tracking-[-.05em] tabular-nums">35</b>
            <span aria-hidden="true" className="caps text-sm leading-none font-semibold tracking-[.2em]">{t('p_min')}</span>
          </div>
          <p className="lead">{t('p_sub')}</p>
          <div className="flex flex-wrap gap-3">
            <a className="btn btn-primary" target="_blank" rel="noopener" href={MAPS}>{t('btn_map')}</a>
            <a className="btn" target="_blank" rel="noopener" href={INSTAGRAM}><Icon name="i-ig" className="ico" /><span>{t('btn_ig')}</span></a>
          </div>
        </div>
        <svg className="route block h-auto w-full overflow-visible" viewBox="0 0 800 330" aria-hidden="true">
          <defs>
            <linearGradient id="hlg" x1="0" x2="1"><stop offset="0" stopColor="#dcc08a" stopOpacity=".95" /><stop offset="1" stopColor="#dcc08a" stopOpacity="0" /></linearGradient>
          </defs>
          <path className="contour" d="M0 110 C 150 50, 300 150, 450 95 S 700 20, 800 55" />
          <path className="contour" d="M0 190 C 120 150, 260 230, 420 150 S 680 120, 800 150" />
          <path className="contour" d="M0 300 C 160 240, 320 310, 480 255 S 700 235, 800 215" />
          <g ref={treesG} />
          <path ref={road} className="road" d={ROAD} />
          <path className="dash" d={ROAD} />
          <path ref={trail} className="trail" d={ROAD} style={{ strokeDashoffset: reduceMotion ? 0 : 9999 }} />
          <circle className="pulse" cx="70" cy="250" r="14" /><circle className="pulse b" cx="70" cy="250" r="14" />
          <circle className="dot" cx="70" cy="250" r="8" />
          <text x="70" y="284" textAnchor="middle">{t('p_surat')}</text>
          <g transform="translate(735 85)">
            <g ref={pin} className="pin">
              <circle className="pulse" cx="0" cy="0" r="14" /><circle className="pulse b" cx="0" cy="0" r="14" />
              <circle className="dot" cx="0" cy="0" r="9" />
              <use href="#chv" x="-22" y="-46" width="44" height="22" style={{ color: 'var(--color-gold)' }} />
              <text y="34" textAnchor="middle">{t('p_pin')}</text>
            </g>
          </g>
          <g ref={car}>
            <ellipse rx="26" ry="15" fill="var(--color-gold)" opacity=".28" />
            <path className="cone" d="M12 -5 L58 -20 L58 20 L12 5Z" fill="url(#hlg)" />
            <rect x="-13" y="-7" width="26" height="14" rx="6" fill="var(--color-gold)" />
            <rect x="-3" y="-5" width="9" height="10" rx="2.5" fill="var(--sheet)" />
          </g>
        </svg>
      </Reveal>
    </Section>
  );
}
