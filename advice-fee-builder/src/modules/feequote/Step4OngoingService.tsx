import { useState } from 'react';
import Toggle from '../../components/shared/Toggle';
import TierEditor from './TierEditor';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency, formatPercent, formatHours } from '../../lib/formatters';

const REVIEW_HOUR_LABELS = [
  { key: 'updateXplan', label: 'Update Xplan / fact find' },
  { key: 'prepareReport', label: 'Prepare review report / presentation' },
  { key: 'admin', label: 'Admin — correspondence, arranging meeting' },
  { key: 'buffer', label: 'Buffer / other' },
  { key: 'conductMeeting', label: 'Conduct review meeting' },
  { key: 'fileNote', label: 'File note of meeting' },
  { key: 'prepareROA', label: 'Prepare ROA (if applicable)' },
  { key: 'implementROA', label: 'Implement ROA' },
  { key: 'fofaConsents', label: 'FOFA / fee consents / paperwork' },
];

export default function Step4OngoingService({ quote, dispatch, onNext, onBack }) {
  const [reviewOpen, setReviewOpen] = useState(true);
  const [entitiesOpen, setEntitiesOpen] = useState(false);
  const calc = calculateQuote(quote);

  const setField = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });

  const ongoingModels = [
    { id: 'fixedOnly', label: 'Fixed Fee Only' },
    { id: 'fixedVariable', label: 'Fixed + Variable (FUM)' },
    { id: 'subscription', label: 'Subscription' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold font-heading text-dark mb-1" style={{ letterSpacing: '-0.3px' }}>Ongoing Service</h2>
      <p className="text-sm text-mid mb-6">Configure the ongoing service model and fee structure.</p>

      <div className="space-y-5">
        {/* Ongoing model selector */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-sm font-semibold font-heading text-dark mb-3">Ongoing Fee Model</h3>
          <div className="flex flex-wrap gap-2">
            {ongoingModels.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setField('ongoingModel', m.id)}
                className={`px-4 py-2 rounded-input text-sm font-medium transition-colors ${
                  quote.ongoingModel === m.id
                    ? 'bg-teal text-white'
                    : 'bg-light-surface text-dark hover:bg-light-border'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fixed component — always shown */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-sm font-semibold font-heading text-dark mb-4">Fixed Component</h3>
          <div className="space-y-4">
            {/* Review meetings */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-dark">Review meetings</div>
                <div className="text-xs text-mid mt-0.5">
                  Cost: {formatCurrency(calc.costPerReview)}/meeting at {formatHours(calc.totalReviewHours)} per meeting
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={quote.reviewMeetings}
                  onChange={e => setField('reviewMeetings', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 text-center"
                />
                <span className="text-xs text-mid">per year</span>
              </div>
              <div className="w-24 text-right text-sm font-medium text-dark">
                {formatCurrency(calc.reviewMeetings * calc.costPerReview)}
              </div>
            </div>

            {/* Account keeping */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-dark">Account keeping fees</div>
                <div className="text-xs text-mid mt-0.5">$500 per account above 1</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quote.ongoingAccounts}
                  onChange={e => setField('ongoingAccounts', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 text-center"
                />
                <span className="text-xs text-mid">accounts</span>
              </div>
              <div className="w-24 text-right text-sm font-medium text-dark">
                {formatCurrency(calc.accountKeepingFee)}
              </div>
            </div>

            {/* Margin lending */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-dark">Margin lending facility fees</div>
                <div className="text-xs text-mid mt-0.5">10 × hourly rate</div>
              </div>
              <div className="flex items-center gap-2">
                <Toggle
                  checked={!!quote.marginLending}
                  onChange={v => setField('marginLending', v)}
                  label="Margin lending"
                />
              </div>
              <div className="w-24 text-right text-sm font-medium text-dark">
                {quote.marginLending ? formatCurrency(calc.marginLendingFee) : <span className="text-light-border">—</span>}
              </div>
            </div>

            <div className="bg-light-surface rounded-card px-4 py-3 flex items-center justify-between border border-light-border">
              <span className="text-sm font-semibold text-dark">Fixed Fee Component</span>
              <span className="text-sm font-bold text-dark">{formatCurrency(calc.fixedOngoingFee)}</span>
            </div>
          </div>
        </div>

        {/* Variable / FUM (fixedVariable only) */}
        {quote.ongoingModel === 'fixedVariable' && (
          <div className="bg-white rounded-card border border-light-border p-5">
            <h3 className="text-sm font-semibold font-heading text-dark mb-4">Variable (FUM-based) Component</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark mb-1">
                Total FUM across all accounts
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-mid">$</span>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={quote.fum}
                  onChange={e => setField('fum', parseFloat(e.target.value) || 0)}
                  className="w-40 rounded-input border border-light-border px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                />
              </div>
            </div>
            <TierEditor tiers={quote.tiers} dispatch={dispatch} />
            <div className="mt-4 bg-light-surface rounded-card px-4 py-3 border border-light-border flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-dark">Variable Fee (FUM component)</span>
                <div className="text-xs text-mid mt-0.5">
                  Effective rate: {formatPercent(calc.effectiveFumRate, 2)}
                </div>
              </div>
              <span className="text-sm font-bold text-dark">{formatCurrency(calc.variableFee)}</span>
            </div>
          </div>
        )}

        {/* Subscription (subscription only) */}
        {quote.ongoingModel === 'subscription' && (
          <div className="bg-white rounded-card border border-light-border p-5">
            <h3 className="text-sm font-semibold font-heading text-dark mb-4">Subscription</h3>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Monthly subscription</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid">$</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={quote.monthlySubscription}
                    onChange={e => setField('monthlySubscription', parseFloat(e.target.value) || 0)}
                    className="w-28 rounded-input border border-light-border px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                  />
                  <span className="text-sm text-mid">/ month</span>
                </div>
              </div>
              <div className="pt-5">
                <span className="text-sm text-mid">Annual: </span>
                <span className="text-sm font-semibold text-dark">{formatCurrency(calc.subscriptionAnnual)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Review meeting sense-check */}
        <div className="bg-white rounded-card border border-light-border overflow-hidden">
          <button
            type="button"
            onClick={() => setReviewOpen(o => !o)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-light-surface transition-colors"
          >
            <div>
              <h3 className="text-sm font-semibold text-dark">Review Meeting Sense-Check</h3>
              <p className="text-xs text-mid mt-0.5">
                Hours breakdown per review cycle — {formatHours(calc.totalReviewHours)} total at {formatCurrency(calc.costPerReview)}/meeting
              </p>
            </div>
            <span className="text-mid text-xs ml-4">{reviewOpen ? '▲' : '▼'}</span>
          </button>

          {reviewOpen && (
            <div className="px-5 pb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-light-border">
                    <th className="text-left py-2 text-xs font-medium text-mid">Task</th>
                    <th className="text-right py-2 text-xs font-medium text-mid w-24">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {REVIEW_HOUR_LABELS.map(({ key, label }) => (
                    <tr key={key}>
                      <td className="py-2 text-dark">{label}</td>
                      <td className="py-2">
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={quote.reviewHours[key]}
                          onChange={e => dispatch({ type: 'SET_REVIEW_HOUR', key, value: parseFloat(e.target.value) || 0 })}
                          className="w-20 rounded-input border border-light-border px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 float-right"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-light-border">
                    <td className="py-2 font-semibold text-dark">Total hours per review</td>
                    <td className="py-2 text-right font-semibold text-dark">{formatHours(calc.totalReviewHours)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Entity fee split (optional) */}
        <div className="bg-white rounded-card border border-light-border overflow-hidden">
          <button
            type="button"
            onClick={() => setEntitiesOpen(o => !o)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-light-surface transition-colors"
          >
            <div>
              <h3 className="text-sm font-semibold text-dark">Entity Fee Split <span className="text-mid font-normal">(optional)</span></h3>
              <p className="text-xs text-mid mt-0.5">Allocate the ongoing fee across individual entities</p>
            </div>
            <span className="text-mid text-xs ml-4">{entitiesOpen ? '▲' : '▼'}</span>
          </button>

          {entitiesOpen && (
            <EntitySplit quote={quote} dispatch={dispatch} calc={calc} />
          )}
        </div>

        {/* Ongoing fee summary */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-sm font-semibold font-heading text-dark mb-4">Ongoing Fee Summary</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-light-border">
              <SummaryRow label="Fixed Component" value={formatCurrency(calc.fixedOngoingFee)} />
              {quote.ongoingModel === 'fixedVariable' && (
                <SummaryRow label="Variable Component" value={formatCurrency(calc.variableFee)} />
              )}
              {quote.ongoingModel === 'subscription' && (
                <SummaryRow label="Subscription (annual)" value={formatCurrency(calc.subscriptionAnnual)} />
              )}
              <tr><td colSpan={2} className="py-1"><div className="border-t-2 border-light-border" /></td></tr>
              <SummaryRow label="Total Ongoing Fee (Excl GST)" value={formatCurrency(calc.totalOngoingRounded)} bold />
              <SummaryRow label="GST" value={formatCurrency(calc.ongoingGst)} />
              <SummaryRow label="Total Ongoing Fee (Incl GST)" value={formatCurrency(calc.totalOngoingInclGst)} bold />
              <SummaryRow label="Monthly equivalent" value={formatCurrency(calc.monthlyOngoing)} />
            </tbody>
          </table>
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

function EntitySplit({ quote, dispatch, calc }) {
  const totalBalance = quote.entities.reduce((s, e) => s + (Number(e.balance) || 0), 0);

  return (
    <div className="px-5 pb-5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-light-border">
              <th className="text-left py-2 text-xs font-medium text-mid">Entity Name</th>
              <th className="text-right py-2 text-xs font-medium text-mid">Balance ($)</th>
              <th className="text-center py-2 text-xs font-medium text-mid">Platform?</th>
              <th className="text-right py-2 text-xs font-medium text-mid">Fee Allocation</th>
              <th className="text-right py-2 text-xs font-medium text-mid">% of Balance</th>
              <th className="py-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border">
            {quote.entities.map((entity, i) => {
              const bal = Number(entity.balance) || 0;
              const feeAlloc = totalBalance > 0 ? (bal / totalBalance) * calc.totalOngoingInclGst : 0;
              const pctOfBal = bal > 0 ? (feeAlloc / bal) * 100 : 0;
              return (
                <tr key={i}>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={entity.name}
                      onChange={e => dispatch({ type: 'SET_ENTITY', index: i, field: 'name', value: e.target.value })}
                      placeholder="Entity name"
                      className="w-full rounded-input border border-light-border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      min={0}
                      value={entity.balance}
                      onChange={e => dispatch({ type: 'SET_ENTITY', index: i, field: 'balance', value: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-input border border-light-border px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                    />
                  </td>
                  <td className="py-2 pr-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!entity.onPlatform}
                      onChange={e => dispatch({ type: 'SET_ENTITY', index: i, field: 'onPlatform', value: e.target.checked })}
                      className="w-4 h-4 rounded border-light-border text-teal focus:ring-teal"
                    />
                  </td>
                  <td className="py-2 pr-2 text-right text-dark">{formatCurrency(feeAlloc)}</td>
                  <td className="py-2 pr-2 text-right text-mid">{bal > 0 ? `${pctOfBal.toFixed(2)}%` : '—'}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'REMOVE_ENTITY', index: i })}
                      className="text-light-border hover:text-risk transition-colors"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {quote.entities.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-light-border">
                <td className="py-2 font-semibold text-dark">Total</td>
                <td className="py-2 text-right font-medium text-dark">{formatCurrency(totalBalance)}</td>
                <td></td>
                <td className="py-2 text-right font-semibold text-dark">{formatCurrency(calc.totalOngoingInclGst)}</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {quote.entities.length < 6 && (
        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_ENTITY' })}
          className="mt-3 text-xs font-medium text-teal hover:opacity-80 transition-opacity"
        >
          + Add entity
        </button>
      )}
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr>
      <td className={`py-2 text-dark text-sm ${bold ? 'font-semibold' : ''}`}>{label}</td>
      <td className={`py-2 text-right text-sm ${bold ? 'font-bold text-dark' : 'font-medium text-dark'}`}>{value}</td>
    </tr>
  );
}
