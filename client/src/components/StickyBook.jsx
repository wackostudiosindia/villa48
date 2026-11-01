import { useEffect, useState } from 'react';
import { useLang } from '../lib/i18n';
import { useBooking } from '../lib/booking';
import { onTick } from '../lib/ticker';

/* Bottom "Book now" bar on phones, floating button on desktop. Hidden on the first screen and at the booking form. */
export default function StickyBook() {
  const { t } = useLang();
  const { openDrawer } = useBooking();
  const [atTop, setAtTop] = useState(true);
  const [atBooking, setAtBooking] = useState(false);

  useEffect(() => { let top = true; return onTick({ read: () => { top = scrollY < innerHeight * 0.55; }, write: () => setAtTop(top) }); }, []);
  useEffect(() => {
    const el = document.getElementById('booking');
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setAtBooking(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const off = atTop || atBooking;
  return (
    <div
      aria-hidden={off}
      className={`fixed inset-x-0 bottom-0 z-35 flex bg-bar px-4 pt-3 backdrop-blur-[14px] transition-[transform,opacity] duration-500 ease-out-soft motion-reduce:transition-none md:inset-x-auto md:right-6 md:bottom-6 md:bg-transparent md:p-0 md:backdrop-blur-none ${off ? 'sticky-off' : ''}`}
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom,0px))' }}
    >
      <button type="button" tabIndex={off ? -1 : 0} onClick={openDrawer} className="btn btn-primary flex-1 md:flex-none md:shadow-[0_12px_32px_rgba(0,0,0,.28)]">
        {t('btn_sticky')}
      </button>
    </div>
  );
}
