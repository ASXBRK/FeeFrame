import type { FeeReviewErrors, FeeReviewState, FeeReviewWarnings } from '../types';
import { cardClass, errorClass, helperClass, inputClass, labelClass, sectionHeadingClass, sectionSubheadingClass } from './fieldStyles';

interface Props {
  state: FeeReviewState;
  set: <K extends keyof FeeReviewState>(field: K, value: FeeReviewState[K]) => void;
  errors: FeeReviewErrors;
  warnings: FeeReviewWarnings;
  showErrors: boolean;
}

export default function ReferenceDate({ state, set, errors, warnings, showErrors }: Props) {
  return (
    <div className={cardClass} id="section-reference-date">
      <div className="mb-4">
        <h2 className={sectionHeadingClass}>Reference date</h2>
        <p className={sectionSubheadingClass}>The date the new 12-month consent period applies up to.</p>
      </div>
      <div className="max-w-xs">
        <label className={labelClass}>Reference date</label>
        <input
          type="date"
          value={state.referenceDate}
          onChange={e => set('referenceDate', e.target.value)}
          className={inputClass}
        />
        <p className={helperClass}>
          Consent expires 150 days after this date. Replaces the old anniversary date under DBFO reforms.
        </p>
        {showErrors && errors.referenceDate && <p className={errorClass}>{errors.referenceDate}</p>}
        {warnings.referenceDate && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            {warnings.referenceDate}
          </div>
        )}
      </div>
    </div>
  );
}
