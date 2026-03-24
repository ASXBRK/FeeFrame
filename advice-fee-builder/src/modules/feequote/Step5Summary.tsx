import { useState } from 'react';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency, formatHours } from '../../lib/formatters';
import NumInput from '../../components/shared/NumInput';
import ConfirmModal from '../../components/shared/ConfirmModal';
import Tooltip from '../../components/shared/Tooltip';
import feeanalysisLogo from '../../assets/logos/feeanalysis-light.svg';

const TABS = ['Summary', 'Detailed Breakdown', 'Profitability', 'Client Output'];

export default function Step5Summary({ quote, dispatch, onReset, onNavigate, onGoAnalysis }) {
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
              <Tooltip text="The average Australian advice practice operates at a 21% profit margin (Adviser Ratings 2024). Top-performing practices achieve 47% (Iress Advisely Index 2024)." />
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
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800 mt-3">
          💡 Your firm's target profit margin applied to all fees.
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
        {tab === 0 && <Tab1Summary calc={calc} quote={quote} dispatch={dispatch} />}
      </div>
      {tab === 1 && <Tab2Breakdown calc={calc} quote={quote} />}
      {tab === 2 && <Tab3Profitability calc={calc} quote={quote} onNavigate={onNavigate} onGoAnalysis={onGoAnalysis} />}
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

      <BillingPlanSection calc={calc} quote={quote} dispatch={dispatch} />
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
        {calc.implTotal > 0 && !calc.waiveImplementation && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-mid w-36 flex-shrink-0">Implementation fee</span>
            <span className="text-dark font-medium">{formatCurrency(calc.hasIncentives ? calc.implIncentivisedFee : calc.implTotal)}</span>
            <span className="text-mid">Method</span>
            <select value={implMethod} onChange={e => set('implMethod', e.target.value)} className={inputCls}>
              <option value="platform">Platform</option>
              <option value="invoice">Invoice</option>
            </select>
          </div>
        )}
        {calc.implTotal > 0 && calc.waiveImplementation && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-mid w-36 flex-shrink-0">Implementation fee</span>
            <span className="text-dark">Waived</span>
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
                    {/* Bug fix: was calc.discountRate (engagement-factor rate only); dollar amount uses
                        effectiveDiscountRate (engagement + relationship combined), so label was wrong
                        whenever a relationship discount was active — e.g. label said -5% but amount was -25%. */}
                    Discounts ({calc.discountCount} factor{calc.discountCount !== 1 ? 's' : ''}, -{Math.round(calc.effectiveDiscountRate * 100)}%)
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
                      {/* Bug fix: same as SOA discount label — was calc.discountRate, should be effectiveDiscountRate */}
                      Discounts (-{Math.round(calc.effectiveDiscountRate * 100)}%)
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
function StackedBar({ segments }: { segments: { label: string; value: number; color: string; textColor?: string }[] }) {
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
          <div key={seg.label} className={`flex items-center gap-1.5 text-xs ${seg.textColor || 'text-mid'}`}>
            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${seg.color}`} />
            {seg.label}: {formatCurrency(seg.value)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Tab3Profitability({ calc, quote, onNavigate, onGoAnalysis }) {
  const isFixedOngoing = calc.hasOngoing && quote.ongoingModel === 'fixedOnly';
  const isPercentageOngoing = calc.hasOngoing && quote.ongoingModel === 'percentageBased';
  const isSubscriptionOngoing = calc.hasOngoing && quote.ongoingModel === 'subscription';
  const hasOngoingCostData = isFixedOngoing;

  const soaDirectCost = calc.soaAdviserCost + calc.soaParaplannerCost + calc.soaAdminCost;
  const soaTotalCost = soaDirectCost + calc.soaExternalFee;

  const soaTrueProfit = calc.adjustedFeeRounded - calc.soaTrueCost;
  const ongoingTrueProfit = calc.totalOngoingRounded - calc.ongoingTrueCost;

  const firstYearMargin = soaTrueProfit + (hasOngoingCostData ? ongoingTrueProfit : 0);

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

  const showCtaCard = isPercentageOngoing || isSubscriptionOngoing;

  function handleGoToFeeAnalysis() {
    if (onGoAnalysis) {
      onGoAnalysis({
        soaFeeExGst: calc.adjustedFeeRounded,
        implFeeExGst: calc.implTotal > 0 ? calc.implTotal / 1.1 : 0,
        ongoingFeeExGst: calc.totalOngoingRounded,
      });
    } else {
      onNavigate('feeanalysis');
    }
  }

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
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SOA Cost → Client Fee</div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-gray-500">{formatCurrency(calc.soaTrueCost)}</span>
            <span className="text-gray-300">→</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(calc.soaTotalInclGst)}</span>
            <span className="text-xs text-gray-400">incl GST</span>
          </div>
          <div className="text-sm text-gray-500 mt-1.5">
            Margin:{' '}
            <span className={soaTrueProfit > 0 ? 'font-semibold text-green-600' : soaTrueProfit < 0 ? 'font-semibold text-red-600' : 'text-gray-400'}>
              {formatCurrency(soaTrueProfit)}
            </span>
            {' '}
            <span className="text-gray-400">({calc.adjustedFeeRounded > 0 ? Math.round((soaTrueProfit / calc.adjustedFeeRounded) * 100) : 0}% ex GST)</span>
          </div>
        </div>

        {/* Card 2: Ongoing cost → fee */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ongoing Cost → Client Fee</div>
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
              <div className="text-sm text-gray-500 mt-1.5">
                Margin:{' '}
                <span className={ongoingTrueProfit > 0 ? 'font-semibold text-green-600' : ongoingTrueProfit < 0 ? 'font-semibold text-red-600' : 'text-gray-400'}>
                  {formatCurrency(ongoingTrueProfit)}
                </span>
                {' '}
                <span className="text-gray-400">({calc.totalOngoingRounded > 0 ? Math.round((ongoingTrueProfit / calc.totalOngoingRounded) * 100) : 0}% ex GST)</span>
              </div>
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
          {(isPercentageOngoing || isSubscriptionOngoing) ? (
            <div className="text-sm text-gray-400 mt-1">SOA margin only (ex GST) — ongoing cost data not available</div>
          ) : (
            <div className="text-sm text-gray-400 mt-1">Combined first year margin (ex GST)</div>
          )}
        </div>
      </div>

      {/* SOA cost breakdown */}
      <div className="bg-white rounded-card border border-light-border p-5 space-y-5">
        <h3 className="text-base font-bold font-heading text-dark">Cost Breakdown</h3>

        <div>
          <div className="text-sm font-medium text-dark mb-2">Initial SOA</div>
          <StackedBar segments={[
            { label: 'Adviser time', value: calc.soaAdviserCost, color: 'bg-slate-700', textColor: 'text-slate-700' },
            { label: calc.soaExternalFee > 0 ? 'External paraplanning' : 'Paraplanning', value: calc.soaParaplannerCost + calc.soaExternalFee, color: 'bg-violet-600', textColor: 'text-violet-600' },
            { label: 'Admin', value: calc.soaAdminCost, color: 'bg-amber-600', textColor: 'text-amber-600' },
            ...(soaTrueProfit > 0 ? [{ label: 'Margin', value: soaTrueProfit, color: 'bg-emerald-500', textColor: 'text-emerald-600' }] : []),
            { label: 'GST', value: calc.soaTotalInclGst - calc.adjustedFeeRounded, color: 'bg-slate-200', textColor: 'text-slate-400' },
          ]} />
          {soaTrueProfit < 0 && (
            <p className="text-sm text-red-600 font-medium mt-1">Loss: {formatCurrency(soaTrueProfit)}</p>
          )}
        </div>

        {/* Fixed ongoing cost breakdown */}
        {isFixedOngoing && calc.totalOngoingHours > 0 && (
          <div>
            <div className="text-sm font-medium text-dark mb-2">Ongoing (annual)</div>
            <StackedBar segments={[
              { label: 'Adviser time', value: calc.ongoingAdviserCost, color: 'bg-slate-700', textColor: 'text-slate-700' },
              { label: 'Paraplanning', value: calc.ongoingParaplannerCost, color: 'bg-violet-600', textColor: 'text-violet-600' },
              { label: 'Admin', value: calc.ongoingAdminCost, color: 'bg-amber-600', textColor: 'text-amber-600' },
              ...(ongoingTrueProfit > 0 ? [{ label: 'Margin', value: ongoingTrueProfit, color: 'bg-emerald-500', textColor: 'text-emerald-600' }] : []),
              { label: 'GST', value: calc.totalOngoingInclGst - calc.totalOngoingRounded, color: 'bg-slate-200', textColor: 'text-slate-400' },
            ]} />
            {ongoingTrueProfit < 0 && (
              <p className="text-sm text-red-600 font-medium mt-1">Loss: {formatCurrency(ongoingTrueProfit)}</p>
            )}
          </div>
        )}

        {/* Percentage-based ongoing — no cost breakdown */}
        {isPercentageOngoing && (
          <div className="border-t border-light-border pt-4">
            <div className="text-sm font-medium text-dark mb-2">Ongoing (percentage-based)</div>
            <div className="text-sm text-mid">
              <span className="text-dark font-medium">Percentage-based fee: {formatCurrency(calc.totalOngoingRounded)} p.a.</span>
              {' '}Based on {formatCurrency(Number(quote.fum) || 0)} FUM across {(quote.tiers || []).length} tier{(quote.tiers || []).length !== 1 ? 's' : ''}.
              {' '}Effective rate: {(calc.effectiveFumRate * 100).toFixed(2)}%
            </div>
          </div>
        )}

        {/* Subscription ongoing — no cost breakdown */}
        {isSubscriptionOngoing && (
          <div className="border-t border-light-border pt-4">
            <div className="text-sm font-medium text-dark mb-2">Ongoing (subscription)</div>
            <div className="text-sm text-mid">
              <span className="text-dark font-medium">Subscription fee: {formatCurrency(calc.totalOngoingRounded)} p.a.</span>
              {' '}({formatCurrency(Number(quote.monthlySubscription) || 0)}/month). Includes {quote.reviewMeetings || 0} review meeting{(quote.reviewMeetings || 0) !== 1 ? 's' : ''} per year.
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

      {/* FeeAnalysis CTA — percentage/subscription models only */}
      {showCtaCard && (
        <div className="bg-white border border-gray-200 border-l-4 border-l-teal-500 rounded-xl p-6 mt-6">
          <img src={feeanalysisLogo} alt="FeeAnalysis" className="h-8 mb-4" />
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            Want to know if this arrangement is profitable?
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            FeeAnalysis lets you input your actual time data against fee arrangements to check your real margins. Your quote data will be pre-filled.
          </p>
          <button
            onClick={handleGoToFeeAnalysis}
            className="bg-teal hover:opacity-90 text-white font-medium py-2 px-5 rounded-lg transition-opacity text-sm"
          >
            Analyse in FeeAnalysis →
          </button>
        </div>
      )}

      {/* Attribution */}
      <div className="flex items-center justify-center gap-2 mt-8 mb-4">
        <span className="text-sm text-gray-400">Powered by</span>
        <img src={feeanalysisLogo} alt="FeeAnalysis" className="h-8 opacity-40" />
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
