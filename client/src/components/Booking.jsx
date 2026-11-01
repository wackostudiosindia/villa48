import { useLang } from '../lib/i18n';
import { useBooking } from '../lib/booking';
import Section, { SectionHead } from './Section';
import Reveal from './Reveal';
import Calendar from './Calendar';
import GuestStepper from './GuestStepper';
import SendButtons from './SendButtons';

const OCCASIONS = ['o1', 'o2', 'o3', 'o4', 'o5'];
const EXTRAS = ['x1', 'x2', 'x3', 'x4'];
const chipSpan = 'block border border-line bg-field px-4 py-[13px] transition-colors duration-200';

export default function Booking() {
  const { t } = useLang();
  const b = useBooking();
  const panel = 'panel min-w-0 p-[clamp(18px,3vw,30px)]';

  return (
    <Section id="booking" lazy className="grid gap-8 py-[clamp(48px,9vh,100px)]">
      <SectionHead eyebrow={t('b_e')} title={t('b_h')} lead={t('b_lead')} />
      <div className="grid gap-9 xl:grid-cols-2 xl:items-start xl:gap-14">
        <Reveal className={panel}><Calendar /></Reveal>
        <Reveal delay={0.08} className={panel}>
          <form className="mt-5 grid gap-5" noValidate onSubmit={(e) => e.preventDefault()}>
            <div className="grid min-w-0 gap-2">
              <label className="label" htmlFor="f-name">{t('f_name')}</label>
              <input id="f-name" className="input" type="text" autoComplete="name" placeholder={t('f_name_ph')} value={b.name} onChange={(e) => b.setName(e.target.value)} />
            </div>
            <GuestStepper />
            <fieldset className="grid min-w-0 gap-2.5">
              <legend className="label mb-2.5">{t('f_occ')}</legend>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <label key={o} className="chip relative text-[13px] leading-[1.2] font-medium text-fg">
                    <input className="absolute inset-0 m-0 size-full cursor-pointer opacity-0" type="radio" name="occ" value={o} checked={b.occasion === o} onChange={() => b.setOccasion(o)} />
                    <span className={chipSpan}>{t(o)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="grid min-w-0 gap-2.5">
              <legend className="label mb-2.5">{t('f_extra')}</legend>
              <div className="flex flex-wrap gap-2">
                {EXTRAS.map((x) => (
                  <label key={x} className="chip relative text-[13px] leading-[1.2] font-medium text-fg">
                    <input className="absolute inset-0 m-0 size-full cursor-pointer opacity-0" type="checkbox" checked={b.extras.includes(x)} onChange={() => b.toggleExtra(x)} />
                    <span className={chipSpan}>{t(x)}</span>
                  </label>
                ))}
              </div>
              <span className="text-[13px] text-fg-soft">{t('f_extra_n')}</span>
            </fieldset>
            <div className="grid min-w-0 gap-2">
              <label className="label" htmlFor="f-note">{t('f_note')}</label>
              <textarea id="f-note" className="input min-h-[84px] resize-y" placeholder={t('f_note_ph')} value={b.note} onChange={(e) => b.setNote(e.target.value)} />
            </div>
            <div className="grid min-w-0 gap-2">
              <label className="label" htmlFor="msg">{t('f_msg')}</label>
              <textarea id="msg" className="input min-h-[176px] text-[13px] leading-[1.55] whitespace-pre-wrap" readOnly value={b.message} />
            </div>
            <SendButtons withCopy />
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
