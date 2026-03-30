import { useState } from 'react';
import Toggle from '../../components/shared/Toggle';
import Tooltip from '../../components/shared/Tooltip';
import NumInput from '../../components/shared/NumInput';
import TierEditor from './TierEditor';
import { REVIEW_TASKS, ANNUAL_TASKS } from '../../lib/serviceLines';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency } from '../../lib/formatters';

export default function Step3OngoingService({ quote, dispatch, onNext, onBack }) {
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
              <SubscriptionModel quote={quote} dispatch={dispatch} set={set} calc={calc} />
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
                    min={0}
                    max={50000}
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

            {/* Running total bar — Fixed Fee only */}
            {quote.ongoingModel === 'fixedOnly' && (
              <div className="bg-white rounded-card border border-light-border px-5 py-3.5 flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-mid">Review meetings</span>
                  <span className="text-sm font-bold text-dark">{formatCurrency(calc.costPerReview * calc.reviewMeetings)}</span>
                  <span className="text-xs text-mid">ex GST</span>
                </div>
                <div className="text-light-border text-xs">|</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-mid">Annual tasks</span>
                  <span className="text-sm font-bold text-dark">{formatCurrency(calc.totalAnnualTaskFee)}</span>
                  <span className="text-xs text-mid">ex GST</span>
                </div>
                {calc.ongoingCommissionOffset > 0 && (
                  <>
                    <div className="text-light-border text-xs">|</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-mid">Commission offset</span>
                      <span className="text-sm font-bold text-risk-text">-{formatCurrency(calc.ongoingCommissionOffset)}</span>
                    </div>
                  </>
                )}
                <div className="text-light-border text-xs">|</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-mid">{calc.ongoingCommissionOffset > 0 ? 'Net at cost' : 'Total at cost'}</span>
                  <span className="text-sm font-bold text-dark">{formatCurrency(Math.max(0, calc.fixedOngoingFee - calc.ongoingCommissionOffset))}</span>
                  <span className="text-xs text-mid">ex GST</span>
                </div>
                <div className="ml-auto text-xs text-mid">Profit margin and GST applied in Step 5.</div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

// ── Shared: task tables (review + annual) ─────────────────────────────────────
function OngoingTaskTables({ quote, dispatch, calc }) {
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
                            min={0}
                            max={50}
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
                  {calc.reviewMeetings} meeting{calc.reviewMeetings !== 1 ? 's' : ''} × {formatCurrency(calc.costPerReview)}
                </td>
                <td className="py-2 px-5 text-right text-sm font-semibold text-teal">
                  {formatCurrency(calc.reviewMeetings * calc.costPerReview)}
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
                            min={0}
                            max={50}
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

// ── Fixed Fee model ───────────────────────────────────────────────────────────
function FixedFeeModel({ quote, dispatch, calc }) {
  const set = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });

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
              onChange={v => set('reviewMeetings', Math.max(0, Math.min(12, Math.round(v))))}
              integer
              min={0}
              max={12}
              className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 text-center"
            />
            <span className="text-xs text-mid">per year (max 12)</span>
          </div>
        </div>
      </div>

      <OngoingTaskTables quote={quote} dispatch={dispatch} calc={calc} />
    </>
  );
}

// ── Percentage Based model ─────────────────────────────────────────────────────
function PercentageModel({ quote, dispatch, calc, set }) {
  const fum = Number(quote.fum) || 0;
  const minimumFeeApplied = (Number(quote.minimumAnnualFee) || 0) > 0 && calc.variableFeeRaw < (Number(quote.minimumAnnualFee) || 0);
  const hasPlatformFee = (Number(quote.platformFeeRate) || 0) > 0;

  return (
    <>
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
            min={0}
            max={50000000}
            className="w-40 rounded-input border border-light-border px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
        </div>
      </div>

      {/* Tier editor */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2">Fee tiers</label>
        <TierEditor tiers={quote.tiers} dispatch={dispatch} />
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
            min={0}
            max={50000}
            className="w-32 rounded-input border border-light-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
          <span className="text-xs text-mid">p.a.</span>
        </div>
      </div>

      {/* Change 3: Prominent annual fee summary */}
      {fum > 0 && (
        <div className="bg-dark rounded-card px-5 py-4 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-400">Annual ongoing fee</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{formatCurrency(calc.variableFee)}</span>
              {minimumFeeApplied && (
                <div className="text-xs text-amber-400 mt-0.5">Minimum fee applied</div>
              )}
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500">Effective rate</span>
            <span className="text-sm font-medium text-gray-300">{((calc.effectiveFumRate || 0) * 100).toFixed(2)}% of FUM</span>
          </div>
          {hasPlatformFee && (
            <>
              <div className="border-t border-gray-700 pt-2 mt-1 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-500">Advice fee</span>
                  <span className="text-sm text-gray-300">{formatCurrency(calc.variableFee)} ({((calc.effectiveFumRate || 0) * 100).toFixed(2)}%)</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-500">Platform fee</span>
                  <span className="text-sm text-gray-300">{formatCurrency(calc.platformFeeAmount)} ({(Number(quote.platformFeeRate) || 0).toFixed(2)}%)</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-gray-700 pt-1">
                  <span className="text-xs text-gray-400 font-medium">Total annual cost</span>
                  <span className="text-sm font-semibold text-white">{formatCurrency(calc.variableFee + calc.platformFeeAmount)} ({(((calc.effectiveFumRate || 0) + (Number(quote.platformFeeRate) || 0) / 100) * 100).toFixed(2)}%)</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Change 4: Platform administration fee */}
      <div className="border-t border-light-border pt-4">
        <div className="flex items-center gap-1.5 mb-1">
          <label className="text-sm font-medium text-dark">Platform administration fee</label>
          <Tooltip text="The platform fee (e.g., Netwealth, HUB24, Macquarie Wrap) is charged separately by the platform provider, not by your practice. Including it here shows the client their total cost of advice and administration." />
        </div>
        <div className="flex items-center gap-2">
          <NumInput
            value={quote.platformFeeRate ?? 0}
            onChange={v => set('platformFeeRate', Math.max(0, Math.min(5, v)))}
            min={0}
            max={5}
            step={0.01}
            className="w-20 rounded-input border border-light-border px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
          <span className="text-sm text-mid">% of FUM</span>
          {hasPlatformFee && fum > 0 && (
            <span className="text-sm text-mid ml-2">= {formatCurrency(calc.platformFeeAmount)}</span>
          )}
        </div>
        <p className="text-xs text-mid mt-1">Optional — leave at 0% to exclude. Display only, does not affect your fee or profitability.</p>
      </div>

      {/* Additional platform / account fee */}
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
                min={0}
                max={5000}
                className="w-24 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Service Delivery */}
    <div className="bg-white rounded-card border border-light-border p-5 space-y-4">
      <h3 className="text-base font-bold font-heading text-dark">Service Delivery</h3>
      <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800">
        These hours estimate the cost of delivering your ongoing service. They don't change the fee charged — they help you understand whether your FUM-based fee covers the actual work involved.
      </div>
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
            onChange={v => set('reviewMeetings', Math.max(0, Math.min(12, Math.round(v))))}
            integer
            min={0}
            max={12}
            className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 text-center"
          />
          <span className="text-xs text-mid">per year (max 12)</span>
        </div>
      </div>
      <OngoingTaskTables quote={quote} dispatch={dispatch} calc={calc} />
    </div>
    </>
  );
}

// ── Subscription model ─────────────────────────────────────────────────────────
function SubscriptionModel({ quote, dispatch, set, calc }) {
  return (
    <>
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
            min={0}
            max={5000}
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
            onChange={v => set('includedReviews', Math.max(0, Math.min(12, Math.round(v))))}
            integer
            min={0}
            max={12}
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
            min={0}
            max={1000}
            className="w-28 rounded-input border border-light-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
          <span className="text-sm text-mid">/ hour</span>
        </div>
      </div>
    </div>

    {/* Service Delivery */}
    <div className="bg-white rounded-card border border-light-border p-5 space-y-4">
      <h3 className="text-base font-bold font-heading text-dark">Service Delivery</h3>
      <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800">
        These hours estimate the cost of delivering your included review meetings and annual tasks. They don't change your subscription fee — they help you understand whether the subscription covers the actual work involved.
      </div>
      <OngoingTaskTables quote={quote} dispatch={dispatch} calc={calc} />
    </div>
    </>
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

          {/* Implementation fee discount */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${noImpl ? 'text-mid' : 'text-dark'}`}>Discount implementation fee</span>
              <Toggle
                checked={(quote.implDiscountPercent ?? 0) > 0}
                onChange={v => set('implDiscountPercent', v ? 100 : 0)}
                label="Discount implementation fee"
                disabled={noImpl}
              />
            </div>
            {noImpl ? (
              <p className="text-xs text-mid">No implementation fees to discount.</p>
            ) : (quote.implDiscountPercent ?? 0) > 0 ? (
              <>
                <div className="flex gap-2">
                  {discountOptions.map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => set('implDiscountPercent', pct)}
                      className={`px-4 py-2 rounded-input text-sm font-medium transition-colors ${
                        quote.implDiscountPercent === pct
                          ? 'bg-teal text-white'
                          : 'bg-light-surface text-dark hover:bg-light-border'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="text-sm">
                  {quote.implDiscountPercent === 100 ? (
                    <>
                      <span className="text-gray-400 line-through mr-1">{formatCurrency(calc.implTotal)}</span>
                      <span className="text-gray-300 mr-1">→</span>
                      <span className="font-semibold text-gray-900 mr-2">Waived</span>
                      <span className="text-green-600">(saving {formatCurrency(calc.implTotal)})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400 line-through mr-1">{formatCurrency(calc.implTotal)}</span>
                      <span className="text-gray-300 mr-1">→</span>
                      <span className="font-semibold text-gray-900 mr-2">{formatCurrency(calc.implIncentivisedFee)}</span>
                      <span className="text-green-600">(saving {formatCurrency(calc.implDiscountAmount)})</span>
                    </>
                  )}
                </div>
              </>
            ) : null}
          </div>

          <p className="text-xs text-gray-400 italic">These discounts apply when the client proceeds with the ongoing service arrangement.</p>

          {((quote.soaDiscountPercent ?? 0) > 0 || (quote.implDiscountPercent ?? 0) > 0) && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800 mt-4">
              <span className="font-medium">ⓘ</span> Additional discounts (relationship and engagement factors) can be applied in the next step. You'll see the combined impact of all discounts in Fee Summary.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
