import type { FeeReviewState, FeeReviewErrors } from '../types';
import { cardClass, errorClass, helperClass, inputClass, labelClass, sectionHeadingClass, sectionSubheadingClass } from './fieldStyles';

interface Props {
  state: FeeReviewState;
  set: <K extends keyof FeeReviewState>(field: K, value: FeeReviewState[K]) => void;
  errors: FeeReviewErrors;
  showErrors: boolean;
}

export default function AdviserDetails({ state, set, errors, showErrors }: Props) {
  const err = (key: keyof FeeReviewErrors) => (showErrors ? errors[key] : undefined);
  return (
    <div className={cardClass} id="section-adviser">
      <div className="mb-4">
        <h3 className={sectionHeadingClass}>Adviser and practice</h3>
        <p className={sectionSubheadingClass}>Identifies who is providing the advice and under whose licence.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Adviser name</label>
          <input
            type="text"
            value={state.adviserName}
            onChange={e => set('adviserName', e.target.value)}
            className={inputClass}
          />
          {err('adviserName') && <p className={errorClass}>{err('adviserName')}</p>}
        </div>
        <div>
          <label className={labelClass}>
            Authorised representative number <span className="text-mid font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={state.arNumber}
            onChange={e => set('arNumber', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Licensee name</label>
          <input
            type="text"
            value={state.licenseeName}
            onChange={e => set('licenseeName', e.target.value)}
            className={inputClass}
          />
          {err('licenseeName') && <p className={errorClass}>{err('licenseeName')}</p>}
        </div>
        <div>
          <label className={labelClass}>AFSL number</label>
          <input
            type="text"
            value={state.afslNumber}
            onChange={e => set('afslNumber', e.target.value)}
            className={inputClass}
            inputMode="numeric"
          />
          {err('afslNumber') && <p className={errorClass}>{err('afslNumber')}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Practice name</label>
          <input
            type="text"
            value={state.practiceName}
            onChange={e => set('practiceName', e.target.value)}
            className={inputClass}
          />
          {err('practiceName') && <p className={errorClass}>{err('practiceName')}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Practice address</label>
          <textarea
            value={state.practiceAddress}
            onChange={e => set('practiceAddress', e.target.value)}
            rows={3}
            className={inputClass}
          />
          {err('practiceAddress') && <p className={errorClass}>{err('practiceAddress')}</p>}
        </div>
        <div>
          <label className={labelClass}>Adviser email</label>
          <input
            type="email"
            value={state.adviserEmail}
            onChange={e => set('adviserEmail', e.target.value)}
            className={inputClass}
          />
          {err('adviserEmail') && <p className={errorClass}>{err('adviserEmail')}</p>}
        </div>
        <div>
          <label className={labelClass}>
            Adviser phone <span className="text-mid font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={state.adviserPhone}
            onChange={e => set('adviserPhone', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <p className={helperClass}>In a future release these will save as a practice profile and reuse across documents.</p>
    </div>
  );
}
