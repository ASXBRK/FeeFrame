import { DEFAULT_SERVICES } from '../data/servicesLibrary';
import type { FeeReviewErrors, FeeReviewState } from '../types';
import { cardClass, errorClass, helperClass, inputClass, labelClass, sectionHeadingClass, sectionSubheadingClass } from './fieldStyles';

interface Props {
  state: FeeReviewState;
  set: <K extends keyof FeeReviewState>(field: K, value: FeeReviewState[K]) => void;
  toggleService: (bucket: 'next' | 'retrospective', serviceId: string) => void;
  errors: FeeReviewErrors;
  showErrors: boolean;
}

export default function ServicesNextPeriod({ state, set, toggleService, errors, showErrors }: Props) {
  return (
    <div className={cardClass} id="section-services">
      <div className="mb-4">
        <h3 className={sectionHeadingClass}>Services for the next 12 months</h3>
        <p className={sectionSubheadingClass}>Select what you’re committing to deliver. Add specifics in the free text.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DEFAULT_SERVICES.map(s => {
          const checked = state.selectedServiceIds.includes(s.id);
          return (
            <label
              key={s.id}
              className={`flex items-start gap-2 px-3 py-2 rounded-input border transition-colors cursor-pointer ${
                checked ? 'border-teal bg-teal-subtle' : 'border-light-border bg-white hover:bg-light-surface'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleService('next', s.id)}
                className="w-4 h-4 mt-0.5 rounded border-light-border text-teal focus:ring-teal flex-shrink-0"
              />
              <span className="text-sm text-dark">{s.label}</span>
            </label>
          );
        })}
      </div>

      <div className="mt-4">
        <label className={labelClass}>Custom or specific items</label>
        <textarea
          value={state.customServices}
          onChange={e => set('customServices', e.target.value)}
          rows={3}
          placeholder="One per line — e.g. SMSF strategy review, business succession discussion"
          className={inputClass}
        />
        <p className={helperClass}>Each line becomes a bullet on the consent document.</p>
      </div>

      {showErrors && errors.services && <p className={`${errorClass} mt-2`}>{errors.services}</p>}
    </div>
  );
}
