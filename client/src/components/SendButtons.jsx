import { useState } from 'react';
import { useLang } from '../lib/i18n';
import { useBooking } from '../lib/booking';
import { Icon } from './Icon';

/* WhatsApp and email buttons. They refuse to send until a date is picked and the house rules are accepted. */
export default function SendButtons({ withCopy = false, onRules }) {
  const { t } = useLang();
  const { waUrl, mailUrl, blocker, message, accepted, setAccepted } = useBooking();
  const [status, setStatus] = useState('');

  const guard = (okKey) => (e) => {
    if (blocker) { e.preventDefault(); setStatus(t(blocker)); return; }
    setStatus(t(okKey));
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setStatus(t('st_copied')); }
    catch { setStatus(t('st_sel')); }
  };

  return (
    <>
      <label className="grid grid-cols-[24px_1fr] items-start gap-3 text-sm leading-normal text-fg">
        <input type="checkbox" className="mt-px size-[22px] accent-forest in-data-[tone=night]:accent-gold-light" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); setStatus(''); }} />
        <span>{t('ack1')} <a href="#rules" onClick={onRules} className="text-accent">{t('ack2')}</a></span>
      </label>
      <div className="flex flex-wrap gap-3">
        <a className="btn btn-primary" target="_blank" rel="noopener" href={waUrl} onClick={guard('st_open')}>
          <Icon name="i-wa" className="ico" /><span>{t('btn_wa')}</span>
        </a>
        <a className="btn" href={mailUrl} onClick={guard('st_mail')}>
          <Icon name="i-mail" className="ico" style={{ fill: 'none' }} /><span>{t('btn_mail')}</span>
        </a>
        {withCopy && <button type="button" className="btn" onClick={copy}>{t('btn_copy')}</button>}
      </div>
      {withCopy && <p className="text-[13px] text-fg-soft">{t('mail_note')}</p>}
      <p className="min-h-[1.4em] text-[13px] font-medium text-accent" role="status">{status}</p>
    </>
  );
}
