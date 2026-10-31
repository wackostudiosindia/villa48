import { useLang } from '../lib/i18n';
import { WHATSAPP } from '../lib/site';
import Section from './Section';
import Reveal from './Reveal';
import { Icon } from './Icon';

/* The last scene before the footer: one more invitation to book. */
export default function Closing() {
  const { t } = useLang();
  return (
    <Section id="end" className="grid justify-items-center gap-5 pt-[clamp(120px,20vh,200px)] pb-[clamp(30px,6vh,60px)] text-center">
      <Reveal><Icon name="chv" className="chev h-[22px] w-11" /></Reveal>
      <Reveal as="span" className="eyebrow halo after:ml-3 after:inline-block after:h-px after:w-7 after:bg-gold after:align-middle">{t('end_e')}</Reveal>
      <Reveal as="h2" delay={0.06} className="halo max-w-[16ch] text-[clamp(32px,5vw,62px)]">{t('end_h')}</Reveal>
      <Reveal as="p" delay={0.12} className="lead halo mx-auto">{t('end_p')}</Reveal>
      <Reveal delay={0.18} className="mt-2 flex flex-wrap justify-center gap-3">
        <a className="btn btn-primary" href="#booking">{t('btn_dates')}</a>
        <a className="btn" target="_blank" rel="noopener" href={`https://wa.me/${WHATSAPP}`}><Icon name="i-wa" className="ico" /><span>WhatsApp</span></a>
      </Reveal>
    </Section>
  );
}
