import { useState } from 'react';
import NumInput from '../../../components/shared/NumInput';
import { DEFAULT_SERVICES } from '../data/servicesLibrary';
import type { FeeReviewState } from '../types';
import { inputClass, inputClassSm, labelClass, sectionHeadingClass } from './fieldStyles';

interface Props {
  state: FeeReviewState;
  set: <K extends keyof FeeReviewState>(field: K, value: FeeReviewState[K]) => void;
  toggleService: (bucket: 'next' | 'retrospective', serviceId: string) => void;
}

export default function RetrospectiveSection({ state, set, toggleService }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-card border border-light-border" id="section-retrospective">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h3 className={sectionHeadingClass}>Past 12 months <span className="text-mid font-normal text-sm">(optional)</span></h3>
          <p className="text-xs text-mid mt-0.5">
            {open
              ? 'Including this helps the client see what they paid and received in the past year.'
              : state.retrospectiveEnabled
                ? 'Optional retrospective is enabled — click to edit.'
                : 'Optional. Including this helps the client see what they paid and received in the past year.'}
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-mid transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-light-border pt-4 space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={state.retrospectiveEnabled}
              onChange={e => set('retrospectiveEnabled', e.target.checked)}
              className="w-4 h-4 mt-1 rounded border-light-border text-teal focus:ring-teal"
              id="retro-enable"
            />
            <label htmlFor="retro-enable" className="text-sm font-medium text-dark cursor-pointer">
              Include past 12 months in the consent document
            </label>
          </div>

          {state.retrospectiveEnabled && (
            <>
              <div className="max-w-xs">
                <label className={labelClass}>Fees paid in past 12 months</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid">$</span>
                  <NumInput
                    value={state.retrospectiveFeesPaid}
                    onChange={v => set('retrospectiveFeesPaid', v)}
                    min={0}
                    max={500000}
                    className={`${inputClassSm} w-40`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Services delivered</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEFAULT_SERVICES.map(s => {
                    const checked = state.retrospectiveServiceIds.includes(s.id);
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
                          onChange={() => toggleService('retrospective', s.id)}
                          className="w-4 h-4 mt-0.5 rounded border-light-border text-teal focus:ring-teal flex-shrink-0"
                        />
                        <span className="text-sm text-dark">{s.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>Custom items delivered</label>
                <textarea
                  value={state.retrospectiveCustomServices}
                  onChange={e => set('retrospectiveCustomServices', e.target.value)}
                  rows={3}
                  placeholder="One per line"
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
