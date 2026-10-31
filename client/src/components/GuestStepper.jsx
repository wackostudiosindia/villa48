import { useId } from 'react';
import { useLang } from '../lib/i18n';
import { useBooking } from '../lib/booking';

export default function GuestStepper() {
  const { t } = useLang();
  const { guests, setGuests } = useBooking();
  const id = useId();
  const btn = 'size-[50px] bg-transparent text-2xl leading-none text-fg';
  return (
    <div className="grid min-w-0 gap-2">
      <span className="label" id={id}>{t('f_guests')}</span>
      <div className="inline-flex w-max items-center border border-line bg-field" role="group" aria-labelledby={id}>
        <button type="button" className={btn} aria-label="−" onClick={() => setGuests((g) => g - 1)}>−</button>
        <output className="min-w-[60px] text-center text-2xl leading-none font-semibold tabular-nums" aria-live="polite">{guests}</output>
        <button type="button" className={btn} aria-label="+" onClick={() => setGuests((g) => g + 1)}>+</button>
      </div>
      <span className="text-[13px] text-fg-soft">{t('f_max')}</span>
    </div>
  );
}
