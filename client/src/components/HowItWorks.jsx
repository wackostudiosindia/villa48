import { useLang } from '../lib/i18n';
import Section, { SectionHead } from './Section';
import Reveal from './Reveal';

export default function HowItWorks() {
  const { t } = useLang();
  return (
    <Section id="how" lazy className="grid gap-8 py-[clamp(48px,9vh,100px)]">
      <SectionHead eyebrow={t('h_e')} title={t('h_h')} />
      <ol className="steps grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-5">
        {[1, 2, 3, 4].map((n, i) => (
          <Reveal as="li" key={n} delay={i * 0.06} className="grid content-start gap-2 border-t border-gold pt-[18px]">
            <h3 className="text-sm leading-[1.4] font-semibold tracking-[.04em]">{t(`s${n}h`)}</h3>
            <p className="text-sm text-fg-soft">{t(`s${n}p`)}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
