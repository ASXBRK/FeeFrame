import { useState } from 'react';
import { createPortal } from 'react-dom';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency, formatHours } from '../../lib/formatters';
import NumInput from '../../components/shared/NumInput';
import ConfirmModal from '../../components/shared/ConfirmModal';
import BenchmarkSection from '../../components/benchmarks/BenchmarkSection';

const TABS = ['Summary', 'Detailed Breakdown', 'Profitability', 'Client Output'];

export default function Step5Summary({ quote, dispatch, onReset, onNavigate }) {
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

      {/* Profit Margin */}
      <div className="bg-white rounded-card border border-light-border px-5 py-3.5 mb-4 print:hidden">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-dark whitespace-nowrap">Profit Margin</label>
            <div className="flex items-center gap-1">
              <NumInput
                value={quote.profitMarginPercent ?? 20}
                onChange={v => dispatch({ type: 'SET_QUOTE_FIELD', field: 'profitMarginPercent', value: Math.min(100, Math.max(0, v)) })}
                integer
                emptyDefault={0}
                min={0}
                max={100}
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
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800 mt-3">
          Your firm's target profit margin — the percentage of the fee that represents profit on direct costs. The average Australian advice practice operates at 21% (Adviser Ratings 2024). Top-performing practices achieve 47% (Iress Advisely Index 2024). If practice overheads are entered, your true margin after overheads will be shown separately in the profitability tab.
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

      <div className={tab !== 0 ? 'hidden' : ''}>
        {tab === 0 && <Tab1Summary calc={calc} quote={quote} dispatch={dispatch} />}
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

    </div>
  );
}

