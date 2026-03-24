import { useState } from 'react';
import Tooltip from '../../components/shared/Tooltip';
import NumInput from '../../components/shared/NumInput';
import Toggle from '../../components/shared/Toggle';
import { PREMIUM_FACTORS, DISCOUNT_FACTORS } from '../../lib/serviceLines';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency } from '../../lib/formatters';

export default function Step4Adjustments({ quote, dispatch, onNext, onBack }) {
  const calc = calculateQuote(quote);
  const hasOngoing = quote.hasOngoing !== false && calc.totalOngoingRounded > 0;

  const setPremium = (i, v) => dispatch({ type: 'SET_PREMIUM_FACTOR', index: i, value: v });
  const setDiscount = (i, v) => dispatch({ type: 'SET_DISCOUNT_FACTOR', index: i, value: v });
  const setField = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });
  const setRelationship = (fields) => dispatch({ type: 'SET_RELATIONSHIP_DISCOUNT', fields });

  return (
    <div>
      <h2 className="text-xl font-bold font-heading text-dark mb-1" style={{ letterSpacing: '-0.3px' }}>Adjustments</h2>
      <p className="text-sm text-mid mb-6">Apply premiums and discounts based on the nature of this engagement.</p>

      <div className="space-y-5">

        {/* ── Premiums ── */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-base font-bold font-heading text-dark mb-1">Premiums</h3>

          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800 mb-4">
            💡 Premiums reflect additional time and complexity involved in serving this client. Selecting more factors increases the premium. You can adjust the amount manually.
          </div>

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
                  <Tooltip text={factor.description} />
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <AdjustmentRow
              rowId="premium-soa"
              label="SOA premium"
              sign="+"
              autoValue={calc.soaPremiumAuto}
              overrideValue={quote.premiumSoaOverride}
              onOverride={v => setField('premiumSoaOverride', v)}
              onClear={() => setField('premiumSoaOverride', null)}
              colorClass="text-amber-700"
            />
            {hasOngoing && (
              <AdjustmentRow
                rowId="premium-ongoing"
                label="Ongoing premium"
                sign="+"
                autoValue={calc.ongoingPremiumAuto}
                overrideValue={quote.premiumOngoingOverride}
                onOverride={v => setField('premiumOngoingOverride', v)}
                onClear={() => setField('premiumOngoingOverride', null)}
                suffix="p.a."
                colorClass="text-amber-700"
              />
            )}
          </div>
        </div>

        {/* ── Discounts ── */}
        <div className="bg-white rounded-card border border-light-border p-5 mb-8">
          <h3 className="text-base font-bold font-heading text-dark mb-1">Discounts</h3>

          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800 mb-4">
            💡 Discounts reflect factors that reduce the cost and effort of this engagement. You can adjust the amount manually.
          </div>

          {/* Relationship discount */}
          <div className="bg-light-surface border border-light-border rounded-card px-4 py-3 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-dark">Relationship Discount</span>
                <span className="ml-2 text-xs text-mid font-normal">(optional)</span>
              </div>
              <Toggle
                checked={!!quote.relationshipDiscountEnabled}
                onChange={v => setRelationship({ relationshipDiscountEnabled: v })}
              />
            </div>
            {quote.relationshipDiscountEnabled && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-dark">Relationship discount</label>
                  <div className="flex items-center gap-1.5">
                    <NumInput
                      value={Number(quote.relationshipDiscountPercent) || 10}
                      onChange={v => setRelationship({ relationshipDiscountPercent: Math.min(50, Math.max(0, v)) })}
                      min={0}
                      max={50}
                      step={5}
                      className="w-20 rounded-input border border-light-border px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal"
                    />
                    <span className="text-sm text-dark">%</span>
                    <Tooltip text="For referrals from existing clients, professional networks, staff, friends or family, or existing client family groups. Set the discount percentage that applies to your firm." />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Engagement factor checkboxes */}
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
                  <Tooltip text={factor.description} />
                </span>
              </label>
            ))}
          </div>

          {calc.discountCapApplied && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-input px-3 py-2 mb-3">
              Total discount capped at 50%.
            </p>
          )}

          <div className="space-y-2">
            <AdjustmentRow
              rowId="discount-soa"
              label="SOA discount"
              sign="-"
              autoValue={calc.soaDiscountAuto}
              overrideValue={quote.discountSoaOverride}
              onOverride={v => setField('discountSoaOverride', v)}
              onClear={() => setField('discountSoaOverride', null)}
              colorClass="text-green-700"
            />
            {hasOngoing && (
              <AdjustmentRow
                rowId="discount-ongoing"
                label="Ongoing discount"
                sign="-"
                autoValue={calc.ongoingDiscountAuto}
                overrideValue={quote.discountOngoingOverride}
                onOverride={v => setField('discountOngoingOverride', v)}
                onClear={() => setField('discountOngoingOverride', null)}
                suffix="p.a."
                colorClass="text-green-700"
              />
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

// ── AdjustmentRow ──────────────────────────────────────────────────────────────
function AdjustmentRow({ rowId, label, sign, autoValue, overrideValue, onOverride, onClear, suffix = '', colorClass }: {
  rowId: string; label: string; sign: string; autoValue: number; overrideValue: number | null;
  onOverride: (v: number) => void; onClear: () => void; suffix?: string; colorClass: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const isOverridden = overrideValue !== null;
  const displayValue = isOverridden ? (overrideValue ?? 0) : autoValue;

  function startEdit() {
    setDraft(String(Math.round(displayValue)));
    setEditing(true);
    setTimeout(() => {
      const el = document.getElementById(`edit-${rowId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
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
    <div id={`edit-${rowId}`} className="flex items-center justify-between gap-3 py-2 px-3 bg-light-surface rounded-input border border-light-border">
      <span className="text-sm text-dark">{label}</span>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <span className={`text-sm font-medium ${colorClass}`}>{sign}$</span>
            <NumInput
              value={parseFloat(draft) || 0}
              onChange={v => setDraft(String(v))}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
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
