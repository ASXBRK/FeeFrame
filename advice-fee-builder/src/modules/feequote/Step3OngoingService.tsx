import { useState } from 'react';
import Toggle from '../../components/shared/Toggle';
import Tooltip from '../../components/shared/Tooltip';
import NumInput from '../../components/shared/NumInput';
import TierEditor from './TierEditor';
import { REVIEW_TASKS, ANNUAL_TASKS } from '../../lib/serviceLines';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency } from '../../lib/formatters';

export default function Step3OngoingService({ quote, dispatch, onNext, onBack }) {
  const [entitiesOpen, setEntitiesOpen] = useState(false);
  const [incentivesOpen, setIncentivesOpen] = useState(false);
  const calc = calculateQuote(quote);

  const set = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });

  const ongoingModels = [
    { id: 'fixedOnly', label: 'Fixed Fee' },
    { id: 'percentageBased', label: 'Percentage Based' },
    { id: 'subscription', label: 'Subscription' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold font-heading text-dark mb-1" style={{ letterSpacing: '-0.3px' }}>Ongoing Service</h2>
      <p className="text-sm text-mid mb-6">Configure the ongoing service model and fee structure.</p>

      <div className="space-y-5">

        {/* Ongoing advice toggle */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-heading text-dark">Will you provide ongoing advice?</h3>
              <p className="text-xs text-mid mt-0.5">If no, this engagement ends at implementation.</p>
            </div>
            <Toggle
              checked={quote.hasOngoing !== false}
              onChange={v => set('hasOngoing', v)}
              label="Provide ongoing advice"
            />
          </div>
          {quote.hasOngoing === false && (
            <div className="mt-4 p-3 bg-light-surface rounded-input border border-light-border text-sm text-mid">
              No ongoing service fee will be quoted. Proceed to Adjustments.
            </div>
          )}
        </div>

        {quote.hasOngoing !== false && (
          <>
            {/* Model selector */}
            <div className="bg-white rounded-card border border-light-border p-5">
              <h3 className="text-base font-bold font-heading text-dark mb-3">Ongoing Fee Model</h3>
              <div className="flex flex-wrap gap-2">
                {ongoingModels.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => set('ongoingModel', m.id)}
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

            {/* Fixed Fee model */}
            {quote.ongoingModel === 'fixedOnly' && (
              <FixedFeeModel quote={quote} dispatch={dispatch} calc={calc} />
            )}

            {/* Percentage Based model */}
            {quote.ongoingModel === 'percentageBased' && (
              <PercentageModel quote={quote} dispatch={dispatch} calc={calc} set={set} />
            )}

            {/* Subscription model */}
            {quote.ongoingModel === 'subscription' && (
              <SubscriptionModel quote={quote} set={set} calc={calc} />
            )}

            {/* Ongoing insurance commission offset */}
            <div className="bg-white rounded-card border border-light-border p-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-sm font-medium text-dark">Less: Ongoing insurance commission offset</span>
                  <Tooltip text="If you receive ongoing insurance commissions for this client, you can apply them here to offset a portion of the annual ongoing service fee. This reduces the net fee charged to the client each year." />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-mid">-$</span>
                  <NumInput
                    value={quote.ongoingInsuranceCommissionOffset}
                    onChange={v => set('ongoingInsuranceCommissionOffset', v)}
                    className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 text-center"
                  />
                  <span className="text-xs text-mid w-14">p.a.</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-sm font-medium w-20 text-right ${(quote.ongoingInsuranceCommissionOffset || 0) > 0 ? 'text-risk-text' : 'text-light-border'}`}>
                    {(quote.ongoingInsuranceCommissionOffset || 0) > 0
                      ? `-${formatCurrency(Number(quote.ongoingInsuranceCommissionOffset) || 0)}`
                      : '—'}
                  </span>
                  <div className="w-6" />
                </div>
              </div>
            </div>

            {/* Client incentives */}
            <ClientIncentives quote={quote} set={set} calc={calc} />

            {/* Entity fee split */}
            <div className="bg-white rounded-card border border-light-border overflow-hidden">
              <button
                type="button"
                onClick={() => setEntitiesOpen(o => !o)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-light-surface transition-colors"
              >
                <div>
                  <h3 className="text-base font-bold font-heading text-dark">Entity Fee Split <span className="text-mid font-normal">(optional)</span></h3>
                  <p className="text-xs text-mid mt-0.5">Allocate the ongoing fee across individual entities.</p>
                </div>
                <span className="text-mid text-xs ml-4">{entitiesOpen ? '▲' : '▼'}</span>
              </button>
              {entitiesOpen && <EntitySplit quote={quote} dispatch={dispatch} calc={calc} />}
            </div>
          </>
        )}
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
          Next: Adjustments →
        </button>
      </div>
    </div>
  );
}

// ── Fixed Fee model ───────────────────────────────────────────────────────────
function FixedFeeModel({ quote, dispatch, calc }) {
  const set = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [expandedAnnual, setExpandedAnnual] = useState<string | null>(null);

  function setReviewOverride(taskId: string, role: string, value: number) {
    dispatch({ type: 'SET_REVIEW_HOUR_OVERRIDE', key: `${taskId}.${role}`, value });
  }

  function setAnnualOverride(taskId: string, role: string, value: number) {
    dispatch({ type: 'SET_ANNUAL_TASK_HOUR_OVERRIDE', key: `${taskId}.${role}`, value });
  }

  function getReviewHour(task: any, role: string) {
    return quote.reviewHourOverrides?.[`${task.id}.${role}`] ?? task[`${role}Hours`];
  }

  function getAnnualHour(task: any, role: string) {
    return quote.annualTaskHourOverrides?.[`${task.id}.${role}`] ?? task[`${role}Hours`];
  }

  return (
    <>
      {/* Review meetings count */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-base font-bold font-heading text-dark mb-4">Review Meetings</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm font-medium text-dark">Review meetings per year</div>
            <div className="text-xs text-mid mt-0.5">
              Cost per review: {formatCurrency(calc.costPerReview)} · Total: {formatCurrency(calc.costPerReview * (Number(quote.reviewMeetings) || 0))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NumInput
              value={quote.reviewMeetings}
              onChange={v => set('reviewMeetings', Math.max(0, Math.round(v)))}
              integer
              className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 text-center"
            />
            <span className="text-xs text-mid">per year</span>
          </div>
        </div>
      </div>

      {/* Per-review task breakdown */}
      <div className="bg-white rounded-card border border-light-border overflow-hidden">
        <div className="px-5 py-4 border-b border-light-border">
          <h3 className="text-base font-bold font-heading text-dark">Per-Review Task Breakdown</h3>
          <p className="text-xs text-mid mt-0.5">Hours per single review cycle. Click ✏️ to edit a row.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-border bg-light-surface">
                <th className="text-left py-2.5 px-5 text-xs font-medium text-mid">Task</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-mid">Adviser</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-mid">Paraplanner</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-mid">Admin</th>
                <th className="text-right py-2.5 px-5 text-xs font-medium text-mid">Fee</th>
                <th className="py-2.5 px-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {REVIEW_TASKS.map((task, idx) => {
                const calcTask = calc.reviewTaskItems?.[idx];
                const isEditing = expandedReview === task.id;
                return (
                  <tr key={task.id} className={isEditing ? 'bg-light-surface' : ''}>
                    <td className="py-2.5 px-5 text-dark">{task.label}</td>
                    {(['adviser', 'paraplanner', 'admin'] as const).map(role => (
                      <td key={role} className="py-2.5 px-3 text-right">
                        {isEditing ? (
                          <NumInput
                            value={getReviewHour(task, role)}
                            onChange={v => setReviewOverride(task.id, role, v)}
                            className="w-16 rounded-input border border-teal px-1.5 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal focus:ring-offset-0 float-right"
                          />
                        ) : (
                          <span className="text-mid">{getReviewHour(task, role)}h</span>
                        )}
                      </td>
                    ))}
                    <td className="py-2.5 px-5 text-right font-medium text-dark">
                      {formatCurrency(calcTask?.fee ?? 0)}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => setExpandedReview(isEditing ? null : task.id)}
                        className={`text-sm transition-colors ${isEditing ? 'text-teal' : 'text-mid hover:text-dark'}`}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-light-border bg-light-surface">
                <td className="py-2.5 px-5 font-semibold text-dark" colSpan={4}>Cost per review meeting</td>
                <td className="py-2.5 px-5 text-right font-bold text-dark">{formatCurrency(calc.costPerReview)}</td>
                <td></td>
              </tr>
              <tr className="bg-light-surface">
                <td className="py-2 px-5 text-xs text-mid" colSpan={4}>
                  {Number(quote.reviewMeetings) || 0} meetings × {formatCurrency(calc.costPerReview)}
                </td>
                <td className="py-2 px-5 text-right text-sm font-semibold text-teal">
                  {formatCurrency((Number(quote.reviewMeetings) || 0) * calc.costPerReview)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Annual tasks */}
      <div className="bg-white rounded-card border border-light-border overflow-hidden">
        <div className="px-5 py-4 border-b border-light-border">
          <h3 className="text-base font-bold font-heading text-dark">Annual Tasks</h3>
          <p className="text-xs text-mid mt-0.5">Fixed work per year, regardless of meeting count. Click ✏️ to edit.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-border bg-light-surface">
                <th className="text-left py-2.5 px-5 text-xs font-medium text-mid">Task</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-mid">Adviser</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-mid">Paraplanner</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-mid">Admin</th>
                <th className="text-right py-2.5 px-5 text-xs font-medium text-mid">Fee p.a.</th>
                <th className="py-2.5 px-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {ANNUAL_TASKS.map((task, idx) => {
                const calcTask = calc.annualTaskItems?.[idx];
                const isEditing = expandedAnnual === task.id;
                return (
                  <tr key={task.id} className={isEditing ? 'bg-light-surface' : ''}>
                    <td className="py-2.5 px-5 text-dark">{task.label}</td>
                    {(['adviser', 'paraplanner', 'admin'] as const).map(role => (
                      <td key={role} className="py-2.5 px-3 text-right">
                        {isEditing ? (
                          <NumInput
                            value={getAnnualHour(task, role)}
                            onChange={v => setAnnualOverride(task.id, role, v)}
                            className="w-16 rounded-input border border-teal px-1.5 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal focus:ring-offset-0 float-right"
                          />
                        ) : (
                          <span className="text-mid">{getAnnualHour(task, role)}h</span>
                        )}
                      </td>
                    ))}
                    <td className="py-2.5 px-5 text-right font-medium text-dark">
                      {formatCurrency(calcTask?.fee ?? 0)}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => setExpandedAnnual(isEditing ? null : task.id)}
                        className={`text-sm transition-colors ${isEditing ? 'text-teal' : 'text-mid hover:text-dark'}`}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-light-border bg-light-surface">
                <td className="py-2.5 px-5 font-semibold text-dark" colSpan={4}>Total annual tasks</td>
                <td className="py-2.5 px-5 text-right font-bold text-dark">{formatCurrency(calc.totalAnnualTaskFee)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Percentage Based model ─────────────────────────────────────────────────────
function PercentageModel({ quote, dispatch, calc, set }) {
  return (
    <div className="bg-white rounded-card border border-light-border p-5 space-y-5">
      <h3 className="text-base font-bold font-heading text-dark">Percentage Based (FUM)</h3>

      {/* FUM input */}
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Total funds under management</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-mid">$</span>
          <NumInput
            value={quote.fum}
            onChange={v => set('fum', v)}
            className="w-40 rounded-input border border-light-border px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
        </div>
      </div>

      {/* Tier editor */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2">Fee tiers</label>
        <TierEditor tiers={quote.tiers} dispatch={dispatch} />
        <div className="mt-3 bg-light-surface rounded-input px-4 py-3 border border-light-border flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-dark">FUM-based fee</span>
            <div className="text-xs text-mid mt-0.5">Effective rate: {((calc.effectiveFumRate || 0) * 100).toFixed(2)}%</div>
          </div>
          <span className="text-sm font-bold text-dark">{formatCurrency(calc.variableFee)}</span>
        </div>
      </div>

      {/* Minimum annual fee */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <label className="text-sm font-medium text-dark">Minimum annual fee</label>
          <Tooltip text="If the FUM-based fee calculates below this amount, the minimum will apply instead." />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-mid">$</span>
          <NumInput
            value={quote.minimumAnnualFee ?? 0}
            onChange={v => set('minimumAnnualFee', v)}
            className="w-32 rounded-input border border-light-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
          <span className="text-xs text-mid">p.a.</span>
        </div>
      </div>

      {/* Additional platform fee */}
      <div className="border-t border-light-border pt-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!quote.hasAdditionalPlatformFee}
            onChange={e => set('hasAdditionalPlatformFee', e.target.checked)}
            className="w-4 h-4 rounded border-light-border text-teal focus:ring-teal"
          />
          <span className="text-sm font-medium text-dark">Charge additional platform / account fee</span>
        </label>
        {quote.hasAdditionalPlatformFee && (
          <div className="flex flex-wrap items-center gap-4 pl-7">
            <div className="flex items-center gap-2">
              <label className="text-sm text-dark">Accounts</label>
              <NumInput
                value={quote.platformAccounts ?? 1}
                onChange={v => set('platformAccounts', Math.max(1, Math.round(v)))}
                integer
                emptyDefault={1}
                className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-dark">Fee per additional account</label>
              <span className="text-sm text-mid">$</span>
              <NumInput
                value={quote.additionalPlatformFee ?? 500}
                onChange={v => set('additionalPlatformFee', v)}
                className="w-24 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Subscription model ─────────────────────────────────────────────────────────
function SubscriptionModel({ quote, set, calc }) {
  return (
    <div className="bg-white rounded-card border border-light-border p-5 space-y-5">
      <h3 className="text-base font-bold font-heading text-dark">Subscription</h3>

      {/* Monthly fee */}
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Monthly subscription fee</label>
        <div className="flex items-center gap-3">
          <span className="text-sm text-mid">$</span>
          <NumInput
            value={quote.monthlySubscription}
            onChange={v => set('monthlySubscription', v)}
            className="w-28 rounded-input border border-light-border px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
          <span className="text-sm text-mid">/ month</span>
          <span className="text-sm text-mid">= <strong className="text-dark">{formatCurrency(calc.subscriptionAnnual)}</strong> per year</span>
        </div>
      </div>

      {/* Included reviews */}
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Included reviews per year</label>
        <div className="flex items-center gap-2">
          <NumInput
            value={quote.includedReviews ?? 2}
            onChange={v => set('includedReviews', Math.max(0, Math.round(v)))}
            integer
            className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
          <span className="text-xs text-mid">review meetings included</span>
        </div>
      </div>

      {/* Additional services rate */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <label className="text-sm font-medium text-dark">Hourly rate for additional services</label>
          <Tooltip text="Work outside the subscription scope will be quoted at this rate." />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-mid">$</span>
          <NumInput
            value={quote.additionalServicesRate ?? 0}
            onChange={v => set('additionalServicesRate', v)}
            className="w-28 rounded-input border border-light-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
          <span className="text-sm text-mid">/ hour</span>
        </div>
      </div>
    </div>
  );
}

// ── Client incentives ──────────────────────────────────────────────────────────
function ClientIncentives({ quote, set, calc }) {
  const [open, setOpen] = useState(false);

  const soaDiscountOn = (quote.soaDiscountPercent ?? 0) > 0;
  const discountOptions = [25, 50, 75, 100];
  const noImpl = calc.implTotal === 0;

  const soaOriginal = calc.soaTotalInclGst;
  const soaDiscounted = calc.soaIncentivisedFee;
  const soaSaving = calc.soaDiscountAmount;

  return (
    <div className="bg-white rounded-card border border-light-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-light-surface transition-colors"
      >
        <div>
          <h3 className="text-base font-bold font-heading text-dark">Client Incentives <span className="text-mid font-normal">(optional)</span></h3>
          <p className="text-xs text-mid mt-0.5">Offer a discount on initial fees to incentivise an ongoing arrangement.</p>
        </div>
        <span className="text-mid text-xs ml-4">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-light-border pt-4">

          {/* SOA fee discount */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-dark">Discount SOA fee</span>
              <Toggle
                checked={soaDiscountOn}
                onChange={v => set('soaDiscountPercent', v ? 25 : 0)}
                label="Discount SOA fee"
              />
            </div>
            {soaDiscountOn && (
              <>
                <div className="flex gap-2">
                  {discountOptions.map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => set('soaDiscountPercent', pct)}
                      className={`px-4 py-2 rounded-input text-sm font-medium transition-colors ${
                        quote.soaDiscountPercent === pct
                          ? 'bg-teal text-white'
                          : 'bg-light-surface text-dark hover:bg-light-border'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="text-sm">
                  {quote.soaDiscountPercent === 100 ? (
                    <>
                      <span className="text-gray-400 line-through mr-1">{formatCurrency(soaOriginal)}</span>
                      <span className="text-gray-300 mr-1">→</span>
                      <span className="font-semibold text-gray-900 mr-2">Waived</span>
                      <span className="text-green-600">(saving {formatCurrency(soaSaving)})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400 line-through mr-1">{formatCurrency(soaOriginal)}</span>
                      <span className="text-gray-300 mr-1">→</span>
                      <span className="font-semibold text-gray-900 mr-2">{formatCurrency(soaDiscounted)}</span>
                      <span className="text-green-600">(saving {formatCurrency(soaSaving)})</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Implementation fee waiver */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${noImpl ? 'text-mid' : 'text-dark'}`}>Waive implementation fee</span>
              <Toggle
                checked={!!quote.waiveImplementation}
                onChange={v => set('waiveImplementation', v)}
                label="Waive implementation fee"
                disabled={noImpl}
              />
            </div>
            {noImpl ? (
              <p className="text-xs text-mid">No implementation fees to waive.</p>
            ) : quote.waiveImplementation ? (
              <p className="text-sm text-green-600">Implementation fee of {formatCurrency(calc.implTotal)} waived.</p>
            ) : null}
          </div>

          <p className="text-xs text-gray-400 italic">These discounts apply when the client proceeds with the ongoing service arrangement.</p>
        </div>
      )}
    </div>
  );
}

// ── Entity fee split ───────────────────────────────────────────────────────────
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
                    <NumInput
                      value={entity.balance}
                      onChange={v => dispatch({ type: 'SET_ENTITY', index: i, field: 'balance', value: v })}
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
