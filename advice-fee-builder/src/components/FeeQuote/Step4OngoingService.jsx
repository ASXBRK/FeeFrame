import { useState } from 'react';
import Toggle from '../shared/Toggle.jsx';
import TierEditor from './TierEditor.jsx';
import { calculateQuote } from '../../lib/calculateQuote.js';
import { formatCurrency, formatPercent, formatHours } from '../../lib/formatters.js';

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
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Ongoing Service</h2>
      <p className="text-sm text-gray-500 mb-6">Configure the ongoing service model and fee structure.</p>

      <div className="space-y-5">
        {/* Ongoing model selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Ongoing Fee Model</h3>
          <div className="flex flex-wrap gap-2">
            {ongoingModels.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setField('ongoingModel', m.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quote.ongoingModel === m.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fixed component — always shown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Fixed Component</h3>
          <div className="space-y-4">
            {/* Review meetings */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Review meetings</div>
                <div className="text-xs text-gray-400 mt-0.5">
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
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
                />
                <span className="text-xs text-gray-400">per year</span>
              </div>
              <div className="w-24 text-right text-sm font-medium text-gray-900">
                {formatCurrency(calc.reviewMeetings * calc.costPerReview)}
              </div>
            </div>

            {/* Account keeping */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Account keeping fees</div>
                <div className="text-xs text-gray-400 mt-0.5">$500 per account above 1</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quote.ongoingAccounts}
                  onChange={e => setField('ongoingAccounts', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
                />
                <span className="text-xs text-gray-400">accounts</span>
              </div>
              <div className="w-24 text-right text-sm font-medium text-gray-900">
                {formatCurrency(calc.accountKeepingFee)}
              </div>
            </div>

            {/* Margin lending */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Margin lending facility fees</div>
                <div className="text-xs text-gray-400 mt-0.5">10 × hourly rate</div>
              </div>
              <div className="flex items-center gap-2">
                <Toggle
                  checked={!!quote.marginLending}
                  onChange={v => setField('marginLending', v)}
                  label="Margin lending"
                />
              </div>
              <div className="w-24 text-right text-sm font-medium text-gray-900">
                {quote.marginLending ? formatCurrency(calc.marginLendingFee) : <span className="text-gray-300">—</span>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Fixed Fee Component</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(calc.fixedOngoingFee)}</span>
            </div>
          </div>
        </div>

        {/* Variable / FUM (fixedVariable only) */}
        {quote.ongoingModel === 'fixedVariable' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Variable (FUM-based) Component</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total FUM across all accounts
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={quote.fum}
                  onChange={e => setField('fum', parseFloat(e.target.value) || 0)}
                  className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <TierEditor tiers={quote.tiers} dispatch={dispatch} />
            <div className="mt-4 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-gray-700">Variable Fee (FUM component)</span>
                <div className="text-xs text-gray-400 mt-0.5">
                  Effective rate: {formatPercent(calc.effectiveFumRate, 2)}
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(calc.variableFee)}</span>
            </div>
          </div>
        )}

        {/* Subscription (subscription only) */}
        {quote.ongoingModel === 'subscription' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Subscription</h3>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly subscription</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={quote.monthlySubscription}
                    onChange={e => setField('monthlySubscription', parseFloat(e.target.value) || 0)}
                    className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-400">/ month</span>
                </div>
              </div>
              <div className="pt-5">
                <span className="text-sm text-gray-500">Annual: </span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(calc.subscriptionAnnual)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Review meeting sense-check */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setReviewOpen(o => !o)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Review Meeting Sense-Check</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Hours breakdown per review cycle — {formatHours(calc.totalReviewHours)} total at {formatCurrency(calc.costPerReview)}/meeting
              </p>
            </div>
            <span className="text-gray-400 text-xs ml-4">{reviewOpen ? '▲' : '▼'}</span>
          </button>

          {reviewOpen && (
            <div className="px-5 pb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-medium text-gray-500">Task</th>
                    <th className="text-right py-2 text-xs font-medium text-gray-500 w-24">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {REVIEW_HOUR_LABELS.map(({ key, label }) => (
                    <tr key={key}>
                      <td className="py-2 text-gray-700">{label}</td>
                      <td className="py-2">
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={quote.reviewHours[key]}
                          onChange={e => dispatch({ type: 'SET_REVIEW_HOUR', key, value: parseFloat(e.target.value) || 0 })}
                          className="w-20 rounded border border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal-500 float-right"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-2 font-semibold text-gray-800">Total hours per review</td>
                    <td className="py-2 text-right font-semibold text-gray-900">{formatHours(calc.totalReviewHours)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Entity fee split (optional) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setEntitiesOpen(o => !o)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Entity Fee Split <span className="text-gray-400 font-normal">(optional)</span></h3>
              <p className="text-xs text-gray-400 mt-0.5">Allocate the ongoing fee across individual entities</p>
            </div>
            <span className="text-gray-400 text-xs ml-4">{entitiesOpen ? '▲' : '▼'}</span>
          </button>

          {entitiesOpen && (
            <EntitySplit quote={quote} dispatch={dispatch} calc={calc} />
          )}
        </div>

        {/* Ongoing fee summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Ongoing Fee Summary</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <SummaryRow label="Fixed Component" value={formatCurrency(calc.fixedOngoingFee)} />
              {quote.ongoingModel === 'fixedVariable' && (
                <SummaryRow label="Variable Component" value={formatCurrency(calc.variableFee)} />
              )}
              {quote.ongoingModel === 'subscription' && (
                <SummaryRow label="Subscription (annual)" value={formatCurrency(calc.subscriptionAnnual)} />
              )}
              <tr><td colSpan={2} className="py-1"><div className="border-t-2 border-gray-300" /></td></tr>
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
          className="text-sm text-gray-500 hover:text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
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
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-xs font-medium text-gray-500">Entity Name</th>
              <th className="text-right py-2 text-xs font-medium text-gray-500">Balance ($)</th>
              <th className="text-center py-2 text-xs font-medium text-gray-500">Platform?</th>
              <th className="text-right py-2 text-xs font-medium text-gray-500">Fee Allocation</th>
              <th className="text-right py-2 text-xs font-medium text-gray-500">% of Balance</th>
              <th className="py-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
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
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      min={0}
                      value={entity.balance}
                      onChange={e => dispatch({ type: 'SET_ENTITY', index: i, field: 'balance', value: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </td>
                  <td className="py-2 pr-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!entity.onPlatform}
                      onChange={e => dispatch({ type: 'SET_ENTITY', index: i, field: 'onPlatform', value: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </td>
                  <td className="py-2 pr-2 text-right text-gray-700">{formatCurrency(feeAlloc)}</td>
                  <td className="py-2 pr-2 text-right text-gray-500">{bal > 0 ? `${pctOfBal.toFixed(2)}%` : '—'}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'REMOVE_ENTITY', index: i })}
                      className="text-gray-300 hover:text-red-500 transition-colors"
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
              <tr className="border-t-2 border-gray-300">
                <td className="py-2 font-semibold text-gray-700">Total</td>
                <td className="py-2 text-right font-medium text-gray-700">{formatCurrency(totalBalance)}</td>
                <td></td>
                <td className="py-2 text-right font-semibold text-gray-900">{formatCurrency(calc.totalOngoingInclGst)}</td>
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
          className="mt-3 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          + Add entity
        </button>
      )}
    </div>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <tr>
      <td className={`py-2 text-gray-700 text-sm ${bold ? 'font-semibold' : ''}`}>{label}</td>
      <td className={`py-2 text-right text-sm ${bold ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{value}</td>
    </tr>
  );
}