// ── Tab 1: Summary ─────────────────────────────────────────────────────────────
function Tab1Summary({ calc, quote, dispatch }) {
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
          {calc.implGross > 0 && (
            <div className="flex justify-between">
              <span className="text-mid">Implementation Fees (incl GST)</span>
              <span className="text-dark">{formatCurrency(calc.implGross)}</span>
            </div>
          )}
          {calc.commissionOffset > 0 && (
            <div className="flex justify-between">
              <span className="text-mid">Less: Insurance commission offset</span>
              <span className="text-risk-text font-medium">-{formatCurrency(calc.commissionOffset)}</span>
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
            {calc.implGross > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-mid">Implementation Fees (incl GST)</span>
                <span className="flex items-center gap-2">
                  {calc.implDiscountPercent > 0 && (
                    <span className="text-gray-400 line-through">{formatCurrency(calc.implGross)}</span>
                  )}
                  <span className="font-semibold text-gray-900">
                    {calc.implDiscountPercent === 100 ? 'Waived' : formatCurrency(calc.implIncentivisedFee)}
                  </span>
                  {calc.implDiscountPercent > 0 && (
                    <span className="text-green-600 text-xs">-{calc.implDiscountPercent}%</span>
                  )}
                </span>
              </div>
            )}
            {calc.commissionOffset > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-mid">Less: Insurance commission offset</span>
                <span className="font-semibold text-risk-text">-{formatCurrency(calc.commissionOffset)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t-2 border-light-border pt-3 mt-2">
              <span className="text-base font-bold text-dark">Total Initial Fees</span>
              <span className="flex items-center gap-3">
                <span className="text-base font-bold text-teal">{formatCurrency(calc.totalInitialFees)}</span>
                {calc.totalIncentiveSaving > 0 && (
                  <span className="text-green-600 text-sm font-medium">saving {formatCurrency(calc.totalIncentiveSaving)}</span>
                )}
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
            {calc.ongoingCommissionOffset > 0 ? (
              <>
                <div className="flex justify-between">
                  <span className="text-mid">Annual Service Fee (excl GST)</span>
                  <span className="text-dark">{formatCurrency(calc.ongoingRoundedBeforeCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid">Less: Ongoing insurance commission</span>
                  <span className="text-risk-text font-medium">-{formatCurrency(calc.ongoingCommissionOffset)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-light-border pt-2 mt-2">
                  <span className="text-dark">Adjusted Annual Fee (excl GST)</span>
                  <span className="text-dark">{formatCurrency(calc.totalOngoingRounded)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-mid">Annual Service Fee (excl GST)</span>
                <span className="text-dark">{formatCurrency(calc.totalOngoingRounded)}</span>
              </div>
            )}
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

      {/* Discount summary card */}
      {calc.hasAnyDiscount && (
        <DiscountSummaryCard calc={calc} quote={quote} />
      )}

      <BillingPlanSection calc={calc} quote={quote} dispatch={dispatch} />

      {/* Benchmark spectrum chart */}
      {calc.hasOngoing && (
        <BenchmarkSection
          fee={calc.totalOngoingInclGst}
          feeStructure={
            quote.ongoingModel === 'percentageBased' ? 'percentage'
            : quote.ongoingModel === 'subscription' ? 'subscription'
            : 'fixed'
          }
          feePercent={quote.ongoingModel === 'percentageBased' ? calc.effectiveFumRate * 100 : undefined}
          clientFUA={Number(quote.fum) || 0}
          hoursPerYear={calc.totalOngoingHours}
        />
      )}
    </div>
  );
}

// ── Discount Summary Card ──────────────────────────────────────────────────────
function DiscountSummaryCard({ calc, quote }) {
  // Split engagement vs relationship discount proportionally from the combined soaDiscount dollar figure
  const totalEngRelRate = (calc.discountRate || 0) + (calc.relationshipDiscountRate || 0);
  const engFrac = totalEngRelRate > 0 ? calc.discountRate / totalEngRelRate : 0;
  const relFrac = totalEngRelRate > 0 ? calc.relationshipDiscountRate / totalEngRelRate : 0;
  const engSOA = calc.soaDiscount * engFrac;
  const relSOA = calc.soaDiscount * relFrac;

  const relPct = Number(quote.relationshipDiscountPercent) || 10;
  const baseInitial = calc.soaTotalInclGst + calc.implGross;
  const pctOfBase = baseInitial > 0 ? calc.totalInitialDiscounts / baseInitial : 0;
  const baseOngoing = (calc.ongoingRoundedBeforeCommission || 0) + (calc.totalOngoingDiscounts || 0);
  const pctOngoing = baseOngoing > 0 ? calc.totalOngoingDiscounts / baseOngoing : 0;

  return (
    <div className="bg-white rounded-card border border-light-border p-5">
      <h3 className="text-xs font-semibold font-heading text-mid uppercase tracking-wide mb-4">Discounts Applied</h3>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-light-border">
          {calc.discountCount > 0 && (
            <tr>
              <td className="py-2 text-mid">Engagement factors ({calc.discountCount} factor{calc.discountCount !== 1 ? 's' : ''})</td>
              <td className="py-2 text-right font-medium text-green-600">-{formatCurrency(engSOA)}</td>
            </tr>
          )}
          {quote.relationshipDiscountEnabled && relPct > 0 && (
            <tr>
              <td className="py-2 text-mid">Relationship discount ({relPct}%)</td>
              <td className="py-2 text-right font-medium text-green-600">-{formatCurrency(relSOA)}</td>
            </tr>
          )}
          {calc.soaDiscountPercent > 0 && (
            <tr>
              <td className="py-2 text-mid">SOA incentive ({calc.soaDiscountPercent}%)</td>
              <td className="py-2 text-right font-medium text-green-600">-{formatCurrency(calc.soaDiscountAmount)}</td>
            </tr>
          )}
          {calc.implDiscountPercent > 0 && (
            <tr>
              <td className="py-2 text-mid">Implementation incentive ({calc.implDiscountPercent}%)</td>
              <td className="py-2 text-right font-medium text-green-600">-{formatCurrency(calc.implDiscountAmount)}</td>
            </tr>
          )}
          {calc.commissionOffset > 0 && (
            <tr>
              <td className="py-2 text-mid">Insurance commission offset</td>
              <td className="py-2 text-right font-medium text-green-600">-{formatCurrency(Math.min(calc.commissionOffset, calc.implGross + calc.soaTotalInclGst))}</td>
            </tr>
          )}
          {calc.ongoingCommissionOffset > 0 && (
            <tr>
              <td className="py-2 text-mid">Ongoing insurance commission</td>
              <td className="py-2 text-right font-medium text-green-600">-{formatCurrency(calc.ongoingCommissionOffset)} p.a.</td>
            </tr>
          )}
          <tr className="border-t-2 border-gray-300">
            <td className="py-2 font-semibold text-dark">Total discounts on initial fees</td>
            <td className="py-2 text-right font-semibold text-green-700">-{formatCurrency(calc.totalInitialDiscounts)}{pctOfBase > 0 ? ` (${Math.round(pctOfBase * 100)}%)` : ''}</td>
          </tr>
          {calc.totalOngoingDiscounts > 0 && (
            <tr>
              <td className="py-2 font-semibold text-dark">Total discounts on ongoing fees</td>
              <td className="py-2 text-right font-semibold text-green-700">-{formatCurrency(calc.totalOngoingDiscounts)} p.a.{pctOngoing > 0 ? ` (${Math.round(pctOngoing * 100)}%)` : ''}</td>
            </tr>
          )}
        </tbody>
      </table>
      {pctOfBase > 0.4 && (
        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
          <span className="flex-shrink-0 mt-0.5">⚠</span>
          <span>Total discounts represent {Math.round(pctOfBase * 100)}% of the base fee. Ensure this is commercially viable.</span>
        </div>
      )}
    </div>
  );
}

// ── Entity types ───────────────────────────────────────────────────────────────
const ENTITY_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'joint', label: 'Joint' },
  { value: 'superannuation', label: 'Superannuation' },
  { value: 'smsf', label: 'SMSF' },
  { value: 'familyTrust', label: 'Family Trust' },
  { value: 'company', label: 'Company' },
  { value: 'investmentBond', label: 'Investment Bond' },
  { value: 'other', label: 'Other' },
];

// ── Billing Plan Section ────────────────────────────────────────────────────────
function BillingPlanSection({ calc, quote, dispatch }) {
  const [entityExpanded, setEntityExpanded] = useState(false);

  const soaSplit = quote.soaSplit || '50/50';
  const soaPhase2Method = quote.soaPhase2Method || 'platform';
  const implMethod = quote.implMethod || 'platform';
  const ongoingFrequency = quote.ongoingFrequency || 'monthly';
  const ongoingMethod = quote.ongoingMethod || 'directDebit';
  const entityAllocationEnabled = !!quote.entityAllocationEnabled;
  const entityAllocationType = quote.entityAllocationType || 'percentage';
  const entityAllocations: any[] = quote.entityAllocations || [];
  const isPct = entityAllocationType === 'percentage';

  const soaFee = calc.hasIncentives ? calc.soaIncentivisedFee : calc.soaTotalInclGst;

  function set(field, value) {
    dispatch({ type: 'SET_QUOTE_FIELD', field, value });
  }

  function handleEnableEntityAllocation() {
    set('entityAllocationEnabled', true);
    if (entityAllocations.length === 0) {
      const rows: any[] = [];
      if (quote.isCouple) {
        rows.push({ type: 'joint', name: quote.clientName?.trim() || 'Primary clients', soaAllocation: 100, ongoingAllocation: 100 });
      } else {
        rows.push({ type: 'individual', name: quote.clientName?.trim() || 'Primary client', soaAllocation: 100, ongoingAllocation: 100 });
      }
      for (let i = 0; i < (Number(quote.entityCount) || 0); i++) {
        rows.push({ type: '', name: '', soaAllocation: 0, ongoingAllocation: 0 });
      }
      set('entityAllocations', rows);
    }
    setEntityExpanded(true);
  }

  function updateRow(idx: number, field: string, value: any) {
    const next = [...entityAllocations];
    next[idx] = { ...next[idx], [field]: value };
    set('entityAllocations', next);
  }

  const soaTotal = entityAllocations.reduce((s, r) => s + (Number(r.soaAllocation) || 0), 0);
  const ongoingTotal = entityAllocations.reduce((s, r) => s + (Number(r.ongoingAllocation) || 0), 0);
  const soaInvalid = isPct ? Math.abs(soaTotal - 100) > 0.01 : Math.abs(soaTotal - soaFee) > 1;
  const ongoingInvalid = calc.hasOngoing && calc.totalOngoingInclGst > 0
    && (isPct ? Math.abs(ongoingTotal - 100) > 0.01 : Math.abs(ongoingTotal - calc.totalOngoingInclGst) > 1);

  const freqDivisors: Record<string, number> = { monthly: 12, quarterly: 4, halfYearly: 2, annually: 1 };
  const freqPeriodLabels: Record<string, string> = { monthly: 'month', quarterly: 'quarter', halfYearly: 'half-year', annually: 'year' };
  const ongoingPeriodAmt = calc.totalOngoingInclGst / (freqDivisors[ongoingFrequency] || 12);

  const soaContextDesc = () => {
    if (soaSplit === '0/100') return `Full SOA fee of ${formatCurrency(soaFee)} payable on presentation of advice`;
    if (soaSplit === '100/0') return `Full SOA fee of ${formatCurrency(soaFee)} payable on engagement`;
    return `${formatCurrency(soaFee / 2)} on engagement, ${formatCurrency(soaFee / 2)} on presentation of advice`;
  };

  const inputCls = 'rounded-input border border-light-border px-2 py-1 text-sm text-dark bg-white focus:outline-none focus:ring-1 focus:ring-teal';

  return (
    <div className="bg-white rounded-card border border-light-border p-5 space-y-5">
      <h3 className="text-xs font-semibold font-heading text-mid uppercase tracking-wide">Billing Plan</h3>

      {/* SOA payment split */}
      <div>
        <label className="text-sm font-medium text-dark block mb-2">SOA payment schedule</label>
        <div className="flex gap-2">
          {(['0/100', '50/50', '100/0'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => set('soaSplit', opt)}
              className={`px-3 py-1.5 text-sm rounded-input border transition-colors ${
                soaSplit === opt
                  ? 'bg-teal text-white border-teal'
                  : 'bg-white text-mid border-light-border hover:border-teal hover:text-dark'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="text-xs text-mid mt-2">{soaContextDesc()}</p>
      </div>

      {/* Payment method rows */}
      <div className="space-y-2.5">
        {(soaSplit === '50/50' || soaSplit === '100/0') && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-mid w-36 flex-shrink-0">On engagement</span>
            <span className="text-dark">Invoice</span>
            <span className="text-xs text-mid">(engagement fees are always invoiced directly)</span>
          </div>
        )}
        {(soaSplit === '50/50' || soaSplit === '0/100') && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-mid w-36 flex-shrink-0">On presentation</span>
            <select value={soaPhase2Method} onChange={e => set('soaPhase2Method', e.target.value)} className={inputCls}>
              <option value="platform">Platform</option>
              <option value="invoice">Invoice</option>
            </select>
          </div>
        )}
        {calc.implGross > 0 && calc.implAfterCommission > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-mid w-36 flex-shrink-0">Implementation fee</span>
            <span className="text-dark font-medium">{formatCurrency(calc.implAfterCommission)}</span>
            <span className="text-mid">Method</span>
            <select value={implMethod} onChange={e => set('implMethod', e.target.value)} className={inputCls}>
              <option value="platform">Platform</option>
              <option value="invoice">Invoice</option>
            </select>
          </div>
        )}
        {calc.implGross > 0 && calc.implAfterCommission === 0 && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-mid w-36 flex-shrink-0">Implementation fee</span>
            <span className="text-dark">{calc.implDiscountPercent === 100 ? 'Waived' : 'Covered by commission'}</span>
          </div>
        )}
        {calc.hasOngoing && calc.totalOngoingInclGst > 0 && (
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <span className="text-mid w-36 flex-shrink-0">Ongoing frequency</span>
            <select value={ongoingFrequency} onChange={e => set('ongoingFrequency', e.target.value)} className={inputCls}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="halfYearly">Half-yearly</option>
              <option value="annually">Annually</option>
            </select>
            <span className="text-mid">Method</span>
            <select value={ongoingMethod} onChange={e => set('ongoingMethod', e.target.value)} className={inputCls}>
              <option value="directDebit">Direct Debit</option>
              <option value="platform">Platform</option>
              <option value="invoice">Invoice</option>
            </select>
            <span className="text-dark font-medium">{formatCurrency(ongoingPeriodAmt)} per {freqPeriodLabels[ongoingFrequency] || 'month'}</span>
          </div>
        )}
      </div>

      {/* Read-only billing plan table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-light-border">
              <th className="text-left py-2 text-xs font-medium text-mid">Phase</th>
              <th className="text-right py-2 text-xs font-medium text-mid">Amount</th>
              <th className="text-left py-2 text-xs font-medium text-mid pl-3 hidden md:table-cell">When</th>
              <th className="text-left py-2 text-xs font-medium text-mid pl-3 hidden md:table-cell">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border">
            {calc.billingPlan.map((row, i) => (
              <tr key={i}>
                <td className="py-2.5 text-dark font-medium pr-3">{row.phase}</td>
                <td className="py-2.5 text-right font-semibold text-dark">
                  {row.amount === 0 ? '—' : formatCurrency(row.amount)}
                  {row.annual && <span className="block text-xs text-mid font-normal">{formatCurrency(row.annual)} p.a.</span>}
                </td>
                <td className="py-2.5 text-mid pl-3 hidden md:table-cell">{row.when}</td>
                <td className="py-2.5 text-mid pl-3 hidden md:table-cell">{row.method || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Entity allocation — collapsible */}
      <div className="border-t border-light-border -mx-5 -mb-5">
        <button
          type="button"
          onClick={() => entityAllocationEnabled ? setEntityExpanded(e => !e) : handleEnableEntityAllocation()}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-light-surface transition-colors"
        >
          <div>
            <h3 className="text-sm font-semibold text-dark">Entity Allocation <span className="text-mid font-normal">(optional)</span></h3>
            <p className="text-xs text-mid mt-0.5">Allocate fees across entities for the client letter.</p>
          </div>
          <span className="text-mid text-xs ml-4">{entityExpanded ? '▲' : '▼'}</span>
        </button>

        {entityAllocationEnabled && entityExpanded && (
          <div className="px-5 pb-5 space-y-3">
            <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 text-xs text-teal-800">
              <span className="mt-0.5 flex-shrink-0">ⓘ</span>
              <span>Specify how fees are split across entities in the client group. If not customised, all fees will be attributed to the primary client in the client letter.</span>
            </div>

            {/* Split type toggle */}
            <div className="flex gap-2">
              {(['percentage', 'dollar'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => set('entityAllocationType', type)}
                  className={`px-3 py-1 text-xs rounded-input border transition-colors ${
                    entityAllocationType === type
                      ? 'bg-teal text-white border-teal'
                      : 'bg-white text-mid border-light-border hover:border-teal'
                  }`}
                >
                  {type === 'percentage' ? 'Split by percentage' : 'Split by dollar'}
                </button>
              ))}
            </div>

            {/* Entity table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-light-border">
                    <th className="text-left py-1.5 text-xs font-medium text-mid pr-2">Entity Type</th>
                    <th className="text-left py-1.5 text-xs font-medium text-mid pr-2">Entity Name</th>
                    <th className="text-left py-1.5 text-xs font-medium text-mid pr-2">SOA</th>
                    <th className="text-left py-1.5 text-xs font-medium text-mid pr-2">Ongoing</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {entityAllocations.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-2">
                        <select value={row.type || ''} onChange={e => updateRow(idx, 'type', e.target.value)} className={`${inputCls} w-full`}>
                          <option value="">Select type</option>
                          {ENTITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </td>
                      <td className="py-1 pr-2">
                        <input
                          type="text"
                          value={row.name || ''}
                          onChange={e => updateRow(idx, 'name', e.target.value)}
                          placeholder="Entity name"
                          className={`${inputCls} w-full`}
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <div className="flex items-center gap-1">
                          <NumInput
                            value={row.soaAllocation ?? 0}
                            onChange={v => updateRow(idx, 'soaAllocation', v)}
                            min={0}
                            className={`${inputCls} w-20`}
                          />
                          <span className="text-xs text-mid">{isPct ? '%' : '$'}</span>
                        </div>
                      </td>
                      <td className="py-1 pr-2">
                        <div className="flex items-center gap-1">
                          <NumInput
                            value={row.ongoingAllocation ?? 0}
                            onChange={v => updateRow(idx, 'ongoingAllocation', v)}
                            min={0}
                            className={`${inputCls} w-20`}
                          />
                          <span className="text-xs text-mid">{isPct ? '%' : '$'}</span>
                        </div>
                      </td>
                      <td className="py-1">
                        <button
                          onClick={() => set('entityAllocations', entityAllocations.filter((_, i) => i !== idx))}
                          disabled={entityAllocations.length <= 1}
                          className="text-xs text-mid hover:text-risk disabled:opacity-30"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-light-border">
                    <td colSpan={2} className="py-1 text-xs text-mid">Total</td>
                    <td className="py-1 text-xs font-medium">
                      <span className={soaInvalid ? 'text-warning-text' : 'text-healthy-text'}>
                        {isPct ? `${soaTotal}%` : formatCurrency(soaTotal)}
                      </span>
                      {soaInvalid && (
                        <span className="block text-warning-text text-xs">
                          {isPct ? `Should equal 100%` : `SOA fee is ${formatCurrency(soaFee)}`}
                        </span>
                      )}
                    </td>
                    <td className="py-1 text-xs font-medium">
                      {calc.hasOngoing && calc.totalOngoingInclGst > 0 ? (
                        <>
                          <span className={ongoingInvalid ? 'text-warning-text' : 'text-healthy-text'}>
                            {isPct ? `${ongoingTotal}%` : formatCurrency(ongoingTotal)}
                          </span>
                          {ongoingInvalid && (
                            <span className="block text-warning-text text-xs">
                              {isPct ? `Should equal 100%` : `Ongoing fee is ${formatCurrency(calc.totalOngoingInclGst)}`}
                            </span>
                          )}
                        </>
                      ) : <span className="text-mid">—</span>}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            <button onClick={() => set('entityAllocations', [...entityAllocations, { type: '', name: '', soaAllocation: 0, ongoingAllocation: 0 }])} className="text-xs text-teal hover:underline">
              + Add entity
            </button>

            {/* Summary table */}
            {entityAllocations.some(r => r.name || r.type) && (
              <div>
                <p className="text-xs font-medium text-mid mb-1">Fee Allocation by Entity</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-light-border">
                      <th className="text-left py-1.5 text-xs font-medium text-mid">Entity</th>
                      <th className="text-left py-1.5 text-xs font-medium text-mid">Type</th>
                      <th className="text-left py-1.5 text-xs font-medium text-mid">SOA</th>
                      {calc.hasOngoing && calc.totalOngoingInclGst > 0 && <th className="text-left py-1.5 text-xs font-medium text-mid">Ongoing</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-border">
                    {entityAllocations.filter(r => r.name || r.type).map((row, i) => {
                      const typLabel = ENTITY_TYPES.find(t => t.value === row.type)?.label || row.type || '—';
                      const soaAmt = isPct ? soaFee * ((Number(row.soaAllocation) || 0) / 100) : Number(row.soaAllocation) || 0;
                      const ongoingAmt = isPct ? calc.totalOngoingInclGst * ((Number(row.ongoingAllocation) || 0) / 100) : Number(row.ongoingAllocation) || 0;
                      return (
                        <tr key={i}>
                          <td className="py-1.5 text-dark">{row.name || '—'}</td>
                          <td className="py-1.5 text-mid">{typLabel}</td>
                          <td className="py-1.5 text-dark">{isPct ? `${row.soaAllocation}% (${formatCurrency(soaAmt)})` : formatCurrency(soaAmt)}</td>
                          {calc.hasOngoing && calc.totalOngoingInclGst > 0 && (
                            <td className="py-1.5 text-dark">{isPct ? `${row.ongoingAllocation}% (${formatCurrency(ongoingAmt)})` : formatCurrency(ongoingAmt)}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <button
              onClick={() => { set('entityAllocationEnabled', false); set('entityAllocations', []); setEntityExpanded(false); }}
              className="text-xs text-mid hover:text-risk"
            >
              Disable entity allocation
            </button>
          </div>
        )}
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

  // Change 7: hourly rate metrics
  const soaHours = calc.totalBaseHours || 0;
  const soaEffectiveRate = soaHours > 0 ? Math.round(calc.adjustedFeeRounded / soaHours) : 0;
  const soaCostPerHour = soaHours > 0 ? Math.round(calc.soaTrueCost / soaHours) : 0;
  const soaProfitPerHour = soaHours > 0 ? Math.round((calc.adjustedFeeRounded - calc.soaTrueCost) / soaHours) : 0;
  const isFixedOngoing = calc.hasOngoing && quote.ongoingModel === 'fixedOnly';
  const ongoingHours = calc.totalOngoingHours || 0;
  const ongoingEffectiveRate = isFixedOngoing && ongoingHours > 0 ? Math.round(calc.totalOngoingRounded / ongoingHours) : 0;
  const ongoingCostPerHour = isFixedOngoing && ongoingHours > 0 ? Math.round(calc.ongoingTrueCost / ongoingHours) : 0;
  const ongoingProfitPerHour = isFixedOngoing && ongoingHours > 0 ? Math.round((calc.totalOngoingRounded - calc.ongoingTrueCost) / ongoingHours) : 0;

  return (
    <div className="space-y-5">
      {/* Change 7: Hourly rate metric boxes */}
      {soaHours > 0 && (
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-sm font-bold font-heading text-dark mb-3 uppercase tracking-wide text-xs text-mid">SOA — Hourly Rate Analysis</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-light-surface rounded-input px-3 py-3 text-center">
              <div className="text-xl font-bold text-dark">${soaEffectiveRate.toLocaleString()}</div>
              <div className="text-xs font-medium text-mid mt-0.5">Effective rate</div>
              <div className="text-xs text-gray-400 mt-1">Industry: $200–$550/hr</div>
            </div>
            <div className="bg-light-surface rounded-input px-3 py-3 text-center">
              <div className="text-xl font-bold text-dark">${soaCostPerHour.toLocaleString()}</div>
              <div className="text-xs font-medium text-mid mt-0.5">Cost per hour</div>
              <div className="text-xs text-gray-400 mt-1">What it costs to deliver</div>
            </div>
            <div className={`rounded-input px-3 py-3 text-center ${soaProfitPerHour >= 0 ? 'bg-light-surface' : 'bg-red-50'}`}>
              <div className={`text-xl font-bold ${soaProfitPerHour >= 0 ? 'text-dark' : 'text-red-600'}`}>${soaProfitPerHour.toLocaleString()}</div>
              <div className="text-xs font-medium text-mid mt-0.5">Profit per hour</div>
              <div className="text-xs text-gray-400 mt-1">{soaHours} total hours</div>
            </div>
          </div>
        </div>
      )}
      {isFixedOngoing && ongoingHours > 0 && (
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-xs font-bold font-heading uppercase tracking-wide text-mid mb-3">Ongoing Service — Hourly Rate Analysis</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-light-surface rounded-input px-3 py-3 text-center">
              <div className="text-xl font-bold text-dark">${ongoingEffectiveRate.toLocaleString()}</div>
              <div className="text-xs font-medium text-mid mt-0.5">Effective rate</div>
              <div className="text-xs text-gray-400 mt-1">p.a.</div>
            </div>
            <div className="bg-light-surface rounded-input px-3 py-3 text-center">
              <div className="text-xl font-bold text-dark">${ongoingCostPerHour.toLocaleString()}</div>
              <div className="text-xs font-medium text-mid mt-0.5">Cost per hour</div>
              <div className="text-xs text-gray-400 mt-1">What it costs to deliver</div>
            </div>
            <div className={`rounded-input px-3 py-3 text-center ${ongoingProfitPerHour >= 0 ? 'bg-light-surface' : 'bg-red-50'}`}>
              <div className={`text-xl font-bold ${ongoingProfitPerHour >= 0 ? 'text-dark' : 'text-red-600'}`}>${ongoingProfitPerHour.toLocaleString()}</div>
              <div className="text-xs font-medium text-mid mt-0.5">Profit per hour</div>
              <div className="text-xs text-gray-400 mt-1">{ongoingHours} hours p.a.</div>
            </div>
          </div>
        </div>
      )}

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
              {calc.overheadPerClient > 0 && (
                <tr>
                  <td className="py-2 text-mid" colSpan={5}>Practice overhead allocation ({formatCurrency(calc.annualOverhead)} ÷ {calc.clientBookSize} clients)</td>
                  <td className="py-2 text-right font-medium text-mid">{formatCurrency(calc.overheadPerClient)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-light-border">
                <td className="py-2 font-semibold text-dark" colSpan={5}>Subtotal: Base Fee</td>
                <td className="py-2 text-right font-bold text-dark">{formatCurrency(calc.baseFee)}</td>
              </tr>
              {calc.soaPremium > 0 && (
                <tr>
                  <td className="py-2 text-warning-text" colSpan={5}>
                    Premiums ({calc.premiumCount} factor{calc.premiumCount !== 1 ? 's' : ''})
                  </td>
                  <td className="py-2 text-right font-medium text-warning-text">+{formatCurrency(calc.soaPremium)}</td>
                </tr>
              )}
              {calc.soaDiscount > 0 && (
                <tr>
                  <td className="py-2 text-healthy-text" colSpan={5}>
                    Discounts ({calc.discountCount} factor{calc.discountCount !== 1 ? 's' : ''})
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
              {calc.soaDiscountPercent > 0 && (
                <>
                  <tr>
                    <td className="py-2 text-healthy-text" colSpan={5}>Client incentive: SOA discount ({calc.soaDiscountPercent}%)</td>
                    <td className="py-2 text-right font-medium text-healthy-text">-{formatCurrency(calc.soaDiscountAmount)}</td>
                  </tr>
                  <tr className="border-t border-light-border">
                    <td className="py-2 font-bold text-dark" colSpan={5}>Client pays (incl GST)</td>
                    <td className="py-2 text-right font-bold text-teal">
                      {calc.soaDiscountPercent === 100 ? 'Waived' : formatCurrency(calc.soaIncentivisedFee)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Implementation breakdown */}
      {calc.implGross > 0 && (
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
              {calc.implDiscountPercent > 0 && (
                <tr>
                  <td className="py-2 text-mid">Less: Implementation discount ({calc.implDiscountPercent}%)</td>
                  <td className="py-2 text-right font-medium text-healthy-text">-{formatCurrency(calc.implDiscountAmount)}</td>
                </tr>
              )}
              {calc.commissionAppliedToImpl > 0 && (
                <tr>
                  <td className="py-2 text-mid">Less: Commission applied to implementation</td>
                  <td className="py-2 text-right font-medium text-risk-text">-{formatCurrency(calc.commissionAppliedToImpl)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-light-border">
                <td className="py-2 font-bold text-dark">Implementation net (client pays)</td>
                <td className="py-2 text-right font-bold text-teal">{formatCurrency(calc.implAfterCommission)}</td>
              </tr>
              {calc.commissionOverflow > 0 && (
                <>
                  <tr className="border-t border-light-border">
                    <td className="py-2 text-mid">Commission overflow to SOA</td>
                    <td className="py-2 text-right font-medium text-risk-text">-{formatCurrency(calc.commissionOverflow)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-mid">SOA fee after commission overflow</td>
                    <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.soaAfterCommission)}</td>
                  </tr>
                </>
              )}
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
                {quote.ongoingModel === 'percentageBased' && (() => {
                  const totalHrs = calc.totalOngoingHours;
                  const deliveryCost = calc.ongoingTrueCost;
                  const feeExGst = calc.variableFee;
                  const surplus = feeExGst - deliveryCost;
                  const impliedRate = totalHrs > 0 ? feeExGst / totalHrs : 0;
                  const costPerHr = totalHrs > 0 ? deliveryCost / totalHrs : 0;
                  const surplusPct = feeExGst > 0 ? Math.round((surplus / feeExGst) * 100) : 0;
                  return (
                    <>
                      <tr className="border-t-2 border-light-border bg-light-surface">
                        <td className="py-2 px-0 font-semibold text-dark" colSpan={4}>Total service delivery hours</td>
                        <td className="py-2 text-right font-bold text-dark">{formatHours(totalHrs)}</td>
                        <td className="py-2 text-right text-mid text-xs">p.a.</td>
                      </tr>
                      <tr className="bg-light-surface">
                        <td className="py-1 text-xs text-mid" colSpan={6}>
                          Reviews: {formatHours(calc.totalReviewHours * calc.reviewMeetings)} ({calc.reviewMeetings} × {formatHours(calc.totalReviewHours)}) · Annual tasks: {formatHours(calc.annualTaskItems.reduce((s,t) => s + t.totalHours, 0))}
                        </td>
                      </tr>

                      {/* Hourly analysis */}
                      <tr className="border-t border-light-border">
                        <td className="pt-3 pb-1 text-xs font-semibold text-mid uppercase tracking-wide" colSpan={6}>Hourly Analysis</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-dark" colSpan={4}>Service delivery cost</td>
                        <td className="py-1.5 text-right font-medium text-dark">{formatCurrency(deliveryCost)}</td>
                        <td className="py-1.5 text-right text-xs text-mid">{totalHrs > 0 ? `${formatCurrency(costPerHr)}/hr` : '—'}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-dark" colSpan={4}>
                          FUM-based fee — {formatCurrency(Number(quote.fum) || 0)} FUM at {(calc.effectiveFumRate * 100).toFixed(2)}%
                          {calc.variableFeeRaw < (Number(quote.minimumAnnualFee) || 0) && (
                            <span className="ml-2 text-xs text-amber-600">(minimum applied)</span>
                          )}
                        </td>
                        <td className="py-1.5 text-right font-medium text-dark">{formatCurrency(feeExGst)}</td>
                        <td className="py-1.5 text-right text-xs text-mid">{totalHrs > 0 ? `${formatCurrency(impliedRate)}/hr` : '—'}</td>
                      </tr>
                      <tr className="border-t border-light-border">
                        <td className="py-1.5 font-semibold text-dark" colSpan={4}>Surplus / (Deficit)</td>
                        <td className={`py-1.5 text-right font-bold ${surplus >= 0 ? 'text-healthy-text' : 'text-risk-text'}`}>{surplus >= 0 ? '+' : ''}{formatCurrency(surplus)}</td>
                        <td className={`py-1.5 text-right text-xs font-medium ${surplus >= 0 ? 'text-healthy-text' : 'text-risk-text'}`}>{surplusPct}%</td>
                      </tr>
                    </>
                  );
                })()}
                {quote.ongoingModel === 'subscription' && (() => {
                  const totalHrs = calc.totalOngoingHours;
                  const deliveryCost = calc.ongoingTrueCost;
                  const feeExGst = calc.subscriptionAnnual;
                  const surplus = feeExGst - deliveryCost;
                  const impliedRate = totalHrs > 0 ? feeExGst / totalHrs : 0;
                  const costPerHr = totalHrs > 0 ? deliveryCost / totalHrs : 0;
                  const surplusPct = feeExGst > 0 ? Math.round((surplus / feeExGst) * 100) : 0;
                  const monthlyFee = Number(quote.monthlySubscription) || 0;
                  const monthlyCost = deliveryCost / 12;
                  return (
                    <>
                      <tr className="border-t-2 border-light-border bg-light-surface">
                        <td className="py-2 px-0 font-semibold text-dark" colSpan={4}>Total service delivery hours</td>
                        <td className="py-2 text-right font-bold text-dark">{formatHours(totalHrs)}</td>
                        <td className="py-2 text-right text-mid text-xs">p.a.</td>
                      </tr>
                      <tr className="bg-light-surface">
                        <td className="py-1 text-xs text-mid" colSpan={6}>
                          Reviews: {formatHours(calc.totalReviewHours * calc.reviewMeetings)} ({calc.reviewMeetings} × {formatHours(calc.totalReviewHours)}) · Annual tasks: {formatHours(calc.annualTaskItems.reduce((s,t) => s + t.totalHours, 0))}
                        </td>
                      </tr>

                      {/* Hourly analysis */}
                      <tr className="border-t border-light-border">
                        <td className="pt-3 pb-1 text-xs font-semibold text-mid uppercase tracking-wide" colSpan={6}>Hourly Analysis</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-dark" colSpan={4}>Service delivery cost</td>
                        <td className="py-1.5 text-right font-medium text-dark">{formatCurrency(deliveryCost)}</td>
                        <td className="py-1.5 text-right text-xs text-mid">{formatCurrency(monthlyCost)}/mth</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-dark" colSpan={4}>Subscription fee ({formatCurrency(monthlyFee)}/month × 12)</td>
                        <td className="py-1.5 text-right font-medium text-dark">{formatCurrency(feeExGst)}</td>
                        <td className="py-1.5 text-right text-xs text-mid">{formatCurrency(monthlyFee)}/mth</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-mid" colSpan={4}>Cost per hour</td>
                        <td className="py-1.5 text-right text-mid" colSpan={2}>{totalHrs > 0 ? `${formatCurrency(costPerHr)}/hr` : '—'}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-mid" colSpan={4}>Implied hourly rate (fee ÷ hours)</td>
                        <td className="py-1.5 text-right text-mid" colSpan={2}>{totalHrs > 0 ? `${formatCurrency(impliedRate)}/hr` : '—'}</td>
                      </tr>
                      <tr className="border-t border-light-border">
                        <td className="py-1.5 font-semibold text-dark" colSpan={4}>Surplus / (Deficit)</td>
                        <td className={`py-1.5 text-right font-bold ${surplus >= 0 ? 'text-healthy-text' : 'text-risk-text'}`}>{surplus >= 0 ? '+' : ''}{formatCurrency(surplus)}</td>
                        <td className={`py-1.5 text-right text-xs font-medium ${surplus >= 0 ? 'text-healthy-text' : 'text-risk-text'}`}>{surplusPct}%</td>
                      </tr>
                    </>
                  );
                })()}
                {calc.ongoingPremium > 0 && (
                  <tr>
                    <td className="py-2 text-warning-text" colSpan={5}>
                      Premiums ({calc.premiumCount} factor{calc.premiumCount !== 1 ? 's' : ''})
                    </td>
                    <td className="py-2 text-right font-medium text-warning-text">+{formatCurrency(calc.ongoingPremium)}</td>
                  </tr>
                )}
                {calc.ongoingDiscount > 0 && (
                  <tr>
                    <td className="py-2 text-healthy-text" colSpan={5}>
                      Discounts ({calc.discountCount} factor{calc.discountCount !== 1 ? 's' : ''})
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
                {calc.ongoingCommissionOffset > 0 && (
                  <tr>
                    <td className="py-2 text-mid" colSpan={5}>Less: Ongoing insurance commission</td>
                    <td className="py-2 text-right font-medium text-risk-text">-{formatCurrency(calc.ongoingCommissionOffset)}</td>
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

      {/* Incentives summary */}
      {calc.hasIncentives && (
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-base font-bold font-heading text-dark mb-4">After Client Incentives</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-light-border">
              {calc.soaDiscountPercent > 0 && (
                <>
                  <tr>
                    <td className="py-2 text-dark">SOA Fee (standard)</td>
                    <td className="py-2 text-right text-gray-400 line-through">{formatCurrency(calc.soaTotalInclGst)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-healthy-text">SOA discount ({calc.soaDiscountPercent}%)</td>
                    <td className="py-2 text-right text-healthy-text">-{formatCurrency(calc.soaDiscountAmount)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-dark">SOA client pays</td>
                    <td className="py-2 text-right font-semibold text-dark">
                      {calc.soaDiscountPercent === 100 ? 'Waived' : formatCurrency(calc.soaIncentivisedFee)}
                    </td>
                  </tr>
                </>
              )}
              {calc.implTotal > 0 && (
                <>
                  <tr>
                    <td className="py-2 text-dark">Implementation (standard)</td>
                    <td className={`py-2 text-right ${calc.implDiscountPercent > 0 ? 'text-gray-400 line-through' : 'text-dark'}`}>
                      {formatCurrency(calc.implGross)}
                    </td>
                  </tr>
                  {calc.implDiscountPercent > 0 && (
                    <tr>
                      <td className="py-2 text-healthy-text">Implementation discount ({calc.implDiscountPercent}%)</td>
                      <td className="py-2 text-right text-healthy-text">-{formatCurrency(calc.implDiscountAmount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 font-semibold text-dark">Implementation client pays</td>
                    <td className="py-2 text-right font-semibold text-dark">
                      {calc.implDiscountPercent === 100 ? 'Waived' : formatCurrency(calc.implIncentivisedFee)}
                    </td>
                  </tr>
                </>
              )}
              <tr className="border-t-2 border-light-border">
                <td className="py-2 text-base font-bold text-dark">Total client pays</td>
                <td className="py-2 text-right text-base font-bold text-teal">{formatCurrency(calc.totalIncentivisedInitialFees)}</td>
              </tr>
              <tr>
                <td className="py-2 text-healthy-text">Total savings from incentives</td>
                <td className="py-2 text-right font-semibold text-healthy-text">{formatCurrency(calc.totalIncentiveSaving)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Profitability ───────────────────────────────────────────────────────
function StackedBar({ segments, segmentInsights }: {
  segments: { label: string; value: number; color: string; textColor?: string }[];
  segmentInsights?: Record<string, string | null>;
}) {
  const [hovered, setHovered] = useState<{ label: string; value: number; pct: number; x: number; y: number } | null>(null);
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);
  if (total === 0) return <div className="h-6 bg-gray-100 rounded" />;
  return (
    <div className="space-y-2">
      <div className="flex h-6 rounded overflow-hidden">
        {segments.map(seg => {
          const pct = (Math.max(0, seg.value) / total) * 100;
          if (pct < 0.5) return null;
          const hasInsight = !!segmentInsights?.[seg.label];
          return (
            <div
              key={seg.label}
              className={`${seg.color} min-w-[2px] relative`}
              style={{ width: `${pct}%` }}
              onMouseEnter={e => {
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setHovered({ label: seg.label, value: seg.value, pct: Math.round(pct), x: r.left + r.width / 2, y: r.top });
              }}
              onMouseLeave={() => setHovered(null)}
            >
              {hasInsight && pct > 5 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.filter(s => s.value > 0).map(seg => (
          <div key={seg.label} className={`flex items-center gap-1.5 text-xs ${seg.textColor || 'text-mid'}`}>
            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${seg.color}`} />
            {seg.label}: {formatCurrency(seg.value)}
            {segmentInsights?.[seg.label] && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            )}
          </div>
        ))}
      </div>
      {hovered && createPortal(
        <div
          className="fixed z-[9999] w-64 rounded-input bg-dark text-white text-xs px-3 py-2.5 leading-relaxed pointer-events-none shadow-lg"
          style={{ top: hovered.y, left: hovered.x, transform: 'translate(-50%, calc(-100% - 8px))' }}
        >
          <div className="font-semibold mb-0.5">
            {hovered.label}: {formatCurrency(hovered.value)}{' '}
            <span className="text-gray-400 font-normal">({hovered.pct}%)</span>
          </div>
          {segmentInsights?.[hovered.label] && (
            <div className="text-gray-300 leading-snug mt-1">{segmentInsights[hovered.label]}</div>
          )}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-dark" />
        </div>,
        document.body,
      )}
    </div>
  );
}

function Tab3Profitability({ calc, quote }) {
  const isFixedOngoing = calc.hasOngoing && quote.ongoingModel === 'fixedOnly';
  const isPercentageOngoing = calc.hasOngoing && quote.ongoingModel === 'percentageBased';
  const isSubscriptionOngoing = calc.hasOngoing && quote.ongoingModel === 'subscription';
  const hasOngoingCostData = calc.hasOngoing;
  const [insightsOpen, setInsightsOpen] = useState(false);

  const soaDirectCost = calc.soaAdviserCost + calc.soaParaplannerCost + calc.soaAdminCost;
  const soaTotalCost = soaDirectCost + calc.soaExternalFee;

  const soaCommission = calc.commissionOffset || 0;
  const ongoingCommission = calc.ongoingCommissionOffset || 0;

  // Revenue = ex-GST client fee (after incentives + commission) + commission income
  // soaAfterCommission is incl-GST; dividing by 1.1 gives ex-GST client portion
  const soaClientFeeExGst = calc.soaAfterCommission > 0 ? calc.soaAfterCommission / 1.1 : 0;
  const soaTrueProfit = soaClientFeeExGst + soaCommission - calc.soaTrueCost;
  // ongoingTrueCost already has commission subtracted; add it back to get total practice revenue
  const ongoingTrueProfit = (calc.totalOngoingRounded + ongoingCommission) - calc.ongoingTrueCost;

  const firstYearMargin = soaTrueProfit + (hasOngoingCostData ? ongoingTrueProfit : 0);

  // Bar margin: ex-GST margin from client fees only (bars show fee structure, not commission)
  // Use incentivised fee so bar reflects what the client actually pays
  const soaBarMargin = calc.soaIncentivisedFee / 1.1 - calc.soaTrueCost;
  const ongoingBarMargin = calc.totalOngoingRounded - calc.ongoingTrueCost;

  // ── Dual margin: direct costs vs after overheads ──────────────────────────────
  const soaDirectCostFull = calc.soaAdviserCost + calc.soaParaplannerCost + calc.soaAdminCost + calc.soaExternalFee;
  const soaDirectProfit = calc.adjustedFeeRounded - soaDirectCostFull;
  const directMarginPct = calc.adjustedFeeRounded > 0
    ? Math.round((soaDirectProfit / calc.adjustedFeeRounded) * 100) : 0;
  const trueMarginPct = calc.adjustedFeeRounded > 0
    ? Math.round((soaTrueProfit / calc.adjustedFeeRounded) * 100) : 0;

  const ongoingDirectCost = calc.ongoingAdviserCost + calc.ongoingParaplannerCost + calc.ongoingAdminCost;
  const ongoingDirectProfit = calc.totalOngoingRounded - ongoingDirectCost;
  const ongoingDirectMarginPct = calc.totalOngoingRounded > 0
    ? Math.round((ongoingDirectProfit / calc.totalOngoingRounded) * 100) : 0;
  const ongoingTrueMarginPct = calc.totalOngoingRounded > 0
    ? Math.round((ongoingTrueProfit / calc.totalOngoingRounded) * 100) : 0;

  // ── Effective margin (used for both headline and insights) ────────────────────
  const effectiveMarginPct = calc.adjustedFeeRounded > 0
    ? Math.round(((calc.adjustedFeeRounded - calc.soaTrueCost) / calc.adjustedFeeRounded) * 100)
    : 0;

  // ── Segment insights for hover tooltips ───────────────────────────────────────
  const adviserPct = calc.soaTrueCost > 0 ? Math.round((calc.soaAdviserCost / calc.soaTrueCost) * 100) : 0;
  const paraCost = calc.soaParaplannerCost + calc.soaExternalFee;
  const paraPct = calc.soaTrueCost > 0 ? Math.round((paraCost / calc.soaTrueCost) * 100) : 0;
  const adminPct = calc.soaTrueCost > 0 ? Math.round((calc.soaAdminCost / calc.soaTrueCost) * 100) : 0;
  const paraLabel = calc.soaExternalFee > 0 ? 'External paraplanning' : 'Paraplanning';

  const soaSegmentInsights: Record<string, string | null> = {};
  if (adviserPct > 55) {
    soaSegmentInsights['Adviser time'] = `Adviser time represents ${adviserPct}% of your SOA cost. Consider whether some preparation or research tasks could be delegated to your paraplanner or admin staff.`;
  }
  if (paraPct > 45) {
    soaSegmentInsights[paraLabel] = `Paraplanning represents ${paraPct}% of your SOA cost. Consider whether any tasks could be delegated to admin, or streamlined with better templates and processes.`;
  } else if (calc.soaExternalFee > 0 && calc.soaExternalFee > calc.soaAdviserCost) {
    soaSegmentInsights['External paraplanning'] = `Your external paraplanner fee exceeds your adviser cost. This is common for complex engagements, but worth reviewing if the scope is straightforward.`;
  }
  if (adminPct > 30) {
    soaSegmentInsights['Admin'] = `Administration represents ${adminPct}% of your SOA cost. High admin costs may indicate manual processes that could benefit from systemisation.`;
  }
  if (calc.overheadPerClient > 2000) {
    soaSegmentInsights['Overheads'] = `Your per-client overhead allocation is ${formatCurrency(calc.overheadPerClient)}. Mandatory adviser costs typically range $38,877–$83,877 annually (Adviser Ratings 2025).`;
  }
  if (soaTrueProfit > 0) {
    if (effectiveMarginPct >= 40) {
      soaSegmentInsights['Margin from fees'] = `Your effective margin of ${effectiveMarginPct}% approaches top-10% territory. The highest-performing practices operate at 47% (Iress Advisely 2024).`;
    } else if (effectiveMarginPct >= 25) {
      soaSegmentInsights['Margin from fees'] = `Your effective margin of ${effectiveMarginPct}% is above the industry average of 21% (Adviser Ratings 2024).`;
    }
  }

  const ongoingSegmentInsights: Record<string, string | null> = {};
  if (hasOngoingCostData && calc.ongoingTrueCost > 0) {
    const oAdviserPct = Math.round((calc.ongoingAdviserCost / calc.ongoingTrueCost) * 100);
    const oParaPct = Math.round((calc.ongoingParaplannerCost / calc.ongoingTrueCost) * 100);
    const oAdminPct = Math.round((calc.ongoingAdminCost / calc.ongoingTrueCost) * 100);
    if (oAdviserPct > 55) {
      ongoingSegmentInsights['Adviser time'] = `Adviser time represents ${oAdviserPct}% of your ongoing cost. Consider whether tasks could be delegated.`;
    }
    if (oParaPct > 45) {
      ongoingSegmentInsights['Paraplanning'] = `Paraplanning represents ${oParaPct}% of your ongoing cost. Consider whether tasks could be streamlined.`;
    }
    if (oAdminPct > 30) {
      ongoingSegmentInsights['Admin'] = `Administration represents ${oAdminPct}% of your ongoing cost. High admin costs may indicate manual processes.`;
    }
    if (ongoingTrueProfit > 0) {
      const oMarginPct = Math.round((ongoingTrueProfit / calc.totalOngoingRounded) * 100);
      if (oMarginPct >= 40) {
        ongoingSegmentInsights['Margin from fees'] = `Your effective ongoing margin of ${oMarginPct}% approaches top-10% territory.`;
      } else if (oMarginPct >= 25) {
        ongoingSegmentInsights['Margin from fees'] = `Your effective ongoing margin of ${oMarginPct}% is above the industry average of 21%.`;
      }
    }
  }

  // ── Headline callout determination ────────────────────────────────────────────
  type HeadlineType = 'negativeMargin' | 'overheadLoss' | 'lowMargin' | 'zeroMargin' | 'healthy';
  let headlineType: HeadlineType = 'healthy';
  if (firstYearMargin < 0) {
    headlineType = 'negativeMargin';
  } else if (calc.overheadPerClient > 0 && soaTrueProfit < calc.overheadPerClient) {
    headlineType = 'overheadLoss';
  } else if (effectiveMarginPct > 0 && effectiveMarginPct < 15) {
    headlineType = 'lowMargin';
  } else if (calc.soaMarginPercent === 0) {
    headlineType = 'zeroMargin';
  }

  // ── Insights array (expandable list) ─────────────────────────────────────────
  type InsightSeverity = 'red' | 'amber' | 'green';
  type Insight = { message: string; severity: InsightSeverity };
  const insights: Insight[] = [];

  // Red
  if (headlineType !== 'negativeMargin' && firstYearMargin < 0) {
    insights.push({ severity: 'red', message: `This engagement shows a negative first-year margin of ${formatCurrency(firstYearMargin)}.` });
  }
  if (headlineType !== 'overheadLoss' && calc.overheadPerClient > 0 && soaTrueProfit < calc.overheadPerClient) {
    insights.push({ severity: 'red', message: `After practice overheads of ${formatCurrency(calc.overheadPerClient)}/client, your margin of ${formatCurrency(soaTrueProfit)} does not cover the overhead allocation.` });
  }

  // Amber
  if (headlineType !== 'lowMargin' && effectiveMarginPct > 0 && effectiveMarginPct < 17) {
    insights.push({ severity: 'amber', message: `Your effective profit margin is ${effectiveMarginPct}% after all costs. The industry average is 21% (Adviser Ratings 2024). Consider whether this is sustainable.` });
  }
  if (headlineType !== 'zeroMargin' && calc.soaMarginPercent === 0) {
    insights.push({ severity: 'amber', message: `No profit margin applied. Your quoted fees reflect cost only. Use the margin input above to add your target profitability.` });
  }
  if (calc.strategyItems.length > 0 && (Number(quote.scenarios) || 0) === 0) {
    insights.push({ severity: 'amber', message: `No scenario modelling has been included. Most comprehensive SOAs benefit from at least one scenario comparison.` });
  }
  if (calc.overheadPerClient > 2000) {
    insights.push({ severity: 'amber', message: `Your overhead allocation of ${formatCurrency(calc.overheadPerClient)}/client is high. You may want to revisit your overhead inputs in Step 2.` });
  } else if (calc.overheadPerClient > 0 && calc.overheadPerClient < 200) {
    insights.push({ severity: 'amber', message: `Your overhead allocation of ${formatCurrency(calc.overheadPerClient)}/client is low. Most practices allocate $400–$1,200 once rent, software, PI insurance, and licensing are factored in.` });
  }
  if (calc.adjustedFeeRounded > 0 && calc.adjustedFeeRounded < 2000) {
    insights.push({ severity: 'amber', message: `This engagement quotes below $2,000 (excl GST). The average initial advice fee is $2,500–$4,400 (Investment Trends 2024). Consider whether the scope reflects the work involved.` });
  }
  if (calc.adjustedFeeRounded > 10000) {
    insights.push({ severity: 'amber', message: `This engagement quotes above $10,000 (excl GST). Only 6–7% of advisers regularly quote above this level (Adviser Ratings 2025). Ensure the client understands the scope and value.` });
  }
  if (calc.hasOngoing && calc.totalOngoingRounded > 0) {
    const medianOngoing = 4668;
    if (calc.totalOngoingRounded < medianOngoing * 0.6) {
      insights.push({ severity: 'amber', message: `Your ongoing fee of ${formatCurrency(calc.totalOngoingRounded)} (excl GST) is well below the national median of $4,668 (Adviser Ratings 2025). Consider whether the fee reflects the work involved.` });
    } else if (calc.totalOngoingRounded > medianOngoing * 1.5) {
      insights.push({ severity: 'amber', message: `Your ongoing fee of ${formatCurrency(calc.totalOngoingRounded)} (excl GST) exceeds 150% of the national median of $4,668 (Adviser Ratings 2025). Ensure the client understands the ongoing value.` });
    }
  }
  const adviserRate = Number(quote.adviserRate);
  if (adviserRate > 150) {
    insights.push({ severity: 'amber', message: `Your adviser hourly cost of $${adviserRate}/hr is above the industry average of $106/hr. Ensure this is the true employment cost, not a charge-out rate.` });
  }
  if (calc.soaExternalFee > 0 && calc.soaExternalFee > calc.soaAdviserCost) {
    insights.push({ severity: 'amber', message: `Your external paraplanner fee (${formatCurrency(calc.soaExternalFee)}) exceeds your adviser cost (${formatCurrency(calc.soaAdviserCost)}). Worth reviewing if the scope is straightforward.` });
  }
  if (calc.reviewMeetings > 4) {
    insights.push({ severity: 'amber', message: `You've included ${calc.reviewMeetings} review meetings per year. The industry average is 2 meetings annually (Adviser Ratings 2025). Ensure this frequency is valued by the client.` });
  }

  // Percentage model insights
  if (isPercentageOngoing && calc.hasOngoing && calc.ongoingTrueCost > 0) {
    const fumFee = calc.totalOngoingRounded;
    const deliveryCost = calc.ongoingTrueCost;
    if (fumFee < deliveryCost) {
      insights.push({ severity: 'red', message: `Your FUM-based fee of ${formatCurrency(fumFee)} p.a. is below your estimated service delivery cost of ${formatCurrency(deliveryCost)} p.a. This arrangement runs at a loss.` });
    } else if (fumFee < deliveryCost * 1.1) {
      insights.push({ severity: 'amber', message: `Your FUM-based fee of ${formatCurrency(fumFee)} p.a. barely covers your estimated delivery cost of ${formatCurrency(deliveryCost)} p.a. Consider whether your fee tiers are set appropriately.` });
    } else {
      const surplusPct = Math.round(((fumFee - deliveryCost) / fumFee) * 100);
      if (surplusPct >= 40) {
        insights.push({ severity: 'green', message: `Your FUM-based fee generates a ${surplusPct}% margin above your estimated service delivery cost. This is a strong ongoing margin.` });
      }
    }
    if (calc.variableFeeRaw < (Number(quote.minimumAnnualFee) || 0)) {
      insights.push({ severity: 'amber', message: `The minimum fee of ${formatCurrency(Number(quote.minimumAnnualFee) || 0)} is being applied — the FUM-calculated fee of ${formatCurrency(calc.variableFeeRaw)} would otherwise be lower.` });
    }
    if (calc.effectiveFumRate > 0 && (calc.effectiveFumRate * 100) > 1.5) {
      insights.push({ severity: 'amber', message: `Your effective rate of ${(calc.effectiveFumRate * 100).toFixed(2)}% is above the common industry ceiling of 1.5%. Ensure the client is aware of the total annual cost relative to their portfolio.` });
    }
  }

  // Subscription model insights
  if (isSubscriptionOngoing && calc.hasOngoing && calc.ongoingTrueCost > 0) {
    const subFee = calc.totalOngoingRounded;
    const deliveryCost = calc.ongoingTrueCost;
    const monthlyCost = deliveryCost / 12;
    const monthlyFee = Number(quote.monthlySubscription) || 0;
    if (subFee < deliveryCost) {
      insights.push({ severity: 'red', message: `Your subscription of ${formatCurrency(monthlyFee)}/month generates ${formatCurrency(subFee)} p.a., which is below your estimated service delivery cost of ${formatCurrency(deliveryCost)} p.a.` });
    } else if (subFee >= deliveryCost) {
      const surplusPct = Math.round(((subFee - deliveryCost) / subFee) * 100);
      if (surplusPct >= 40) {
        insights.push({ severity: 'green', message: `Your subscription generates a ${surplusPct}% margin above estimated delivery cost. Monthly delivery cost is ${formatCurrency(monthlyCost)}/month against ${formatCurrency(monthlyFee)}/month charged.` });
      }
    }
    if (calc.reviewMeetings >= 4 && monthlyFee > 0) {
      insights.push({ severity: 'amber', message: `${calc.reviewMeetings} review meetings are included in your subscription. Each review costs approximately ${formatCurrency(calc.costPerReview)} — ensure the subscription fee accounts for this.` });
    }
  }

  // Green
  if (calc.adjustedFeeRounded >= 2500 && calc.adjustedFeeRounded <= 4400) {
    insights.push({ severity: 'green', message: `Your SOA fee of ${formatCurrency(calc.adjustedFeeRounded)} (excl GST) falls within the industry average range of $2,500–$4,400 for initial advice (Investment Trends 2024).` });
  }
  if (calc.hasOngoing && calc.totalOngoingRounded > 0) {
    const medianOngoing = 4668;
    if (calc.totalOngoingRounded >= medianOngoing * 0.8 && calc.totalOngoingRounded <= medianOngoing * 1.2) {
      insights.push({ severity: 'green', message: `Your ongoing fee of ${formatCurrency(calc.totalOngoingRounded)} (excl GST) is in line with the national median of $4,668 (Adviser Ratings 2025).` });
    }
  }
  if (effectiveMarginPct >= 40) {
    insights.push({ severity: 'green', message: `Your effective SOA margin of ${effectiveMarginPct}% is approaching top-10% territory. The highest-performing practices operate at 47% (Iress Advisely Index 2024).` });
  } else if (effectiveMarginPct >= 25) {
    insights.push({ severity: 'green', message: `Your effective SOA margin of ${effectiveMarginPct}% is above the industry average of 21% (Adviser Ratings 2024). This is a healthy position.` });
  }
  if (calc.overheadPerClient > 0 && soaTrueProfit > calc.overheadPerClient * 1.5) {
    insights.push({ severity: 'green', message: `Your margin covers the practice overhead allocation with room to spare (${formatCurrency(soaTrueProfit)} margin vs ${formatCurrency(calc.overheadPerClient)} overhead/client).` });
  }

  // Sort: red → amber → green
  insights.sort((a, b) => ({ red: 0, amber: 1, green: 2 }[a.severity] - ({ red: 0, amber: 1, green: 2 }[b.severity])));
  const redCount = insights.filter(i => i.severity === 'red').length;
  const amberCount = insights.filter(i => i.severity === 'amber').length;
  const greenCount = insights.filter(i => i.severity === 'green').length;

  return (
    <div className="space-y-5">
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
              {calc.implDiscountPercent > 0 && calc.implGross > 0 && (
                <div>Implementation discount ({calc.implDiscountPercent}%): -{formatCurrency(calc.implDiscountAmount)}</div>
              )}
              <div className="font-medium pt-1">
                Total discount saving: {formatCurrency(calc.totalIncentiveSaving)}
              </div>
              <div>First-year margin (after incentives{soaCommission > 0 ? ' + commission' : ''}): <span className="font-semibold">{formatCurrency(firstYearMargin)}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Commission income callout */}
      {(soaCommission > 0 || ongoingCommission > 0) && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-5 py-4">
          <div className="flex gap-3">
            <span className="flex-shrink-0 mt-0.5">💡</span>
            <div className="text-sm text-teal-800 space-y-1">
              {soaCommission > 0 && calc.totalInitialFees === 0 ? (
                <div><span className="font-semibold">Insurance commissions of {formatCurrency(soaCommission)} fully offset initial client fees.</span> The client pays {formatCurrency(0)} upfront, but this engagement generates {formatCurrency(soaCommission)} in commission revenue against {formatCurrency(calc.soaTrueCost)} in costs — a margin of {formatCurrency(soaTrueProfit)}.</div>
              ) : soaCommission > 0 ? (
                <div>Initial insurance commission of {formatCurrency(soaCommission)} adds to practice revenue. Total initial margin including commission: {formatCurrency(soaTrueProfit)}.</div>
              ) : null}
              {ongoingCommission > 0 && (
                <div>Ongoing insurance commission of {formatCurrency(ongoingCommission)} p.a. adds to ongoing practice revenue. Annual ongoing margin including commission: {formatCurrency(ongoingTrueProfit)}.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Card 1: SOA cost → fee */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SOA Cost → Revenue</div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-gray-500">{formatCurrency(calc.soaTrueCost)}</span>
            <span className="text-gray-300">→</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(calc.soaAfterCommission)}</span>
            <span className="text-xs text-gray-400">incl GST</span>
          </div>
          {soaCommission > 0 && (
            <div className="text-xs text-indigo-600 mt-1">+ {formatCurrency(soaCommission)} commission income</div>
          )}
          <div className="text-sm text-gray-500 mt-1.5">
            {calc.overheadPerClient > 0 ? 'Margin on direct costs:' : 'Margin:'}{' '}
            <span className={soaDirectProfit > 0 ? 'font-semibold text-green-600' : soaDirectProfit < 0 ? 'font-semibold text-red-600' : 'text-gray-400'}>
              {formatCurrency(soaDirectProfit)} ({directMarginPct}%)
            </span>
          </div>
          {calc.overheadPerClient > 0 && (
            <div className="text-sm text-gray-500 mt-0.5">
              After overheads:{' '}
              <span className={soaTrueProfit > 0 ? 'font-semibold text-green-600' : soaTrueProfit < 0 ? 'font-semibold text-red-600' : 'text-gray-400'}>
                {formatCurrency(soaTrueProfit)} ({trueMarginPct}%)
              </span>
            </div>
          )}
        </div>

        {/* Card 2: Ongoing cost → fee */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ongoing Cost → Revenue</div>
          {!calc.hasOngoing ? (
            <div className="text-sm text-gray-400">No ongoing fee</div>
          ) : hasOngoingCostData ? (
            <>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-gray-500">{formatCurrency(calc.ongoingTrueCost)}</span>
                <span className="text-gray-300">→</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(calc.totalOngoingInclGst)}</span>
                <span className="text-xs text-gray-400">incl GST</span>
                <span className="text-sm text-gray-400">/yr</span>
              </div>
              {ongoingCommission > 0 && (
                <div className="text-xs text-indigo-600 mt-1">+ {formatCurrency(ongoingCommission)} commission income</div>
              )}
              <div className="text-sm text-gray-500 mt-1.5">
                {calc.overheadPerClient > 0 ? 'Margin on direct costs:' : 'Margin:'}{' '}
                <span className={ongoingDirectProfit > 0 ? 'font-semibold text-green-600' : ongoingDirectProfit < 0 ? 'font-semibold text-red-600' : 'text-gray-400'}>
                  {formatCurrency(ongoingDirectProfit)} ({ongoingDirectMarginPct}%)
                </span>
              </div>
              {calc.overheadPerClient > 0 && (
                <div className="text-sm text-gray-500 mt-0.5">
                  After overheads:{' '}
                  <span className={ongoingTrueProfit > 0 ? 'font-semibold text-green-600' : ongoingTrueProfit < 0 ? 'font-semibold text-red-600' : 'text-gray-400'}>
                    {formatCurrency(ongoingTrueProfit)} ({ongoingTrueMarginPct}%)
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-gray-400">—</span>
                <span className="text-gray-300">→</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(calc.totalOngoingInclGst)}</span>
                <span className="text-xs text-gray-400">incl GST</span>
                <span className="text-sm text-gray-400">/yr</span>
              </div>
              <div className="text-sm text-gray-400 mt-1.5">N/A — no cost data</div>
            </>
          )}
        </div>

        {/* Card 3: Total first year profit */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total First Year</div>
          <div className={`text-2xl font-bold ${firstYearMargin > 0 ? 'text-green-600' : firstYearMargin < 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {formatCurrency(firstYearMargin)}
          </div>
          <div className="text-sm text-gray-400 mt-1">Combined first year margin (ex GST{soaCommission + ongoingCommission > 0 ? ', incl commission' : ''})</div>
        </div>
      </div>

      {/* SOA cost breakdown */}
      <div className="bg-white rounded-card border border-light-border p-5 space-y-5">
        <h3 className="text-base font-bold font-heading text-dark">Cost Breakdown</h3>

        <div>
          <div className="text-sm font-medium text-dark mb-2">Initial SOA</div>
          <StackedBar
            segments={[
              { label: 'Adviser time', value: calc.soaAdviserCost, color: 'bg-slate-700', textColor: 'text-slate-700' },
              { label: calc.soaExternalFee > 0 ? 'External paraplanning' : 'Paraplanning', value: calc.soaParaplannerCost + calc.soaExternalFee, color: 'bg-violet-600', textColor: 'text-violet-600' },
              { label: 'Admin', value: calc.soaAdminCost, color: 'bg-amber-600', textColor: 'text-amber-600' },
              ...(calc.overheadPerClient > 0 ? [{ label: 'Overheads', value: calc.overheadPerClient, color: 'bg-gray-400', textColor: 'text-gray-500' }] : []),
              ...(calc.referralFee > 0 ? [{ label: 'Referral fee', value: calc.referralFee, color: 'bg-rose-400', textColor: 'text-rose-500' }] : []),
              ...(soaBarMargin > 0 ? [{ label: 'Margin from fees', value: soaBarMargin, color: 'bg-emerald-500', textColor: 'text-emerald-600' }] : []),
              { label: 'GST', value: calc.soaIncentivisedFee - calc.soaIncentivisedFee / 1.1, color: 'bg-slate-200', textColor: 'text-slate-400' },
            ]}
            segmentInsights={soaSegmentInsights}
          />
          {soaBarMargin < 0 && (
            <p className="text-sm text-red-600 font-medium mt-1">Loss: {formatCurrency(soaBarMargin)}</p>
          )}
        </div>

        {/* Ongoing cost breakdown — all models */}
        {calc.hasOngoing && calc.totalOngoingHours > 0 && (
          <div>
            <div className="text-sm font-medium text-dark mb-2">Ongoing (annual)</div>
            <StackedBar
              segments={[
                { label: 'Adviser time', value: calc.ongoingAdviserCost, color: 'bg-slate-700', textColor: 'text-slate-700' },
                { label: 'Paraplanning', value: calc.ongoingParaplannerCost, color: 'bg-violet-600', textColor: 'text-violet-600' },
                { label: 'Admin', value: calc.ongoingAdminCost, color: 'bg-amber-600', textColor: 'text-amber-600' },
                ...(calc.overheadPerClient > 0 ? [{ label: 'Overheads', value: calc.overheadPerClient, color: 'bg-gray-400', textColor: 'text-gray-500' }] : []),
                ...(ongoingBarMargin > 0 ? [{ label: 'Margin from fees', value: ongoingBarMargin, color: 'bg-emerald-500', textColor: 'text-emerald-600' }] : []),
                { label: 'GST', value: calc.totalOngoingInclGst - calc.totalOngoingRounded, color: 'bg-slate-200', textColor: 'text-slate-400' },
              ]}
              segmentInsights={ongoingSegmentInsights}
            />
            {ongoingBarMargin < 0 && (
              <p className="text-sm text-red-600 font-medium mt-1">Loss: {formatCurrency(ongoingBarMargin)}</p>
            )}
          </div>
        )}
      </div>

      {/* Headline callout — single most important insight */}
      {headlineType === 'negativeMargin' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <div className="flex gap-3">
            <span className="text-red-500 flex-shrink-0 mt-0.5 text-lg">⚠</span>
            <p className="text-sm text-red-800 font-medium">This engagement shows a negative first-year margin of {formatCurrency(firstYearMargin)}. Review your pricing, scope, or margin to ensure this is a deliberate commercial decision.</p>
          </div>
        </div>
      )}
      {headlineType === 'overheadLoss' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <div className="flex gap-3">
            <span className="text-red-500 flex-shrink-0 mt-0.5 text-lg">⚠</span>
            <p className="text-sm text-red-800 font-medium">After practice overheads of {formatCurrency(calc.overheadPerClient)}/client, this engagement operates at a loss. Your margin of {formatCurrency(soaTrueProfit)} does not cover the {formatCurrency(calc.overheadPerClient)} overhead allocation.</p>
          </div>
        </div>
      )}
      {headlineType === 'lowMargin' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex gap-3">
            <span className="text-amber-500 flex-shrink-0 mt-0.5 text-lg">⚠</span>
            <p className="text-sm text-amber-800 font-medium">Your effective profit margin is {effectiveMarginPct}% after all costs. The industry average is 21% (Adviser Ratings 2024). Consider whether this is sustainable.</p>
          </div>
        </div>
      )}
      {headlineType === 'zeroMargin' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex gap-3">
            <span className="text-amber-500 flex-shrink-0 mt-0.5 text-lg">⚠</span>
            <p className="text-sm text-amber-800 font-medium">No profit margin applied. Your quoted fees reflect cost only. Use the margin input above to add your target profitability.</p>
          </div>
        </div>
      )}
      {headlineType === 'healthy' && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-5 py-4">
          <div className="flex gap-3">
            <span className="text-teal-600 flex-shrink-0 mt-0.5 text-lg">✓</span>
            <p className="text-sm text-teal-800 font-medium">This engagement is well-priced. Your margin covers overhead and generates {formatCurrency(firstYearMargin > 0 ? firstYearMargin : soaTrueProfit)} in first-year profit.</p>
          </div>
        </div>
      )}

      {/* Expandable insights list */}
      {insights.length > 0 && (
        <div>
          <button
            onClick={() => setInsightsOpen(o => !o)}
            className="flex items-center gap-2 text-sm text-mid hover:text-dark transition-colors py-2"
          >
            <span className="text-xs">{insightsOpen ? '▲' : '▼'}</span>
            <span>{insights.length} insight{insights.length !== 1 ? 's' : ''}</span>
            <span className="flex gap-1 ml-1 items-center">
              {redCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500" />}
              {amberCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400" />}
              {greenCount > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </span>
          </button>
          {insightsOpen && (
            <div className="space-y-1.5 mt-2">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm py-1">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                    insight.severity === 'red' ? 'bg-red-500' :
                    insight.severity === 'amber' ? 'bg-amber-400' :
                    'bg-emerald-500'
                  }`} />
                  <span className="text-gray-700">{insight.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// ── Tab 4: Client Output ───────────────────────────────────────────────────────
function Tab4ClientOutput({ calc, quote, dispatch, copied, onCopy, editingParagraph, setEditingParagraph, onReset }) {
  const [pdfError, setPdfError] = useState(false);

  function handleDownloadPDF() {
    setPdfError(false);
    const letterContent = calc.clientParagraph;
    const clientName = quote.clientName?.trim() || 'Client';
    const date = quote.date || new Date().toLocaleDateString('en-AU');

    const escaped = letterContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const escapedName = clientName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Fee Summary \u2014 ${escapedName}</title>
  <style>
    @page { margin: 2.5cm; size: A4; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #111827; max-width: 100%; }
    .header { margin-bottom: 2em; padding-bottom: 1em; border-bottom: 2px solid #0d9488; }
    .header h1 { font-size: 16pt; font-weight: 700; color: #111827; margin: 0 0 4px 0; }
    .header .date { font-size: 9pt; color: #6b7280; }
    .letter-body { white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 10pt; line-height: 1.6; }
    .footer { margin-top: 3em; padding-top: 1em; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Advice Fee Summary${clientName !== 'Client' ? ` \u2014 ${escapedName}` : ''}</h1>
    <div class="date">${date}</div>
  </div>
  <div class="letter-body">${escaped}</div>
  <div class="footer">Prepared using FeeFrame</div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    iframe.contentDocument!.open();
    iframe.contentDocument!.write(html);
    iframe.contentDocument!.close();
    try {
      setTimeout(() => {
        iframe.contentWindow!.print();
        setTimeout(() => { document.body.removeChild(iframe); }, 1000);
      }, 500);
    } catch {
      document.body.removeChild(iframe);
      setPdfError(true);
    }
  }

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

      {/* Client letter */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold font-heading text-dark">Client Letter</h3>
          <div className="flex items-center gap-3">
            {quote.clientParagraphOverride != null && (
              <button
                onClick={() => dispatch({ type: 'SET_QUOTE_FIELD', field: 'clientParagraphOverride', value: null })}
                className="text-xs text-teal hover:underline"
              >
                Regenerate
              </button>
            )}
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
        </div>

        {editingParagraph ? (
          <textarea
            value={calc.clientParagraph}
            onChange={e => dispatch({ type: 'SET_QUOTE_FIELD', field: 'clientParagraphOverride', value: e.target.value })}
            rows={20}
            className="w-full rounded-input border border-light-border px-3 py-2.5 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 resize-y max-h-[500px] overflow-y-auto"
          />
        ) : (
          <div className="bg-light-surface rounded-input p-4 text-dark whitespace-pre-wrap leading-relaxed border border-light-border font-mono text-[13px] max-h-[500px] overflow-y-auto">
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
        <button
          onClick={handleDownloadPDF}
          className="bg-dark hover:bg-dark-surface text-white font-medium py-2.5 px-6 rounded-input transition-colors text-sm"
        >
          Download as PDF
        </button>
        {pdfError && (
          <p className="mt-2 text-xs text-risk">Couldn't open the print dialog. Try allowing popups for this site, or copy the letter and print manually.</p>
        )}
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
