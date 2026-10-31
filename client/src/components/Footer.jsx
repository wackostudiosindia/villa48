import { useLang } from '../lib/i18n';
import { INSTAGRAM, MAPS, PHONE_DISPLAY, WHATSAPP } from '../lib/site';
import { Icon } from './Icon';

export default function Footer() {
  const { t } = useLang();
  const wa = `https://wa.me/${WHATSAPP}`;
  return (
    <footer className="relative z-1 mt-6 border-t border-line pt-14 pb-[140px]">
      <div className="mx-auto grid max-w-[1180px] gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <img className="tone-d h-[84px] w-auto" src="/img/word_dark.png" width="520" height="235" alt="Villa 48" />
          <img className="tone-n h-[84px] w-auto" src="/img/word_light.png" width="520" height="235" alt="Villa 48" />
        </div>
        <div>
          <span className="eyebrow">{t('ft_wa')}</span>
          <p className="mt-2 text-xl leading-[1.3] font-medium tracking-[.03em] tabular-nums select-all">{PHONE_DISPLAY}</p>
          <p className="mt-1.5 text-[13px] text-fg-soft">{t('ft_note')}</p>
          <div className="mt-4 flex gap-2.5">
            <a className="grid size-[46px] place-items-center rounded-full bg-[#25D366] transition-transform hover:-translate-y-[3px] hover:scale-105" target="_blank" rel="noopener" href={wa} aria-label="WhatsApp">
              <Icon name="i-wa" className="size-[23px] fill-white" />
            </a>
            <a className="grid size-[46px] place-items-center rounded-full bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] transition-transform hover:-translate-y-[3px] hover:scale-105" target="_blank" rel="noopener" href={INSTAGRAM} aria-label="Instagram">
              <Icon name="i-ig" className="size-[23px] fill-white" />
            </a>
          </div>
        </div>
        <div className="grid content-start gap-2 text-sm [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a]:underline [&_a]:underline-offset-4">
          <span className="eyebrow">{t('ft_f')}</span>
          <a target="_blank" rel="noopener" href={INSTAGRAM}><Icon name="i-ig" className="size-4 fill-current" />@villa48surat</a>
          <a target="_blank" rel="noopener" href={wa}><Icon name="i-wa" className="size-4 fill-current" />WhatsApp</a>
          <a target="_blank" rel="noopener" href={MAPS}>{t('btn_map')}</a>
          <a href="#rules">{t('r_h')}</a>
        </div>
      </div>
    </footer>
  );
}
