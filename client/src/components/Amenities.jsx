import { useLang } from '../lib/i18n';
import Section, { SectionHead } from './Section';
import Reveal from './Reveal';
import { Icon } from './Icon';

const ITEMS = [
  ['i-pool', 'a1'], ['i-lawn', 'a2'], ['i-bed', 'a3'], ['i-pot', 'a4'],
  ['i-tv', 'a5'], ['i-kids', 'a6'], ['i-sofa', 'a7'], ['i-disco', 'a8'],
];

export default function Amenities() {
  const { t } = useLang();
  return (
    <Section id="amenities" className="grid gap-8 py-[clamp(48px,9vh,100px)]">
      <SectionHead eyebrow={t('am_e')} title={t('am_h')} />
      <ul className="edge relative grid list-none grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] border-t border-l border-line bg-(image:--panel-grad)">
        {ITEMS.map(([icon, k]) => (
          <Reveal as="li" key={k} className="am-card grid min-w-0 content-start gap-2.5 border-r border-b border-line bg-panel px-3.5 py-4 transition-colors sm:px-[22px] sm:py-6 duration-500">
            <Icon name={icon} />
            <h3 className="text-base leading-[1.25] font-semibold sm:text-[19px]">{t(k + 'h')}</h3>
            <p className="text-[13px] leading-[1.5] text-fg-soft sm:text-sm">{t(k + 'p')}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
