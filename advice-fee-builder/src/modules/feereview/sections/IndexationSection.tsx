import { useState } from 'react';
import NumInput from '../../../components/shared/NumInput';
import { DEFAULT_CPI_RATE } from '../data/cpiRate';
import type { FeeReviewState } from '../types';
import { inputClassSm, labelClass, sectionHeadingClass } from './fieldStyles';

interface Props {
  state: FeeReviewState;
  set: <K extends keyof FeeReviewState>(field: K, value: FeeReviewState[K]) => void;
}

function formatAud(value: number): string {
  if (!Number.isFinite(value)) return '$0';
  return '$' + Math.round(value).toLocaleString('en-AU');
}

export default function IndexationSection({ state, set }: Props) {
  const [open, setOpen] = useState(false);

  const baseFee = state.retrospectiveFeesPaid;
  const suggestedFee = baseFee > 0 ? baseFee * (1 + DEFAULT_CPI_RATE) : 0;
  const cpiPct = (DEFAULT_CPI_RATE * 100).toFixed(1);

  return (
    <div className="bg-white rounded-card border border-light-border" id="section-indexation">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h3 className={sectionHeadingClass}>CPI indexation <span className="text-mid font-normal text-sm">(optional)</span></h3>
          <p className="text-xs text-mid mt-0.5">
            {open
              ? `Auto-suggest a CPI-indexed fee for the next period (currently ${cpiPct}%).`
              : state.indexationEnabled
                ? 'Indexation enabled — click to edit.'
                : 'Auto-suggest a CPI-indexed fee for the next period.'}
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
              checked={state.indexationEnabled}
              onChange={e => set('indexationEnabled', e.target.checked)}
              className="w-4 h-4 mt-1 rounded border-light-border text-teal focus:ring-teal"
              id="indexation-enable"
            />
            <label htmlFor="indexation-enable" className="text-sm font-medium text-dark cursor-pointer">
              Apply CPI indexation
            </label>
          </div>

          {state.indexationEnabled && (
            <>
              <div className="bg-light-surface rounded-input border border-light-border px-4 py-3 text-sm text-dark">
                <p>
                  Current CPI rate: <span className="font-medium">{cpiPct}%</span>{' '}
                  <span className="text-mid">— update <code>data/cpiRate.ts</code> when this changes.</span>
                </p>
              </div>

              {baseFee > 0 ? (
                <p className="text-sm text-dark">
                  Past period fee: <span className="font-medium">{formatAud(baseFee)}</span>{' '}
                  → suggested indexed fee:{' '}
                  <span className="font-semibold text-teal">{formatAud(suggestedFee)}</span>. Manual override below.
                </p>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  Enter past 12-month fees in the “Past 12 months” section to enable an indexation suggestion.
                </div>
              )}

              <div className="max-w-xs">
                <label className={labelClass}>Indexed fee for next period</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid">$</span>
                  <NumInput
                    value={state.indexedFeeOverride ?? Math.round(suggestedFee)}
                    onChange={v => set('indexedFeeOverride', v)}
                    min={0}
                    max={500000}
                    className={`${inputClassSm} w-40`}
                  />
                </div>
                <p className="text-xs text-mid mt-1">
                  Overrides the fixed annual fee on the consent document. Has no effect on percentage or subscription structures.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
