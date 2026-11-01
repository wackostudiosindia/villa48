import { useLang } from '../lib/i18n';
import Reveal from './Reveal';
import Frame from './Frame';
import Img from './Img';

export default function Hero() {
  const { t } = useLang();
  const stats = [['35', 'st1'], ['20', 'st2'], ['1', 'st3']];
  return (
    <section className="hero lit relative z-1 mx-auto grid max-w-[1180px] items-center gap-10 pt-[104px] pb-[clamp(48px,8vh,96px)] lg:grid-cols-[1.05fr_.95fr] lg:gap-[72px] lg:pt-[120px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Reveal>
          <Img name="word_dark" sizes="133px" eager className="tone-d h-[52px] w-auto sm:h-[60px]" alt="Villa 48, Farm Estate Retreat" />
          <Img name="word_light" sizes="133px" className="tone-n h-[52px] w-auto sm:h-[60px]" alt="Villa 48, Farm Estate Retreat" />
        </Reveal>
        <Reveal as="h1" delay={0.08} className="halo">
          {t('h1a')} <em className="gold-text">{t('h1b')}</em>
        </Reveal>
        <Reveal as="p" delay={0.16} className="lead halo">{t('hero_lead')}</Reveal>
        <Reveal delay={0.22} className="flex flex-wrap gap-3">
          <a className="btn btn-primary max-sm:flex-[1_1_100%]" href="#booking">{t('btn_dates')}</a>
          <a className="btn max-sm:flex-[1_1_100%]" href="#morning">{t('btn_story')}</a>
        </Reveal>
        <Reveal as="dl" delay={0.28} className="halo mt-2 grid max-w-[620px] grid-cols-3 border-t border-line">
          {stats.map(([n, k], i) => (
            <div key={k} className={`min-w-0 pt-[18px] pr-2.5 ${i ? 'border-l border-line pl-[18px]' : ''}`}>
              <dt className="gold-text text-[clamp(28px,3.6vw,42px)] leading-none font-bold tracking-[-.03em]">{n}</dt>
              <dd className="mt-2 text-[12.5px] leading-[1.4] text-fg-soft">{t(k)}</dd>
            </div>
          ))}
        </Reveal>
      </div>
      <Reveal delay={0.12}>
        <Frame name="exterior-hero" alt="Villa 48 farmhouse front with yellow wall and palms" ratio="aspect-[4/5]" sizes="(min-width: 920px) 520px, calc(100vw - 46px)" parallax={false} eager priority>
          <div className="absolute -bottom-[8%] -left-[4%] z-3 aspect-square w-[44%] overflow-hidden border-[6px] border-bar shadow-[0_20px_40px_rgba(0,0,0,.25)] transition-[border-color] duration-500 sm:-left-[8%]">
            <Img name="poollawn-square" sizes="(min-width: 920px) 230px, 45vw" className="h-full w-full object-cover" alt="Swimming pool and lawn" />
          </div>
        </Frame>
      </Reveal>
      <Reveal as="a" href="#morning" delay={0.4} className="cue caps halo col-span-full mt-1 grid justify-items-center gap-3 justify-self-center text-[10.5px] leading-none font-semibold tracking-[.24em] text-fg-soft no-underline">
        <span>{t('cue')}</span>
        <i className="cue-line relative h-[46px] w-px overflow-hidden bg-linear-to-b from-gold to-transparent" />
      </Reveal>
    </section>
  );
}
