import { useState } from 'react';
import { useLang } from '../lib/i18n';
import { layoutChanged } from '../lib/skyStore';
import { pad } from '../lib/motion';
import Section, { SectionHead } from './Section';

// The full terms are long, so they load (and render) only when a section is opened.
let rulesPromise;
const loadRules = () => (rulesPromise ||= import('../data/rules').then((m) => m.RULES));

function RuleSection({ index, title }) {
  const [rules, setRules] = useState(null);
  const [open, setOpen] = useState(false);
  const r = rules?.[index];
  return (
    <details
      className="border-b border-line"
      onToggle={(e) => {
        const isOpen = e.currentTarget.open;
        setOpen(isOpen);
        if (isOpen && !rules) loadRules().then(setRules);
        setTimeout(layoutChanged, 50);
      }}
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-1 py-[18px] text-[17px] leading-[1.3] font-semibold">
        <span>
          <small className="mr-3 text-[11px] leading-none font-semibold tracking-[.14em] text-accent not-italic">{pad(index + 1)}</small>
          {title}
        </span>
      </summary>
      {open && r && (
        <>
          {r.n && <p className="px-1 pb-3 text-sm text-fg-soft">{r.n}</p>}
          <ol className="grid max-w-[80ch] list-decimal gap-2 pr-1 pb-[22px] pl-[22px] text-sm text-fg-soft">
            {r.i.map((item, j) => <li key={j}>{item}</li>)}
          </ol>
        </>
      )}
    </details>
  );
}

export default function Rules() {
  const { t, ruleTitles } = useLang();
  return (
    <Section id="rules" lazy className="grid gap-8 py-[clamp(48px,9vh,100px)]">
      <SectionHead eyebrow={t('r_e')} title={t('r_h')} lead={t('r_lead')} />
      <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3.5">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="panel grid gap-1.5 p-5">
            <b className="text-lg leading-[1.25] font-semibold">{t(`hl${i + 1}h`)}</b>
            <span className="text-sm text-fg-soft">{t(`hl${i + 1}p`)}</span>
          </li>
        ))}
      </ul>
      <SectionHead eyebrow={t('r_full')} small={t('r_full_n')} className="mt-3" />
      <div className="acc border-t border-line">
        {ruleTitles.map((title, i) => <RuleSection key={i} index={i} title={title} />)}
      </div>
    </Section>
  );
}
