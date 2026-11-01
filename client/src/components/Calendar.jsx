import { useEffect, useState } from 'react';
import { useLang } from '../lib/i18n';
import { useBooking } from '../lib/booking';
import { isoDate } from '../lib/motion';

export default function Calendar() {
  const { t, fmt } = useLang();
  const { today, booked, selected, setSelected, viewMonth, setViewMonth, formatSelected } = useBooking();
  // The calendar depends on today's date, so it's drawn in the visitor's browser, not in the pre-rendered page.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-[470px]" aria-hidden="true" />;

  const y = viewMonth.getFullYear();
  const m = viewMonth.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7; // weeks start on Monday
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const atFirst = y === today.getFullYear() && m === today.getMonth();
  const atLast = viewMonth >= new Date(today.getFullYear(), today.getMonth() + 11, 1);
  const shift = (d) => setViewMonth(new Date(y, m + d, 1));
  const navBtn = 'size-[46px] border border-line bg-field text-xl leading-none text-fg disabled:cursor-not-allowed disabled:opacity-30';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button type="button" className={navBtn} aria-label="Previous month" disabled={atFirst} onClick={() => shift(-1)}>‹</button>
        <b className="text-xl leading-[1.2] font-semibold" aria-live="polite">{fmt(viewMonth, { month: 'long', year: 'numeric' })}</b>
        <button type="button" className={navBtn} aria-label="Next month" disabled={atLast} onClick={() => shift(1)}>›</button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="py-1.5 text-center text-[10px] leading-none font-semibold tracking-[.1em] text-fg-soft uppercase">
            {fmt(new Date(2024, 0, 1 + i), { weekday: 'narrow' })}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: lead }, (_, i) => <div key={'b' + i} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(y, m, i + 1);
          const key = isoDate(d);
          const isBooked = booked.includes(key);
          const past = d < today;
          const weekend = d.getDay() === 0 || d.getDay() === 6;
          const isSel = selected === key;
          const isToday = d.getTime() === today.getTime();
          return (
            <button
              key={key}
              type="button"
              disabled={past || isBooked}
              aria-pressed={isSel}
              aria-label={fmt(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + (isBooked ? ' – ' + t('lg_b') : '')}
              onClick={() => setSelected(key)}
              className={`day relative aspect-square min-h-10 border bg-field text-[15px] leading-none font-medium text-fg tabular-nums transition-[background-color,transform] duration-200 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-fg-soft disabled:opacity-40 ${
                isToday ? 'border-accent' : 'border-transparent'
              } ${weekend ? 'we' : ''} ${isBooked ? 'booked' : ''} ${isSel ? 'is-on' : ''}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-[18px] gap-y-2 text-xs text-fg-soft">
        <span className="inline-flex items-center gap-[7px]"><i className="inline-block size-3.5 border border-line bg-field" />{t('lg_a')}</span>
        <span className="inline-flex items-center gap-[7px]"><i className="swatch-booked inline-block size-3.5 border border-line" />{t('lg_b')}</span>
        <span className="inline-flex items-center gap-[7px]"><i className="inline-block size-3.5 border border-cta bg-cta" />{t('lg_s')}</span>
        <span className="inline-flex items-center gap-[7px]"><i className="swatch-we inline-block size-3.5" />{t('lg_w')}</span>
      </div>
      <p className="mt-[18px] border-t border-line pt-4 text-lg leading-[1.4] font-semibold" aria-live="polite">
        {selected ? t('pick_one').replace('{d}', formatSelected(selected)) : t('pick_none')}
      </p>
      <p className="mt-2.5 text-[13px] text-fg-soft">{t('cal_note')}</p>
    </div>
  );
}
