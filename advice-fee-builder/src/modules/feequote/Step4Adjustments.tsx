import { useState } from 'react';
import Tooltip from '../../components/shared/Tooltip';
import { PREMIUM_FACTORS, DISCOUNT_FACTORS } from '../../lib/serviceLines';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency, formatPercent } from '../../lib/formatters';

export default function Step4Adjustments({ quote, dispatch, onNext, onBack }) {
  const calc = calculateQuote(quote);
  const hasOngoing = quote.hasOngoing !== false && calc.totalOngoingRounded > 0;

  const setPremium = (i, v) => dispatch({ type: 'SET_PREMIUM_FACTOR', index: i, value: v });
  const setDiscount = (i, v) => dispatch({ type: 'SET_DISCOUNT_FACTOR', index: i, value: v });
  const setField = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });

  return (
    <div>
      <h2 className="text-xl font-bold font-heading text-dark mb-1" style={{ letterSpacing: '-0.3px' }}>Adjustments</h2>
      <p className="text-sm text-mid mb-6">Apply premiums and discounts based on the nature of this engagement.</p>

      <div className="space-y-5">

        {/* Premiums */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-base font-bold font-heading text-dark mb-1">Premiums</h3>
          <p className="text-xs text-mid mb-4">Select any factors that justify a premium on this engagement.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
            {PREMIUM_FACTORS.map((factor, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!quote.premiumFactors?.[i]}
                  onChange={e => setPremium(i, e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-light-border text-teal focus:ring-teal flex-shrink-0"
                />
                <span className="text-sm text-dark leading-snug flex items-center gap-1">
                  {factor.label}
                  <Tooltip text={factor.description}>
                    <span className="text-mid text-xs cursor-default ml-1">ⓘ</span>
                  </Tooltip>
                </span>
              </label>
            ))}
          </div>

          <div className="bg-warning-bg border border-warning rounded-input px-4 py-3 mb-3">
            <div className="text-sm text-warning-text">
              Factors selected: <strong>{calc.premiumCount}</strong> → Premium rate: <strong>{formatPercent(calc.premiumRate, 0)}</strong>
            </div>
          </div>

          <div className="space-y-2">
            <AdjustmentRow
              label="SOA premium"
              sign="+"
              autoValue={calc.soaPremiumAuto}
              overrideValue={quote.premiumSoaOverride}
              onOverride={v => setField('premiumSoaOverride', v)}
              onClear={() => setField('premiumSoaOverride', null)}
              colorClass="text-warning-text"
            />
            {hasOngoing && (
              <AdjustmentRow
                label="Ongoing premium"
                sign="+"
                autoValue={calc.ongoingPremiumAuto}
                overrideValue={quote.premiumOngoingOverride}
                onOverride={v => setField('premiumOngoingOverride', v)}
                onClear={() => setField('premiumOngoingOverride', null)}
                suffix="p.a."
                colorClass="text-warning-text"
              />
            )}
          </div>
        </div>

        {/* Discounts */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-base font-bold font-heading text-dark mb-1">Discounts</h3>
          <p className="text-xs text-mid mb-4">Select any factors that reduce the cost of this engagement.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
            {DISCOUNT_FACTORS.map((factor, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!quote.discountFactors?.[i]}
                  onChange={e => setDiscount(i, e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-light-border text-teal focus:ring-teal flex-shrink-0"
                />
                <span className="text-sm text-dark leading-snug flex items-center gap-1">
                  {factor.label}
                  <Tooltip text={factor.description}>
                    <span className="text-mid text-xs cursor-default ml-1">ⓘ</span>
                  </Tooltip>
                </span>
              </label>
            ))}
          </div>

          <div className="bg-healthy-bg border border-healthy rounded-input px-4 py-3 mb-3">
            <div className="text-sm text-healthy-text">
              Factors selected: <strong>{calc.discountCount}</strong> → Discount rate: <strong>{formatPercent(calc.discountRate, 0)}</strong>
            </div>
          </div>

          <div className="space-y-2">
            <AdjustmentRow
              label="SOA discount"
              sign="-"
              autoValue={calc.soaDiscountAuto}
              overrideValue={quote.discountSoaOverride}
              onOverride={v => setField('discountSoaOverride', v)}
              onClear={() => setField('discountSoaOverride', null)}
              colorClass="text-healthy-text"
            />
            {hasOngoing && (
              <AdjustmentRow
                label="Ongoing discount"
                sign="-"
                autoValue={calc.ongoingDiscountAuto}
                overrideValue={quote.discountOngoingOverride}
                onOverride={v => setField('discountOngoingOverride', v)}
                onClear={() => setField('discountOngoingOverride', null)}
                suffix="p.a."
                colorClass="text-healthy-text"
              />
            )}
          </div>
        </div>

      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="text-sm text-mid hover:text-dark font-medium py-2.5 px-4 rounded-input border border-light-border hover:border-mid transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="bg-teal hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-opacity text-sm"
        >
          Next: Fee Summary →
        </button>
      </div>
    </div>
  );
}

// ── AdjustmentRow — shows auto-calculated value with optional pencil override ─
function AdjustmentRow({ label, sign, autoValue, overrideValue, onOverride, onClear, suffix = '', colorClass }: {
  label: string; sign: string; autoValue: number; overrideValue: number | null;
  onOverride: (v: number) => void; onClear: () => void; suffix?: string; colorClass: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const isOverridden = overrideValue !== null;
  const displayValue = isOverridden ? (overrideValue ?? 0) : autoValue;

  function startEdit() {
    setDraft(String(Math.round(displayValue)));
    setEditing(true);
  }

  function commit() {
    const val = parseFloat(draft) || 0;
    onOverride(val);
    setEditing(false);
  }

  function clearOverride() {
    onClear();
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 bg-light-surface rounded-input border border-light-border">
      <span className="text-sm text-dark">{label}</span>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <span className={`text-sm font-medium ${colorClass}`}>{sign}$</span>
            <input
              type="number"
              onFocus={e => e.target.select()}
              min={0}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
              className="w-24 rounded-input border border-teal px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal"
            />
            <button onClick={commit} className="text-xs text-teal font-medium hover:opacity-75">Save</button>
            {isOverridden && (
              <button onClick={clearOverride} className="text-xs text-mid hover:text-dark">Reset to auto</button>
            )}
            <button onClick={() => setEditing(false)} className="text-xs text-mid hover:text-dark">Cancel</button>
          </>
        ) : (
          <>
            <span className={`text-sm font-semibold ${colorClass}`}>
              {sign}{formatCurrency(displayValue)}{suffix ? ` ${suffix}` : ''}
            </span>
            {isOverridden && (
              <span className="text-xs bg-warning-bg text-warning-text px-1.5 py-0.5 rounded font-medium">override</span>
            )}
            <button
              onClick={startEdit}
              className="text-sm text-mid hover:text-dark transition-colors"
              title="Edit amount"
            >
              ✏️
            </button>
          </>
        )}
      </div>
    </div>
  );
}
