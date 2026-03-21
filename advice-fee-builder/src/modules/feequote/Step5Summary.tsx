import { useState } from 'react';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency, formatHours } from '../../lib/formatters';
import NumInput from '../../components/shared/NumInput';
import ConfirmModal from '../../components/shared/ConfirmModal';

const TABS = ['Summary', 'Detailed Breakdown', 'Profitability', 'Client Output'];

export default function Step5Summary({ quote, dispatch, onBack, onReset }) {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [editingParagraph, setEditingParagraph] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const calc = calculateQuote(quote);

  function handleCopy() {
    navigator.clipboard.writeText(calc.clientParagraph).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold font-heading text-dark mb-4 print:hidden" style={{ letterSpacing: '-0.3px' }}>Fee Summary & Output</h2>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold font-heading text-dark">
          Advice Fee Summary{quote.clientName ? ` — ${quote.clientName}` : ''}
        </h1>
        <p className="text-sm text-mid">{quote.date}</p>
        <div className="border-b-2 border-teal mt-3" />
      </div>

      {/* Profit Margin — global input above tabs */}
      <div className="bg-white rounded-card border border-light-border px-5 py-3.5 mb-4 print:hidden">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-dark whitespace-nowrap">Profit Margin</label>
            <div className="flex items-center gap-1">
              <NumInput
                value={quote.profitMarginPercent ?? 0}
                onChange={v => dispatch({ type: 'SET_QUOTE_FIELD', field: 'profitMarginPercent', value: Math.min(100, Math.max(0, v)) })}
                integer
                emptyDefault={0}
                className="w-14 rounded-input border border-light-border px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-teal focus:ring-offset-0"
              />
              <span className="text-sm text-mid">%</span>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={quote.applyMarginToOngoing !== false}
              onChange={e => dispatch({ type: 'SET_QUOTE_FIELD', field: 'applyMarginToOngoing', value: e.target.checked })}
              className="w-4 h-4 rounded border-light-border text-teal focus:ring-teal"
            />
            <span className="text-sm text-dark">Apply to ongoing fee</span>
          </label>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-light-border print:hidden">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === i
                ? 'border-teal text-teal'
                : 'border-transparent text-mid hover:text-dark'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Print — always render Summary content */}
      <div className={tab !== 0 ? 'print:block hidden' : ''}>
        {tab === 0 && <Tab1Summary calc={calc} quote={quote} />}
      </div>
      {tab === 1 && <Tab2Breakdown calc={calc} quote={quote} />}
      {tab === 2 && <Tab3Profitability calc={calc} quote={quote} />}
      {tab === 3 && (
        <Tab4ClientOutput
          calc={calc}
          quote={quote}
          dispatch={dispatch}
          copied={copied}
          onCopy={handleCopy}
          editingParagraph={editingParagraph}
          setEditingParagraph={setEditingParagraph}
          onReset={() => setShowResetModal(true)}
        />
      )}

      {showResetModal && (
        <ConfirmModal
          title="Reset Quote"
          message="This will clear all inputs and return to defaults. This cannot be undone."
          confirmLabel="Reset"
          onConfirm={() => { setShowResetModal(false); onReset(); }}
          onCancel={() => setShowResetModal(false)}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 print:hidden">
        <button
          onClick={onBack}
          className="text-sm text-mid hover:text-dark font-medium py-2.5 px-4 rounded-input border border-light-border hover:border-mid transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// ── Tab 1: Summary ─────────────────────────────────────────────────────────────
function Tab1Summary({ calc, quote }) {
  return (
    <div className="space-y-5">
      {/* Initial fees */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-xs font-semibold font-heading text-mid uppercase tracking-wide mb-4">Initial Fees</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-mid">SOA Preparation Fee (excl GST)</span>
            <span className="text-dark">{formatCurrency(calc.adjustedFeeRounded)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mid">GST</span>
            <span className="text-dark">{formatCurrency(calc.soaGst)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-light-border pt-2 mt-2">
            <span className="text-dark">SOA Preparation Fee (incl GST)</span>
            <span className="text-dark">{formatCurrency(calc.soaTotalInclGst)}</span>
          </div>
          {calc.implTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-mid">Implementation Fees (incl GST)</span>
              <span className="text-dark">{formatCurrency(calc.implTotal)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-light-border pt-3 mt-2">
            <span className="text-base font-bold text-dark">Total Initial Fees</span>
            <span className="text-base font-bold text-teal">{formatCurrency(calc.totalInitialFees)}</span>
          </div>
        </div>
        {calc.soaMarginPercent > 0 && (
          <p className="mt-3 text-xs text-gray-400">
            Margin applied: {calc.soaMarginPercent}% · SOA margin: {formatCurrency(calc.soaMarginAmount)}
            {calc.ongoingMarginPercent > 0 && ` · Ongoing margin: ${formatCurrency(calc.ongoingMarginAmount)} p.a.`}
          </p>
        )}
      </div>

      {/* Ongoing fees */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-xs font-semibold font-heading text-mid uppercase tracking-wide mb-4">Ongoing Fees</h3>
        {calc.hasOngoing && calc.totalOngoingInclGst > 0 ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-mid">Annual Service Fee (excl GST)</span>
              <span className="text-dark">{formatCurrency(calc.totalOngoingRounded)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mid">GST</span>
              <span className="text-dark">{formatCurrency(calc.ongoingGst)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-light-border pt-2 mt-2">
              <span className="text-dark">Annual Service Fee (incl GST)</span>
              <span className="text-dark">{formatCurrency(calc.totalOngoingInclGst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mid">Monthly equivalent</span>
              <span className="text-dark">{formatCurrency(calc.monthlyOngoing)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-mid">No ongoing service fee quoted.</p>
        )}
      </div>

      {/* Billing plan */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-xs font-semibold font-heading text-mid uppercase tracking-wide mb-4">Suggested Billing Plan</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-border">
                <th className="text-left py-2 text-xs font-medium text-mid">Phase</th>
                <th className="text-left py-2 text-xs font-medium text-mid hidden sm:table-cell">Description</th>
                <th className="text-right py-2 text-xs font-medium text-mid">Amount</th>
                <th className="text-left py-2 text-xs font-medium text-mid hidden md:table-cell">When</th>
                <th className="text-left py-2 text-xs font-medium text-mid hidden md:table-cell">How</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {calc.billingPlan.map((row, i) => (
                <tr key={i}>
                  <td className="py-2.5 text-dark font-medium pr-3">{row.phase}</td>
                  <td className="py-2.5 text-mid pr-3 hidden sm:table-cell">{row.description}</td>
                  <td className="py-2.5 text-right font-semibold text-dark">{formatCurrency(row.amount)}</td>
                  <td className="py-2.5 text-mid pl-3 hidden md:table-cell">{row.when}</td>
                  <td className="py-2.5 text-mid pl-3 hidden md:table-cell">{row.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Detailed Breakdown ──────────────────────────────────────────────────
function Tab2Breakdown({ calc, quote }) {
  const isExternal = quote.paraplanner === 'external';

  const soaItems = [
    ...calc.strategyItems,
    ...calc.addOnItems,
    ...calc.coreTaskItems,
  ].filter(l => l.fee > 0 || l.totalHours > 0);

  return (
    <div className="space-y-5">
      {/* SOA Breakdown */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-base font-bold font-heading text-dark mb-4">SOA Preparation Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-border">
                <th className="text-left py-2 text-xs font-medium text-mid">Service</th>
                <th className="text-right py-2 text-xs font-medium text-mid">Adv Hrs</th>
                <th className="text-right py-2 text-xs font-medium text-mid hidden sm:table-cell">Para Hrs</th>
                <th className="text-right py-2 text-xs font-medium text-mid hidden sm:table-cell">Admin Hrs</th>
                <th className="text-right py-2 text-xs font-medium text-mid">Total Hrs</th>
                <th className="text-right py-2 text-xs font-medium text-mid">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {soaItems.map(line => (
                <tr key={line.id}>
                  <td className="py-2 text-dark pr-2">{line.label}</td>
                  <td className="py-2 text-right text-mid">{formatHours(line.adviserHoursUsed)}</td>
                  <td className="py-2 text-right text-mid hidden sm:table-cell">
                    {isExternal ? '—' : formatHours(line.paraplannerHoursUsed)}
                  </td>
                  <td className="py-2 text-right text-mid hidden sm:table-cell">{formatHours(line.adminHoursUsed)}</td>
                  <td className="py-2 text-right text-mid">{formatHours(line.totalHours)}</td>
                  <td className="py-2 text-right font-medium text-dark">{formatCurrency(line.fee)}</td>
                </tr>
              ))}
              {isExternal && calc.soaExternalFee > 0 && (
                <tr>
                  <td className="py-2 text-mid" colSpan={5}>External paraplanner fee</td>
                  <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.soaExternalFee)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-light-border">
                <td className="py-2 font-semibold text-dark" colSpan={5}>Subtotal: Base Fee</td>
                <td className="py-2 text-right font-bold text-dark">{formatCurrency(calc.baseFee)}</td>
              </tr>
              {calc.soaPremium > 0 && (
                <tr>
                  <td className="py-2 text-warning-text" colSpan={5}>
                    Premiums ({calc.premiumCount} factor{calc.premiumCount !== 1 ? 's' : ''}, +{Math.round(calc.premiumRate * 100)}%)
                  </td>
                  <td className="py-2 text-right font-medium text-warning-text">+{formatCurrency(calc.soaPremium)}</td>
                </tr>
              )}
              {calc.soaDiscount > 0 && (
                <tr>
                  <td className="py-2 text-healthy-text" colSpan={5}>
                    Discounts ({calc.discountCount} factor{calc.discountCount !== 1 ? 's' : ''}, -{Math.round(calc.discountRate * 100)}%)
                  </td>
                  <td className="py-2 text-right font-medium text-healthy-text">-{formatCurrency(calc.soaDiscount)}</td>
                </tr>
              )}
              {calc.soaMarginPercent > 0 && (
                <tr>
                  <td className="py-2 text-mid" colSpan={5}>Profit margin ({calc.soaMarginPercent}%)</td>
                  <td className="py-2 text-right font-medium text-mid">+{formatCurrency(calc.soaMarginAmount)}</td>
                </tr>
              )}
              <tr className="border-t border-light-border">
                <td className="py-2 font-semibold text-dark" colSpan={5}>Adjusted SOA Fee (excl GST)</td>
                <td className="py-2 text-right font-bold text-dark">{formatCurrency(calc.adjustedFeeRounded)}</td>
              </tr>
              <tr>
                <td className="py-2 text-mid" colSpan={5}>GST</td>
                <td className="py-2 text-right text-mid">{formatCurrency(calc.soaGst)}</td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-dark" colSpan={5}>SOA Fee (incl GST)</td>
                <td className="py-2 text-right font-bold text-teal">{formatCurrency(calc.soaTotalInclGst)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Implementation breakdown */}
      {calc.implTotal > 0 && (
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-base font-bold font-heading text-dark mb-4">Implementation Breakdown</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-light-border">
              {calc.implInvestmentFee > 0 && (
                <tr>
                  <td className="py-2 text-dark">
                    Investment & super implementation ({quote.investmentAccounts} account{quote.investmentAccounts !== 1 ? 's' : ''} × $550)
                  </td>
                  <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.implInvestmentFee)}</td>
                </tr>
              )}
              {calc.implInSpecieFee > 0 && (
                <tr>
                  <td className="py-2 text-dark">In-specie transfers ({quote.inSpecieHours} hrs)</td>
                  <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.implInSpecieFee)}</td>
                </tr>
              )}
              {calc.implInsuranceFee > 0 && (
                <tr>
                  <td className="py-2 text-dark">Insurance implementation ({quote.insuranceImplHours} hrs)</td>
                  <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.implInsuranceFee)}</td>
                </tr>
              )}
              {calc.commissionOffset > 0 && (
                <tr>
                  <td className="py-2 text-mid">Less: Insurance commission offset</td>
                  <td className="py-2 text-right font-medium text-risk-text">-{formatCurrency(calc.commissionOffset)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-light-border">
                <td className="py-2 font-bold text-dark">Total Implementation Fees (incl GST)</td>
                <td className="py-2 text-right font-bold text-teal">{formatCurrency(calc.implTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Ongoing breakdown */}
      {calc.hasOngoing && (
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-base font-bold font-heading text-dark mb-4">Ongoing Service Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-border">
                  <th className="text-left py-2 text-xs font-medium text-mid">Task</th>
                  <th className="text-right py-2 text-xs font-medium text-mid">Adv Hrs</th>
                  <th className="text-right py-2 text-xs font-medium text-mid hidden sm:table-cell">Para Hrs</th>
                  <th className="text-right py-2 text-xs font-medium text-mid hidden sm:table-cell">Admin Hrs</th>
                  <th className="text-right py-2 text-xs font-medium text-mid">Total Hrs</th>
                  <th className="text-right py-2 text-xs font-medium text-mid">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {calc.reviewTaskItems.map(t => (
                  <tr key={t.id}>
                    <td className="py-2 text-dark pr-2">{t.label} (× {calc.reviewMeetings})</td>
                    <td className="py-2 text-right text-mid">{formatHours(t.adviserHoursUsed * calc.reviewMeetings)}</td>
                    <td className="py-2 text-right text-mid hidden sm:table-cell">{formatHours(t.paraplannerHoursUsed * calc.reviewMeetings)}</td>
                    <td className="py-2 text-right text-mid hidden sm:table-cell">{formatHours(t.adminHoursUsed * calc.reviewMeetings)}</td>
                    <td className="py-2 text-right text-mid">{formatHours(t.totalHours * calc.reviewMeetings)}</td>
                    <td className="py-2 text-right font-medium text-dark">{formatCurrency(t.fee * calc.reviewMeetings)}</td>
                  </tr>
                ))}
                {calc.annualTaskItems.map(t => (
                  <tr key={t.id}>
                    <td className="py-2 text-dark pr-2">{t.label}</td>
                    <td className="py-2 text-right text-mid">{formatHours(t.adviserHoursUsed)}</td>
                    <td className="py-2 text-right text-mid hidden sm:table-cell">{formatHours(t.paraplannerHoursUsed)}</td>
                    <td className="py-2 text-right text-mid hidden sm:table-cell">{formatHours(t.adminHoursUsed)}</td>
                    <td className="py-2 text-right text-mid">{formatHours(t.totalHours)}</td>
                    <td className="py-2 text-right font-medium text-dark">{formatCurrency(t.fee)}</td>
                  </tr>
                ))}
                {quote.ongoingModel === 'percentageBased' && (
                  <tr>
                    <td className="py-2 text-mid" colSpan={5}>FUM-based fee ({formatCurrency(quote.fum)} FUM)</td>
                    <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.variableFee)}</td>
                  </tr>
                )}
                {quote.ongoingModel === 'subscription' && (
                  <tr>
                    <td className="py-2 text-mid" colSpan={5}>Subscription ({formatCurrency(quote.monthlySubscription)}/month × 12)</td>
                    <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.subscriptionAnnual)}</td>
                  </tr>
                )}
                {calc.ongoingPremium > 0 && (
                  <tr>
                    <td className="py-2 text-warning-text" colSpan={5}>
                      Premiums (+{Math.round(calc.premiumRate * 100)}%)
                    </td>
                    <td className="py-2 text-right font-medium text-warning-text">+{formatCurrency(calc.ongoingPremium)}</td>
                  </tr>
                )}
                {calc.ongoingDiscount > 0 && (
                  <tr>
                    <td className="py-2 text-healthy-text" colSpan={5}>
                      Discounts (-{Math.round(calc.discountRate * 100)}%)
                    </td>
                    <td className="py-2 text-right font-medium text-healthy-text">-{formatCurrency(calc.ongoingDiscount)}</td>
                  </tr>
                )}
                {calc.ongoingMarginPercent > 0 && (
                  <tr>
                    <td className="py-2 text-mid" colSpan={5}>Profit margin ({calc.ongoingMarginPercent}%)</td>
                    <td className="py-2 text-right font-medium text-mid">+{formatCurrency(calc.ongoingMarginAmount)}</td>
                  </tr>
                )}
                <tr className="border-t border-light-border">
                  <td className="py-2 font-semibold text-dark" colSpan={5}>Annual Service Fee (excl GST)</td>
                  <td className="py-2 text-right font-bold text-dark">{formatCurrency(calc.totalOngoingRounded)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-mid" colSpan={5}>GST</td>
                  <td className="py-2 text-right text-mid">{formatCurrency(calc.ongoingGst)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-dark" colSpan={5}>Annual Service Fee (incl GST)</td>
                  <td className="py-2 text-right font-bold text-teal">{formatCurrency(calc.totalOngoingInclGst)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Profitability ───────────────────────────────────────────────────────
function rateColor(rate: number) {
  if (rate >= 300) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Healthy' };
  if (rate >= 200) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Marginal' };
  return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Below cost' };
}

function StackedBar({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);
  if (total === 0) return <div className="h-6 bg-gray-100 rounded" />;
  return (
    <div className="space-y-2">
      <div className="flex h-6 rounded overflow-hidden">
        {segments.map(seg => {
          const pct = (Math.max(0, seg.value) / total) * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={seg.label}
              className={`${seg.color} min-w-[2px]`}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${formatCurrency(seg.value)}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.filter(s => s.value > 0).map(seg => (
          <div key={seg.label} className="flex items-center gap-1.5 text-xs text-mid">
            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${seg.color}`} />
            {seg.label}: {formatCurrency(seg.value)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Tab3Profitability({ calc, quote }) {
  const soaRate = calc.impliedHourlyRateSoa;
  const ongoingRate = calc.impliedHourlyRateOngoing;
  const soaColors = rateColor(soaRate);
  const ongoingColors = calc.hasOngoing ? rateColor(ongoingRate) : null;

  const soaTotalCost = calc.soaAdviserCost + calc.soaParaplannerCost + calc.soaAdminCost + calc.soaExternalFee;
  const soaMarginValue = calc.adjustedFeeRounded - soaTotalCost;

  const ongoingTotalCost = calc.ongoingAdviserCost + calc.ongoingParaplannerCost + calc.ongoingAdminCost;
  const ongoingMarginValue = calc.totalOngoingRounded - ongoingTotalCost;

  const totalFees = calc.adjustedFeeRounded + (calc.hasOngoing ? calc.totalOngoingRounded : 0);
  const totalMargin = soaMarginValue + (calc.hasOngoing ? ongoingMarginValue : 0);
  const totalMarginPct = totalFees > 0 ? (totalMargin / totalFees) * 100 : 0;

  // Warnings
  const warnings: { type: 'red' | 'amber' | 'info'; msg: string }[] = [];
  if (calc.soaMarginPercent === 0) {
    warnings.push({ type: 'info', msg: 'No profit margin has been applied. Consider adding a margin above.' });
  }
  if (soaRate > 0 && soaRate < 250) {
    warnings.push({ type: 'amber', msg: `Your implied hourly rate of ${formatCurrency(soaRate)}/hr (initial SOA) is below $250. You may be undercharging for this engagement.` });
  }
  if (calc.hasOngoing && ongoingRate > 0 && ongoingRate < 250) {
    warnings.push({ type: 'amber', msg: `Your implied hourly rate of ${formatCurrency(ongoingRate)}/hr (ongoing) is below $250. You may be undercharging for ongoing service.` });
  }
  if (soaMarginValue < 0) {
    warnings.push({ type: 'red', msg: `Your total SOA cost of ${formatCurrency(soaTotalCost)} exceeds the SOA fee of ${formatCurrency(calc.adjustedFeeRounded)}. You are losing ${formatCurrency(-soaMarginValue)} on this engagement.` });
  }
  if (calc.hasOngoing && ongoingMarginValue < 0) {
    warnings.push({ type: 'red', msg: `Your total ongoing cost of ${formatCurrency(ongoingTotalCost)} exceeds the ongoing fee of ${formatCurrency(calc.totalOngoingRounded)}. You are losing ${formatCurrency(-ongoingMarginValue)} p.a. on this client.` });
  }

  return (
    <div className="space-y-5">
      {/* Key metric cards */}
      <div className={`grid gap-4 ${calc.hasOngoing ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {/* SOA implied rate */}
        <div className={`rounded-card border p-4 ${soaColors.bg} ${soaColors.border}`}>
          <div className="text-xs font-semibold font-heading uppercase tracking-wide text-mid mb-1">Implied Rate — Initial SOA</div>
          <div className={`text-2xl font-bold font-heading ${soaColors.text}`}>
            {soaRate > 0 ? `${formatCurrency(soaRate)}/hr` : '—'}
          </div>
          <div className="text-xs text-mid mt-1">
            {formatCurrency(calc.adjustedFeeRounded)} fee ÷ {calc.totalBaseHours.toFixed(1)} hrs
          </div>
          <div className={`text-xs font-semibold mt-1 ${soaColors.text}`}>{soaColors.label}</div>
        </div>

        {/* Ongoing implied rate */}
        {calc.hasOngoing && ongoingColors && (
          <div className={`rounded-card border p-4 ${ongoingColors.bg} ${ongoingColors.border}`}>
            <div className="text-xs font-semibold font-heading uppercase tracking-wide text-mid mb-1">Implied Rate — Ongoing</div>
            <div className={`text-2xl font-bold font-heading ${ongoingColors.text}`}>
              {ongoingRate > 0 ? `${formatCurrency(ongoingRate)}/hr` : '—'}
            </div>
            <div className="text-xs text-mid mt-1">
              {formatCurrency(calc.totalOngoingRounded)} fee ÷ {calc.totalOngoingHours.toFixed(1)} hrs
            </div>
            <div className={`text-xs font-semibold mt-1 ${ongoingColors.text}`}>{ongoingColors.label}</div>
          </div>
        )}

        {/* Total margin */}
        <div className={`rounded-card border p-4 ${totalMargin >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-xs font-semibold font-heading uppercase tracking-wide text-mid mb-1">Total Margin</div>
          <div className={`text-2xl font-bold font-heading ${totalMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(totalMargin)}
          </div>
          <div className="text-xs text-mid mt-1">{totalMarginPct.toFixed(1)}% of total fees</div>
        </div>
      </div>

      {/* Cost breakdown charts */}
      <div className="bg-white rounded-card border border-light-border p-5 space-y-5">
        <h3 className="text-base font-bold font-heading text-dark">Cost Breakdown</h3>

        <div>
          <div className="text-sm font-medium text-dark mb-2">Initial SOA</div>
          <StackedBar segments={[
            { label: 'Adviser time', value: calc.soaAdviserCost, color: 'bg-blue-400' },
            { label: 'Paraplanning', value: calc.soaParaplannerCost + calc.soaExternalFee, color: 'bg-teal' },
            { label: 'Admin', value: calc.soaAdminCost, color: 'bg-gray-300' },
            ...(soaMarginValue > 0 ? [{ label: 'Margin', value: soaMarginValue, color: 'bg-green-400' }] : []),
          ]} />
        </div>

        {calc.hasOngoing && calc.totalOngoingHours > 0 && (
          <div>
            <div className="text-sm font-medium text-dark mb-2">Ongoing (annual)</div>
            <StackedBar segments={[
              { label: 'Adviser time', value: calc.ongoingAdviserCost, color: 'bg-blue-400' },
              { label: 'Paraplanning', value: calc.ongoingParaplannerCost, color: 'bg-teal' },
              { label: 'Admin', value: calc.ongoingAdminCost, color: 'bg-gray-300' },
              ...(ongoingMarginValue > 0 ? [{ label: 'Margin', value: ongoingMarginValue, color: 'bg-green-400' }] : []),
            ]} />
          </div>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`rounded-card border px-4 py-3 text-sm ${
                w.type === 'red'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : w.type === 'amber'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              {w.msg}
            </div>
          ))}
        </div>
      )}

      {/* Industry benchmarks placeholder */}
      <div className="rounded-card border border-dashed border-gray-300 px-5 py-8 text-center">
        <div className="text-sm font-semibold text-mid mb-1">Industry Benchmarks — Coming Soon</div>
        <div className="text-xs text-mid">
          Compare your fees against industry averages from Adviser Ratings, Investment Trends, and other sources.
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Client Output ───────────────────────────────────────────────────────
function Tab4ClientOutput({ calc, quote, dispatch, copied, onCopy, editingParagraph, setEditingParagraph, onReset }) {
  return (
    <div className="space-y-5">
      {/* Service summary */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-base font-bold font-heading text-dark mb-4">What's Included</h3>
        <ul className="space-y-2">
          {calc.serviceSummaryItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-dark">
              <span className="text-teal mt-0.5 flex-shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Client paragraph */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold font-heading text-dark">Client-Facing Fee Summary</h3>
          <label className="flex items-center gap-2 text-xs text-mid cursor-pointer">
            <input
              type="checkbox"
              checked={editingParagraph}
              onChange={e => setEditingParagraph(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-light-border text-teal focus:ring-teal"
            />
            Edit before copying
          </label>
        </div>

        {editingParagraph ? (
          <textarea
            value={calc.clientParagraph}
            onChange={e => dispatch({ type: 'SET_QUOTE_FIELD', field: 'clientParagraphOverride', value: e.target.value })}
            rows={12}
            className="w-full rounded-input border border-light-border px-3 py-2.5 text-[15px] font-mono focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 resize-y"
          />
        ) : (
          <div className="bg-light-surface rounded-input p-4 text-sm text-dark whitespace-pre-wrap leading-relaxed border border-light-border">
            {calc.clientParagraph}
          </div>
        )}

        <button
          onClick={onCopy}
          className={`mt-4 w-full py-3 px-6 rounded-lg text-sm font-semibold transition-colors ${
            copied ? 'bg-healthy text-white' : 'bg-teal hover:opacity-90 text-white'
          }`}
        >
          {copied ? 'Copied' : 'Copy to Clipboard'}
        </button>
      </div>

      {/* PDF export */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-base font-bold font-heading text-dark mb-1">Download PDF</h3>
        <p className="text-xs text-mid mb-3">Opens print dialog. Use your browser's "Save as PDF" option.</p>
        <button
          onClick={() => window.print()}
          className="bg-dark hover:bg-dark-surface text-white font-medium py-2.5 px-6 rounded-input transition-colors text-sm"
        >
          Download PDF
        </button>
      </div>

      {/* Reset */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-base font-bold font-heading text-dark mb-1">Reset Quote</h3>
        <p className="text-xs text-mid mb-3">Clear all inputs and return to defaults.</p>
        <button
          onClick={onReset}
          className="bg-white border border-risk text-risk-text hover:bg-risk-bg font-medium py-2.5 px-6 rounded-input transition-colors text-sm"
        >
          Reset Quote
        </button>
      </div>
    </div>
  );
}
