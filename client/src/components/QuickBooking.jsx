import { useEffect, useRef } from 'react';
import { useLang } from '../lib/i18n';
import { useBooking } from '../lib/booking';
import { isoDate, reduceMotion } from '../lib/motion';
import GuestStepper from './GuestStepper';
import SendButtons from './SendButtons';

/* Side drawer (bottom sheet on phones) for booking in a few taps: next free dates, guests, send. */
export default function QuickBooking() {
  const { t, fmt } = useLang();
  const { drawerOpen, closeDrawer, nextFreeDates, selected, pickDate } = useBooking();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const last = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && closeDrawer();
    addEventListener('keydown', onKey);
    return () => { removeEventListener('keydown', onKey); last?.focus?.(); };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  const fullCalendar = () => {
    closeDrawer();
    document.getElementById('booking')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50" id="quick-booking">
      <div className="absolute inset-0 animate-[fadeIn_.35s_ease_both] bg-[rgba(5,20,13,.55)] backdrop-blur-[3px]" onClick={closeDrawer} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="dr-title"
        className="absolute inset-y-0 right-0 grid w-[min(420px,100%)] animate-[drawerIn_.35s_cubic-bezier(.2,.8,.2,1)] content-start gap-[22px] overflow-y-auto border-l border-line bg-sheet text-fg max-[640px]:top-auto max-[640px]:max-h-[92%] max-[640px]:animate-[drawerUp_.35s_cubic-bezier(.2,.8,.2,1)] max-[640px]:border-t-2 max-[640px]:border-l-0 max-[640px]:border-t-gold"
        style={{ padding: 'calc(20px + env(safe-area-inset-top,0px)) max(20px,env(safe-area-inset-right,0px)) calc(24px + env(safe-area-inset-bottom,0px)) 22px' }}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 id="dr-title" className="text-[22px] leading-[1.2] font-bold">{t('dr_h')}</h3>
          <button ref={closeRef} type="button" aria-label="Close" onClick={closeDrawer} className="size-11 border border-line bg-transparent text-2xl leading-none text-fg">×</button>
        </div>
        <div className="grid min-w-0 gap-2">
          <span className="label">{t('dr_dates')}</span>
          <div className="flex flex-wrap gap-2">
            {nextFreeDates.map((d) => {
              const key = isoDate(d);
              return (
                <button key={key} type="button" aria-pressed={selected === key} onClick={() => pickDate(key)}
                  className={`min-h-11 border border-line bg-field px-3.5 py-3 text-[13px] leading-[1.2] font-medium text-fg ${selected === key ? 'is-on' : ''}`}>
                  {fmt(d, { weekday: 'short', day: 'numeric', month: 'short' })}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={fullCalendar} className="justify-self-start bg-transparent py-2 text-[13px] leading-[1.2] font-semibold text-accent underline underline-offset-4">
            {t('dr_more')}
          </button>
        </div>
        <GuestStepper />
        <SendButtons onRules={closeDrawer} />
      </aside>
    </div>
  );
}
