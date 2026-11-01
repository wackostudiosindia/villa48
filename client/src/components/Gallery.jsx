import { useState } from 'react';
import { useLang } from '../lib/i18n';
import { GALLERY, GALLERY_TABS } from '../data/gallery';
import Section, { SectionHead } from './Section';
import Reveal from './Reveal';
import Lightbox from './Lightbox';
import Img from './Img';
import { layoutChanged } from '../lib/skyStore';

/* Editorial grid: portrait photos span two rows, every seventh landscape photo is a large feature tile. */
export default function Gallery() {
  const { t } = useLang();
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState(null);
  const view = GALLERY.filter((g) => cat === 'all' || g.c === cat);

  const choose = (c) => { setCat(c); setTimeout(layoutChanged, 50); };

  return (
    <Section id="gallery" lazy className="grid gap-8 py-[clamp(48px,9vh,100px)]">
      <SectionHead eyebrow={t('g_e')} title={t('g_h')} />
      <Reveal
        role="group"
        aria-label="Gallery filter"
        className="no-scrollbar flex gap-2 max-[640px]:fade-x max-[640px]:-mx-4 max-[640px]:flex-nowrap max-[640px]:overflow-x-auto max-[640px]:px-4 min-[641px]:flex-wrap"
      >
        {GALLERY_TABS.map(([c, k]) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => choose(c)}
            className={`caps min-h-11 flex-none border border-line bg-field px-4 py-[13px] text-xs leading-none font-medium tracking-[.12em] text-fg transition-colors duration-200 ${cat === c ? 'is-on' : ''}`}
          >
            {t(k)}
          </button>
        ))}
      </Reveal>
      <div className="grid auto-rows-[27vw] grid-flow-dense grid-cols-2 gap-2 md:auto-rows-[min(17vw,220px)] md:grid-cols-3 md:gap-3.5">
        {view.map((g, i) => {
          const span = g.h > g.w ? 'row-span-2' : i % 7 === 0 ? 'col-span-2 row-span-2' : '';
          return (
            <button
              key={cat + g.s}
              type="button"
              aria-label={t(g.k)}
              onClick={() => setOpen(i)}
              data-cursor="view"
              className={`tile relative block h-full w-full cursor-zoom-in overflow-hidden bg-forest-deep ${span}`}
              style={{ '--gd': `${Math.min(i, 8) * 0.05}s` }}
            >
              <Img
                name={g.s}
                alt={t(g.k)}
                sizes={span.includes('col-span-2') ? '(min-width: 760px) 790px, 100vw' : '(min-width: 760px) 400px, 50vw'}
                className="h-full w-full object-cover"
                onLoad={(e) => e.currentTarget.classList.add('ok')}
                onError={(e) => e.currentTarget.classList.add('ok')}
                imgRef={(el) => el && el.complete && el.classList.add('ok')}
              />
              <span className="caps absolute inset-x-0 bottom-0 bg-linear-to-t from-[rgba(5,20,13,.78)] to-transparent px-3.5 pt-[34px] pb-3 text-left text-[11px] leading-[1.2] font-medium tracking-[.14em] text-cream">
                {t(g.k)}
              </span>
            </button>
          );
        })}
      </div>
      {open !== null && <Lightbox items={view} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </Section>
  );
}
