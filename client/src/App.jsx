import { lazy, Suspense } from 'react';
import { Sprite } from './components/Icon';
import Intro from './components/Intro';
import Sky from './components/Sky';
import Cursor from './components/Cursor';
import Header from './components/Header';
import Thread from './components/Thread';
import Hero from './components/Hero';
import Chapter from './components/Chapter';
import StickyBook from './components/StickyBook';
import QuickBooking from './components/QuickBooking';

// Below the chapters: pre-rendered HTML, hydrated as separate chunks after the first screen.
const BelowFold = lazy(() => import('./components/BelowFold'));
const Footer = lazy(() => import('./components/Footer'));

/* One scroll from morning to night: four time-of-day chapters, then the practical sections. */
const CHAPTERS = [
  { id: 'morning', eyebrow: 'c1t', title: 'c1h', body: 'c1p', next: { href: 'afternoon', label: 'c2t' },
    photo: { name: 'entrance-4x3', alt: 'Entrance with potted plants and yellow wall', caption: 'cap_ent' } },
  { id: 'afternoon', flip: true, eyebrow: 'c2t', title: 'c2h', body: 'c2p', next: { href: 'evening', label: 'c3t' },
    photo: { name: 'pool-4x3', alt: 'Glass-fenced swimming pool beside a green lawn', caption: 'cap_pool' } },
  { id: 'evening', eyebrow: 'c3t', title: 'c3h', body: 'c3p', next: { href: 'night', label: 'c4t' },
    photo: { name: 'swing-4x3', alt: 'Living area with a hanging swing chair and blue sofas', caption: 'cap_swing' } },
  { id: 'night', flip: true, eyebrow: 'c4t', title: 'c4h', body: 'c4p', next: { href: 'amenities', label: 'am_e' },
    photo: { name: 'theatre-4x3', alt: 'Home theatre with a projector screen and soft lights', caption: 'k_theatre' } },
];

export default function App() {
  return (
    <>
      <Sprite />
      <Intro />
      <Sky />
      <Cursor />
      <Header />
      <main id="top" className="relative z-1">
        <Thread />
        <Hero />
        {CHAPTERS.map((c) => <Chapter key={c.id} {...c} />)}
        <Suspense fallback={null}>
          <BelowFold />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <StickyBook />
      <QuickBooking />
    </>
  );
}
