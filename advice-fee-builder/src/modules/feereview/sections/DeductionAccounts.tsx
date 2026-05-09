import type { AccountType, FeeReviewErrors, FeeReviewState } from '../types';
import { cardClass, errorClass, inputClassSm, labelClass, sectionHeadingClass, sectionSubheadingClass } from './fieldStyles';

interface Props {
  state: FeeReviewState;
  addAccount: () => void;
  updateAccount: (id: string, field: 'provider' | 'reference' | 'type', value: string) => void;
  removeAccount: (id: string) => void;
  errors: FeeReviewErrors;
  showErrors: boolean;
}

const ACCOUNT_TYPES: ReadonlyArray<{ value: AccountType; label: string }> = [
  { value: 'superannuation', label: 'Superannuation' },
  { value: 'investment',     label: 'Investment' },
  { value: 'cash',           label: 'Cash management' },
  { value: 'other',          label: 'Other' },
];

export default function DeductionAccounts({ state, addAccount, updateAccount, removeAccount, errors, showErrors }: Props) {
  const canRemove = state.accounts.length > 1;
  return (
    <div className={cardClass} id="section-accounts">
      <div className="mb-4">
        <h3 className={sectionHeadingClass}>Accounts for fee deduction</h3>
        <p className={sectionSubheadingClass}>List every account the practice will arrange deductions from.</p>
      </div>

      <div className="space-y-3">
        {state.accounts.map((acc, idx) => (
          <div key={acc.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end p-3 rounded-input border border-light-border bg-light-surface">
            <div className="sm:col-span-4">
              {idx === 0 && <label className={labelClass}>Provider</label>}
              <input
                type="text"
                value={acc.provider}
                onChange={e => updateAccount(acc.id, 'provider', e.target.value)}
                placeholder="e.g. Vanguard Super, Macquarie CMA"
                className={`${inputClassSm} w-full`}
              />
            </div>
            <div className="sm:col-span-3">
              {idx === 0 && <label className={labelClass}>Type</label>}
              <select
                value={acc.type}
                onChange={e => updateAccount(acc.id, 'type', e.target.value)}
                className={`${inputClassSm} w-full bg-white`}
              >
                {ACCOUNT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-4">
              {idx === 0 && <label className={labelClass}>Account number / reference</label>}
              <input
                type="text"
                value={acc.reference}
                onChange={e => updateAccount(acc.id, 'reference', e.target.value)}
                className={`${inputClassSm} w-full`}
              />
            </div>
            <div className="sm:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => removeAccount(acc.id)}
                disabled={!canRemove}
                className="text-sm text-mid hover:text-risk disabled:opacity-30 disabled:cursor-not-allowed px-2 py-2"
                title={canRemove ? 'Remove account' : 'At least one account is required'}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addAccount}
        className="mt-3 text-sm text-teal hover:underline"
      >
        + Add another account
      </button>

      {showErrors && errors.accounts && <p className={`${errorClass} mt-2`}>{errors.accounts}</p>}
    </div>
  );
}
