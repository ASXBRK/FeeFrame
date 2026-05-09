import NumInput from '../../../components/shared/NumInput';
import Toggle from '../../../components/shared/Toggle';
import type { FeeReviewErrors, FeeReviewState, FeeStructure, Frequency } from '../types';
import { cardClass, errorClass, inputClassSm, labelClass, sectionHeadingClass, sectionSubheadingClass } from './fieldStyles';

interface Props {
  state: FeeReviewState;
  set: <K extends keyof FeeReviewState>(field: K, value: FeeReviewState[K]) => void;
  errors: FeeReviewErrors;
  showErrors: boolean;
}

const STRUCTURES: ReadonlyArray<{ value: FeeStructure; label: string }> = [
  { value: 'fixed',        label: 'Fixed dollar fee' },
  { value: 'percentage',   label: '% of FUA' },
  { value: 'subscription', label: 'Subscription' },
];

const FREQUENCIES: ReadonlyArray<{ value: Frequency; label: string }> = [
  { value: 'annual',    label: 'Annual' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly',   label: 'Monthly' },
];

export default function FeesNextPeriod({ state, set, errors, showErrors }: Props) {
  return (
    <div className={cardClass} id="section-fees">
      <div className="mb-4">
        <h2 className={sectionHeadingClass}>Fees for the next 12 months</h2>
        <p className={sectionSubheadingClass}>Choose how the fee is structured. Only one structure applies per consent.</p>
      </div>

      {/* Segmented structure selector */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-xs text-mid mr-1">Structure</span>
        {STRUCTURES.map(s => (
          <button
            key={s.value}
            type="button"
            onClick={() => set('feeStructure', s.value)}
            className={`px-3 py-1.5 rounded-input text-sm font-medium transition-colors ${
              state.feeStructure === s.value
                ? 'bg-teal text-white'
                : 'bg-light-surface text-dark hover:bg-light-border'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Conditional inputs */}
      {state.feeStructure === 'fixed' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Annual fee (incl GST)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-mid">$</span>
              <NumInput
                value={state.fixedAmount}
                onChange={v => set('fixedAmount', v)}
                min={0}
                max={500000}
                className={`${inputClassSm} w-40`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Charged</label>
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => set('fixedFrequency', f.value)}
                  className={`px-3 py-1.5 rounded-input text-sm font-medium transition-colors ${
                    state.fixedFrequency === f.value
                      ? 'bg-teal text-white'
                      : 'bg-light-surface text-dark hover:bg-light-border'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {state.feeStructure === 'percentage' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Percentage of FUA</label>
            <div className="flex items-center gap-2">
              <NumInput
                value={state.percentageRate}
                onChange={v => set('percentageRate', v)}
                min={0}
                max={5}
                className={`${inputClassSm} w-24`}
              />
              <span className="text-sm text-mid">%</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Current FUA balance</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-mid">$</span>
              <NumInput
                value={state.fuaBalance}
                onChange={v => set('fuaBalance', v)}
                min={0}
                max={50000000}
                className={`${inputClassSm} w-40`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Charged</label>
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => set('percentageFrequency', f.value)}
                  className={`px-3 py-1.5 rounded-input text-sm font-medium transition-colors ${
                    state.percentageFrequency === f.value
                      ? 'bg-teal text-white'
                      : 'bg-light-surface text-dark hover:bg-light-border'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {state.feeStructure === 'subscription' && (
        <div>
          <label className={labelClass}>Monthly subscription (incl GST)</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-mid">$</span>
            <NumInput
              value={state.subscriptionMonthly}
              onChange={v => set('subscriptionMonthly', v)}
              min={0}
              max={50000}
              className={`${inputClassSm} w-40`}
            />
            <span className="text-sm text-mid">/ month</span>
          </div>
        </div>
      )}

      {showErrors && errors.feeAmount && <p className={`${errorClass} mt-3`}>{errors.feeAmount}</p>}

      {/* Insurance commission disclosure */}
      <div className="mt-6 pt-5 border-t border-light-border">
        <div className="flex items-start gap-3">
          <Toggle
            checked={state.insuranceCommissionsEnabled}
            onChange={v => set('insuranceCommissionsEnabled', v)}
            label="Insurance commissions"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-dark">Insurance commissions also payable</p>
            <p className="text-xs text-mid mt-0.5">
              Disclose any insurance commissions paid by an insurer to the practice in connection with this client.
            </p>
          </div>
        </div>
        {state.insuranceCommissionsEnabled && (
          <div className="mt-3 pl-14">
            <label className={labelClass}>Estimated annual commission</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-mid">$</span>
              <NumInput
                value={state.insuranceCommissionsAmount}
                onChange={v => set('insuranceCommissionsAmount', v)}
                min={0}
                max={500000}
                className={`${inputClassSm} w-40`}
              />
              <span className="text-sm text-mid">/ year</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
