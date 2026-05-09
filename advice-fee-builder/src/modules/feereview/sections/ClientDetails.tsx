import type { FeeReviewState, FeeReviewErrors } from '../types';
import { cardClass, errorClass, helperClass, inputClass, labelClass, sectionHeadingClass, sectionSubheadingClass } from './fieldStyles';

interface Props {
  state: FeeReviewState;
  set: <K extends keyof FeeReviewState>(field: K, value: FeeReviewState[K]) => void;
  errors: FeeReviewErrors;
  showErrors: boolean;
}

export default function ClientDetails({ state, set, errors, showErrors }: Props) {
  return (
    <div className={cardClass} id="section-client">
      <div className="mb-4">
        <h3 className={sectionHeadingClass}>Client</h3>
        <p className={sectionSubheadingClass}>Identifies who the consent is being sought from.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Client name(s)</label>
          <input
            type="text"
            value={state.clientName}
            onChange={e => set('clientName', e.target.value)}
            placeholder="e.g. John & Jane Smith"
            className={inputClass}
          />
          <p className={helperClass}>Use “&amp;” to join joint clients.</p>
          {showErrors && errors.clientName && <p className={errorClass}>{errors.clientName}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Client reference / ID <span className="text-mid font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={state.clientReference}
            onChange={e => set('clientReference', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
