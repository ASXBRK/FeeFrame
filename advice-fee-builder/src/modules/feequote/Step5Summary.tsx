import { useState } from 'react';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency, formatHours } from '../../lib/formatters';
import NumInput from '../../components/shared/NumInput';
import ConfirmModal from '../../components/shared/ConfirmModal';
import Tooltip from '../../components/shared/Tooltip';

const TABS = ['Summary', 'Detailed Breakdown', 'Profitability', 'Client Output'];

export default function Step5Summary({ quote, dispatch, onBack, onReset, onNavigate }) {
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
            <label className="text-sm font-medium text-dark whitespace-nowrap flex items-center gap-1.5">
              Profit Margin
              <Tooltip text="Industry benchmark: the average Australian advice practice operates at a 21% profit margin (Adviser Ratings 2024). Top-performing practices (top 10%) achieve 47% profit margins before tax (Iress Advisely Index 2024)." />
            </label>
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

      {/* Profit margin info box */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800 mt-3 mb-4 print:hidden">
        <span className="font-medium">ⓘ</span> Your firm's target profit margin applied to all fees. The average Australian advice practice operates at 21% (Adviser Ratings 2024).
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
      {tab === 2 && <Tab3Profitability calc={calc} quote={quote} onNavigate={onNavigate} />}
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

      {/* Incentivised fees — only shown when incentives are active */}
      {calc.hasIncentives && (
        <div className="bg-white rounded-card border-l-4 border-l-green-500 border border-light-border p-5">
          <h3 className="text-xs font-semibold font-heading text-mid uppercase tracking-wide mb-4">With Ongoing Arrangement</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-mid">SOA Preparation Fee (incl GST)</span>
              <span className="flex items-center gap-2">
                {calc.soaDiscountPercent > 0 && (
                  <span className="text-gray-400 line-through">{formatCurrency(calc.soaTotalInclGst)}</span>
                )}
                <span className="font-semibold text-gray-900">
                  {calc.soaDiscountPercent === 100 ? 'Waived' : formatCurrency(calc.soaIncentivisedFee)}
                </span>
                {calc.soaDiscountPercent > 0 && (
                  <span className="text-green-600 text-xs">-{calc.soaDiscountPercent}%</span>
                )}
              </span>
            </div>
            {calc.implTotal > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-mid">Implementation Fees (incl GST)</span>
                <span className="flex items-center gap-2">
                  {calc.waiveImplementation && (
                    <span className="text-gray-400 line-through">{formatCurrency(calc.implTotal)}</span>
                  )}
                  <span className="font-semibold text-gray-900">
                    {calc.waiveImplementation ? 'Waived' : formatCurrency(calc.implTotal)}
                  </span>
                </span>
              </div>
            )}
            <div className="flex justify-between items-center border-t-2 border-light-border pt-3 mt-2">
              <span className="text-base font-bold text-dark">Total Initial Fees</span>
              <span className="flex items-center gap-3">
                <span className="text-base font-bold text-teal">{formatCurrency(calc.totalIncentivisedInitialFees)}</span>
                <span className="text-green-600 text-sm font-medium">saving {formatCurrency(calc.totalIncentiveSaving)}</span>
              </span>
            </div>
          </div>
        </div>
      )}

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
                  <td className="py-2.5 pr-3 hidden sm:table-cell">
                    <span className="text-mid">{row.description}</span>
                    {row.note && <span className="block text-xs text-green-600 mt-0.5">{row.note}</span>}
                  </td>
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

function Tab3Profitability({ calc, quote, onNavigate }) {
  const isFixedOngoing = calc.hasOngoing && quote.ongoingModel === 'fixedOnly';
  const isPercentageOngoing = calc.hasOngoing && quote.ongoingModel === 'percentageBased';
  const isSubscriptionOngoing = calc.hasOngoing && quote.ongoingModel === 'subscription';
  const hasOngoingCostData = isFixedOngoing;

  const soaDirectCost = calc.soaAdviserCost + calc.soaParaplannerCost + calc.soaAdminCost;
  const soaTotalCost = soaDirectCost + calc.soaExternalFee;
  const soaMarginValue = calc.adjustedFeeRounded - soaTotalCost;

  const ongoingTotalCost = calc.ongoingAdviserCost + calc.ongoingParaplannerCost + calc.ongoingAdminCost;
  const ongoingMarginValue = calc.totalOngoingRounded - ongoingTotalCost;

  const firstYearMargin = calc.soaMarginAmount + (hasOngoingCostData ? calc.ongoingMarginAmount : 0);

  // Smart callouts
  const callouts: string[] = [];

  if (soaDirectCost > 0 && calc.soaParaplannerCost / soaDirectCost > 0.45) {
    const pct = Math.round((calc.soaParaplannerCost / soaDirectCost) * 100);
    callouts.push(`Paraplanning represents ${pct}% of your SOA cost (${formatCurrency(calc.soaParaplannerCost)} of ${formatCurrency(soaDirectCost)}). If paraplanning hours or rates feel high, consider whether some tasks could shift to admin or be streamlined with templates and technology.`);
  }

  if (soaTotalCost > 0 && calc.soaAdviserCost / soaTotalCost > 0.55) {
    const pct = Math.round((calc.soaAdviserCost / soaTotalCost) * 100);
    callouts.push(`Adviser time represents ${pct}% of your SOA cost (${formatCurrency(calc.soaAdviserCost)} of ${formatCurrency(soaTotalCost)}). If adviser hours feel high, consider whether some preparation or research tasks could be delegated to paraplanning or admin staff.`);
  }

  if (soaTotalCost > 0 && calc.soaAdminCost / soaTotalCost > 0.30) {
    const pct = Math.round((calc.soaAdminCost / soaTotalCost) * 100);
    callouts.push(`Administration represents ${pct}% of your SOA cost (${formatCurrency(calc.soaAdminCost)} of ${formatCurrency(soaTotalCost)}). High admin costs may indicate manual processes that could benefit from automation or systemisation.`);
  }

  if (calc.adjustedFeeRounded > 0 && calc.adjustedFeeRounded < 2000) {
    callouts.push(`This engagement quotes below $2,000. The average initial advice fee in Australia is $2,500–$4,400 (Investment Trends 2024). Consider whether the scope fully reflects the work required.`);
  }

  if (calc.adjustedFeeRounded > 10000) {
    callouts.push(`This engagement quotes above $10,000. While complex engagements can justify this fee, ensure the client understands the value being delivered. Only 6–7% of advisers price above this level (Adviser Ratings 2025).`);
  }

  if (soaTotalCost > 0 && calc.soaExternalFee / soaTotalCost > 0.50) {
    const pct = Math.round((calc.soaExternalFee / soaTotalCost) * 100);
    callouts.push(`Your external paraplanner fee represents ${pct}% of the total SOA cost. Consider whether an internal paraplanner or AI-assisted paraplanning could reduce this.`);
  }

  if (calc.soaMarginPercent > 0 && calc.soaMarginPercent < 15) {
    callouts.push(`Your margin of ${calc.soaMarginPercent}% is below the industry average of 21%. While this may be appropriate for some engagements, sustained low margins can impact business viability.`);
  }

  const firstYearMarginWithIncentives = calc.hasIncentives
    ? firstYearMargin - calc.totalIncentiveSaving
    : firstYearMargin;

  return (
    <div className="space-y-5">
      {/* Zero margin info */}
      {calc.soaMarginPercent === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex gap-3">
            <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span>
            <div className="text-sm text-amber-800">
              <span className="font-semibold">No profit margin applied.</span> Your quoted fees currently reflect cost only. Use the margin input above to add your target profitability.
            </div>
          </div>
        </div>
      )}

      {/* Incentives impact callout */}
      {calc.hasIncentives && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex gap-3">
            <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span>
            <div className="text-sm text-amber-800 space-y-1">
              <div className="font-semibold">Client incentives applied</div>
              {calc.soaDiscountPercent > 0 && (
                <div>SOA discount ({calc.soaDiscountPercent}%): -{formatCurrency(calc.soaDiscountAmount)}</div>
              )}
              {calc.waiveImplementation && calc.implTotal > 0 && (
                <div>Implementation waiver: -{formatCurrency(calc.implTotal)}</div>
              )}
              <div className="font-medium pt-1">
                Total first-year margin impact: -{formatCurrency(calc.totalIncentiveSaving)}
              </div>
              <div>
                Your first-year margin with incentives: <span className="font-semibold">{formatCurrency(firstYearMarginWithIncentives)}</span>
                <span className="text-amber-600"> (was {formatCurrency(firstYearMargin)} without incentives)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: SOA cost → fee */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SOA Cost → Fee</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-gray-500">{formatCurrency(calc.soaCostBeforeMargin)}</span>
            <span className="text-gray-300">→</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(calc.adjustedFeeRounded)}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1.5">
            Margin:{' '}
            <span className={calc.soaMarginAmount > 0 ? 'font-semibold text-green-600' : 'text-gray-400'}>
              {formatCurrency(calc.soaMarginAmount)}
            </span>
            {' '}
            <span className="text-gray-400">({calc.soaMarginPercent}%)</span>
          </div>
        </div>

        {/* Card 2: Ongoing cost → fee */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ongoing Cost → Fee</div>
          {!calc.hasOngoing ? (
            <div className="text-sm text-gray-400">No ongoing fee</div>
          ) : hasOngoingCostData ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-gray-500">{formatCurrency(calc.ongoingCostBeforeMargin)}</span>
                <span className="text-gray-300">→</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(calc.totalOngoingRounded)}</span>
                <span className="text-sm text-gray-400">/yr</span>
              </div>
              <div className="text-sm text-gray-500 mt-1.5">
                Margin:{' '}
                <span className={calc.ongoingMarginAmount > 0 ? 'font-semibold text-green-600' : 'text-gray-400'}>
                  {formatCurrency(calc.ongoingMarginAmount)}
                </span>
                {' '}
                <span className="text-gray-400">({calc.ongoingMarginPercent}%)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-gray-400">—</span>
                <span className="text-gray-300">→</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(calc.totalOngoingRounded)}</span>
                <span className="text-sm text-gray-400">/yr</span>
              </div>
              <div className="text-sm text-gray-400 mt-1.5">N/A — no cost data</div>
            </>
          )}
        </div>

        {/* Card 3: Total first year profit */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total First Year</div>
          <div className={`text-2xl font-bold ${firstYearMargin > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {formatCurrency(firstYearMargin)}
          </div>
          {(isPercentageOngoing || isSubscriptionOngoing) ? (
            <div className="text-sm text-gray-400 mt-1">SOA margin only — ongoing cost data not available</div>
          ) : (
            <div className="text-sm text-gray-400 mt-1">Combined first year profit</div>
          )}
        </div>
      </div>

      {/* SOA cost breakdown */}
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

        {/* Fixed ongoing cost breakdown */}
        {isFixedOngoing && calc.totalOngoingHours > 0 && (
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

        {/* Percentage-based ongoing — no cost breakdown */}
        {isPercentageOngoing && (
          <div className="border-t border-light-border pt-4">
            <div className="text-sm font-medium text-dark mb-2">Ongoing (percentage-based)</div>
            <div className="text-sm text-mid space-y-1">
              <div>
                <span className="text-dark font-medium">Percentage-based fee: {formatCurrency(calc.totalOngoingRounded)} p.a.</span>
                {' '}Based on {formatCurrency(Number(quote.fum) || 0)} FUM across {(quote.tiers || []).length} tier{(quote.tiers || []).length !== 1 ? 's' : ''}.
                {' '}Effective rate: {(calc.effectiveFumRate * 100).toFixed(2)}%
              </div>
              <p className="text-xs text-mid mt-2">
                For detailed profitability analysis of percentage-based arrangements,{' '}
                <button
                  onClick={() => onNavigate('feeanalysis')}
                  className="text-teal underline hover:no-underline font-medium"
                >
                  use FeeAnalysis
                </button>
                {' '}with your actual time-tracking data to understand your true cost to serve.
              </p>
            </div>
          </div>
        )}

        {/* Subscription ongoing — no cost breakdown */}
        {isSubscriptionOngoing && (
          <div className="border-t border-light-border pt-4">
            <div className="text-sm font-medium text-dark mb-2">Ongoing (subscription)</div>
            <div className="text-sm text-mid space-y-1">
              <div>
                <span className="text-dark font-medium">Subscription fee: {formatCurrency(calc.totalOngoingRounded)} p.a.</span>
                {' '}({formatCurrency(Number(quote.monthlySubscription) || 0)}/month). Includes {quote.reviewMeetings || 0} review meeting{(quote.reviewMeetings || 0) !== 1 ? 's' : ''} per year.
              </div>
              <p className="text-xs text-mid mt-2">
                For detailed profitability analysis of subscription arrangements,{' '}
                <button
                  onClick={() => onNavigate('feeanalysis')}
                  className="text-teal underline hover:no-underline font-medium"
                >
                  use FeeAnalysis
                </button>
                {' '}with your actual time-tracking data to understand your true cost to serve.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Smart callouts */}
      {callouts.length > 0 && (
        <div className="space-y-3">
          {callouts.map((msg, i) => (
            <div key={i} className="bg-teal-50 border border-teal-200 rounded-xl px-5 py-4">
              <div className="flex gap-3">
                <span className="flex-shrink-0 mt-0.5">💡</span>
                <p className="text-sm text-teal-800">{msg}</p>
              </div>
            </div>
          ))}
        </div>
      )}
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
