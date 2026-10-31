import { useLang } from '../lib/i18n';
import Section from './Section';
import Reveal from './Reveal';
import Frame from './Frame';

/* One time-of-day chapter: text on one side, framed photo on the other, and a link to the next chapter. */
export default function Chapter({ id, flip, eyebrow, title, body, photo, next }) {
  const { t } = useLang();
  return (
    <Section id={id} className="grid items-center gap-[34px] py-[clamp(48px,10vh,110px)] ch:grid-cols-2 ch:gap-20">
      <Reveal className="flex min-w-0 flex-col gap-[18px]">
        <span className="eyebrow halo">{t(eyebrow)}</span>
        <h2 className="halo">{t(title)}</h2>
        <p className="lead halo">{t(body)}</p>
        {next && (
          <a href={`#${next.href}`} className="next caps halo mt-2.5 inline-flex w-max max-w-full items-center gap-3 text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-fg-soft no-underline">
            <span className="text-accent">{t('nx')}</span>
            <b>{t(next.label)}</b>
            <i className="next-line block h-px w-[34px] bg-linear-to-r from-gold to-gold-light" />
            <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3 rotate-90 fill-none stroke-accent stroke-[1.6]">
              <path d="M2 6h8M7 3l3 3-3 3" />
            </svg>
          </a>
        )}
      </Reveal>
      <Reveal delay={0.1} className={flip ? 'ch:-order-1' : ''}>
        <Frame {...photo} caption={t(photo.caption)} />
      </Reveal>
    </Section>
  );
}
