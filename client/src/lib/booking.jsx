import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLang } from './i18n';
import { EMAIL, MAX_GUESTS, WHATSAPP } from './site';
import { clamp, isoDate } from './motion';

/* Shared booking state: the calendar, the enquiry form, the quick-booking drawer and the sticky button all use it. */
const BookingContext = createContext(null);

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function BookingProvider({ children }) {
  const { t, fmt } = useLang();
  const [today] = useState(startOfToday);
  const [booked, setBooked] = useState([]);
  const [selected, setSelected] = useState(null); // 'YYYY-MM-DD'
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [guests, setGuestsRaw] = useState(12);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [occasion, setOccasion] = useState('o1');
  const [extras, setExtras] = useState([]);
  const [accepted, setAccepted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Booked dates come from the Express API (server/data/availability.json).
  useEffect(() => {
    let alive = true;
    fetch('/api/availability')
      .then((r) => (r.ok ? r.json() : { booked: [] }))
      .then((d) => alive && Array.isArray(d.booked) && setBooked(d.booked))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const setGuests = useCallback((fn) => setGuestsRaw((g) => clamp(typeof fn === 'function' ? fn(g) : fn, 1, MAX_GUESTS)), []);
  const toggleExtra = useCallback((x) => setExtras((xs) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x])), []);

  const pickDate = useCallback((key) => {
    setSelected(key);
    const d = new Date(key + 'T00:00:00');
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, []);

  const formatSelected = useCallback(
    (key) => fmt(new Date(key + 'T00:00:00'), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    [fmt],
  );

  const message = useMemo(() => {
    const lines = [t('msg')];
    if (name.trim()) lines.push(`${t('m_name')}: ${name.trim()}`);
    if (selected) lines.push(`${t('m_in')}: ${formatSelected(selected)}`);
    lines.push(`${t('m_g')}: ${guests}`);
    if (occasion) lines.push(`${t('m_o')}: ${t(occasion)}`);
    if (extras.length) lines.push(`${t('m_x')}: ${extras.map(t).join(', ')}`);
    if (note.trim()) lines.push(`${t('m_n')}: ${note.trim()}`);
    lines.push(t('m_end'));
    return lines.join('\n');
  }, [t, name, selected, guests, occasion, extras, note, formatSelected]);

  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
  const mailUrl = `mailto:${EMAIL}?subject=${encodeURIComponent('Villa 48 booking enquiry' + (selected ? ' - ' + selected : ''))}&body=${encodeURIComponent(message)}`;

  /* Returns the status message key that blocks sending, or null when the enquiry can go. */
  const blocker = !selected ? 'st_date' : !accepted ? 'st_ack' : null;

  const nextFreeDates = useMemo(() => {
    const list = [];
    const d = new Date(today);
    for (let i = 0; list.length < 6 && i < 200; i++) {
      if (!booked.includes(isoDate(d))) list.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return list;
  }, [today, booked]);

  const value = {
    today, booked, selected, pickDate, setSelected, viewMonth, setViewMonth,
    guests, setGuests, name, setName, note, setNote, occasion, setOccasion, extras, toggleExtra,
    accepted, setAccepted, message, waUrl, mailUrl, blocker, nextFreeDates, formatSelected,
    drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
  };
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export const useBooking = () => useContext(BookingContext);
