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
      <ul className="edge relative grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] border-t border-l border-line bg-(image:--panel-grad)">
        {ITEMS.map(([icon, k]) => (
          <Reveal as="li" key={k} className="am-card grid min-w-0 content-start gap-2.5 border-r border-b border-line bg-panel px-[22px] py-6 transition-colors duration-500">
            <Icon name={icon} />
            <h3 className="text-[19px] leading-[1.25] font-semibold">{t(k + 'h')}</h3>
            <p className="text-sm text-fg-soft">{t(k + 'p')}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
