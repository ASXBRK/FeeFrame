import { useState } from 'react';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency, formatHours } from '../../lib/formatters';
import ConfirmModal from '../../components/shared/ConfirmModal';

const TABS = ['Summary', 'Detailed Breakdown', 'Client Output', 'Export'];

export default function Step5Summary({ quote, dispatch, onBack, onGoAnalysis, onReset }) {
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

  function handleGoAnalysis() {
    onGoAnalysis({
      soaFeeExGst: calc.adjustedFeeRounded,
      implFeeExGst: calc.implTotal / 1.1,
      ongoingFeeExGst: calc.totalOngoingRounded,
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold font-heading text-dark mb-1 print:hidden">Fee Summary & Output</h2>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold font-heading text-dark">
          Advice Fee Summary{quote.clientName ? ` — ${quote.clientName}` : ''}
        </h1>
        <p className="text-sm text-mid">{quote.date}</p>
        <div className="border-b-2 border-teal mt-3" />
      </div>

      {/* Tabs */}
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

      {/* Tab 1: Summary */}
      {(tab === 0 || true) && (
        <div className={tab !== 0 ? 'print:block hidden' : ''}>
          {tab === 0 && <Tab1Summary calc={calc} quote={quote} />}
        </div>
      )}
      {tab === 1 && <Tab2Breakdown calc={calc} quote={quote} />}
      {tab === 2 && (
        <Tab3ClientOutput
          calc={calc}
          quote={quote}
          dispatch={dispatch}
          copied={copied}
          onCopy={handleCopy}
          editingParagraph={editingParagraph}
          setEditingParagraph={setEditingParagraph}
        />
      )}
      {tab === 3 && (
        <Tab4Export
          calc={calc}
          quote={quote}
          onReset={onReset}
          onGoAnalysis={handleGoAnalysis}
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

// ── Tab 1: Summary ────────────────────────────────────────────────────────────
function Tab1Summary({ calc, quote }) {
  return (
    <div className="space-y-5">
      {/* Initial fees hero */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-xs font-semibold text-mid uppercase tracking-wide mb-4">Initial Fees</h3>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-sm text-mid">SOA Preparation Fee (Incl GST)</span>
            <span className="text-2xl font-bold text-dark">{formatCurrency(calc.soaTotalInclGst)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-mid">Implementation Fees (Incl GST)</span>
            <span className="text-base font-semibold text-dark">{formatCurrency(calc.implTotal)}</span>
          </div>
          <div className="border-t border-light-border pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-dark">Total Initial Fees</span>
            <span className="text-xl font-bold text-teal">{formatCurrency(calc.totalInitialFees)}</span>
          </div>
        </div>
      </div>

      {/* Ongoing fees hero */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-xs font-semibold text-mid uppercase tracking-wide mb-4">Ongoing Fees</h3>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-sm text-mid">Annual Service Fee (Incl GST)</span>
            <span className="text-2xl font-bold text-dark">{formatCurrency(calc.totalOngoingInclGst)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-mid">Monthly equivalent</span>
            <span className="text-base font-semibold text-dark">{formatCurrency(calc.monthlyOngoing)}</span>
          </div>
        </div>
      </div>

      {/* Billing plan */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-xs font-semibold text-mid uppercase tracking-wide mb-4">Suggested Billing Plan</h3>
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

// ── Tab 2: Detailed Breakdown ─────────────────────────────────────────────────
function Tab2Breakdown({ calc, quote }) {
  return (
    <div className="space-y-5">
      {/* Initial SOA breakdown */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-sm font-semibold font-heading text-dark mb-4">Initial SOA Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-border">
                <th className="text-left py-2 text-xs font-medium text-mid">Service Line</th>
                <th className="text-right py-2 text-xs font-medium text-mid">Hours</th>
                <th className="text-right py-2 text-xs font-medium text-mid">Rate</th>
                <th className="text-right py-2 text-xs font-medium text-mid">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {calc.lineItems.filter(l => l.fee > 0).map(line => (
                <tr key={line.id}>
                  <td className="py-2 text-dark">{line.label}</td>
                  <td className="py-2 text-right text-mid">{formatHours(line.hours)}</td>
                  <td className="py-2 text-right text-mid">{formatCurrency(quote.hourlyRate)}</td>
                  <td className="py-2 text-right font-medium text-dark">{formatCurrency(line.fee)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-light-border">
                <td className="py-2 font-semibold text-dark" colSpan={3}>Subtotal (Base Fee)</td>
                <td className="py-2 text-right font-bold text-dark">{formatCurrency(calc.baseFee)}</td>
              </tr>
              {calc.complexityAmount > 0 && (
                <tr>
                  <td className="py-2 text-warning-text" colSpan={3}>Complexity Premium ({Math.round(calc.complexityRate * 100)}%)</td>
                  <td className="py-2 text-right font-medium text-warning-text">+{formatCurrency(calc.complexityAmount)}</td>
                </tr>
              )}
              {calc.easeAmount > 0 && (
                <tr>
                  <td className="py-2 text-healthy-text" colSpan={3}>Ease of Dealing Discount ({Math.round(calc.easeRate * 100)}%)</td>
                  <td className="py-2 text-right font-medium text-healthy-text">-{formatCurrency(calc.easeAmount)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-light-border">
                <td className="py-2 font-semibold text-dark" colSpan={3}>Adjusted SOA Fee (Excl GST)</td>
                <td className="py-2 text-right font-bold text-dark">{formatCurrency(calc.adjustedFeeRounded)}</td>
              </tr>
              <tr>
                <td className="py-2 text-mid" colSpan={3}>GST</td>
                <td className="py-2 text-right text-mid">{formatCurrency(calc.soaGst)}</td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-dark" colSpan={3}>Total SOA Fee (Incl GST)</td>
                <td className="py-2 text-right font-bold text-teal">{formatCurrency(calc.soaTotalInclGst)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Implementation breakdown */}
      {calc.implTotal > 0 && (
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-sm font-semibold font-heading text-dark mb-4">Implementation Breakdown</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-light-border">
              {calc.implInvestmentFee > 0 && (
                <tr>
                  <td className="py-2 text-dark">Investment & super implementation ({quote.investmentAccounts} accounts × $550)</td>
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
                <td className="py-2 font-bold text-dark">Total Implementation Fees (Incl GST)</td>
                <td className="py-2 text-right font-bold text-teal">{formatCurrency(calc.implTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Ongoing breakdown */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-sm font-semibold font-heading text-dark mb-4">Ongoing Service Breakdown</h3>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-light-border">
            <tr>
              <td className="py-2 text-dark">Review meetings ({quote.reviewMeetings} × {formatCurrency(calc.costPerReview)})</td>
              <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.reviewMeetings * calc.costPerReview)}</td>
            </tr>
            {calc.accountKeepingFee > 0 && (
              <tr>
                <td className="py-2 text-dark">Account keeping fees ({quote.ongoingAccounts} accounts)</td>
                <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.accountKeepingFee)}</td>
              </tr>
            )}
            {quote.marginLending && (
              <tr>
                <td className="py-2 text-dark">Margin lending facility fee</td>
                <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.marginLendingFee)}</td>
              </tr>
            )}
            {quote.ongoingModel === 'fixedVariable' && calc.variableFee > 0 && (
              <tr>
                <td className="py-2 text-dark">Variable FUM component</td>
                <td className="py-2 text-right font-medium text-dark">{formatCurrency(calc.variableFee)}</td>
              </tr>
            )}
            <tr className="border-t-2 border-light-border">
              <td className="py-2 font-semibold text-dark">Total Ongoing Fee (Excl GST)</td>
              <td className="py-2 text-right font-bold text-dark">{formatCurrency(calc.totalOngoingRounded)}</td>
            </tr>
            <tr>
              <td className="py-2 text-mid">GST</td>
              <td className="py-2 text-right text-mid">{formatCurrency(calc.ongoingGst)}</td>
            </tr>
            <tr>
              <td className="py-2 font-bold text-dark">Total Ongoing Fee (Incl GST)</td>
              <td className="py-2 text-right font-bold text-teal">{formatCurrency(calc.totalOngoingInclGst)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Client Output ──────────────────────────────────────────────────────
function Tab3ClientOutput({ calc, quote, dispatch, copied, onCopy, editingParagraph, setEditingParagraph }) {
  return (
    <div className="space-y-5">
      {/* Service summary */}
      <div className="bg-white rounded-card border border-light-border p-5">
        <h3 className="text-sm font-semibold font-heading text-dark mb-4">What's Included — Service Summary</h3>
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
          <h3 className="text-sm font-semibold font-heading text-dark">Client-Facing Justification Paragraph</h3>
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
            className="w-full rounded-input border border-light-border px-3 py-2 text-sm font-mono focus:outline-none focus:shadow-input resize-y"
          />
        ) : (
          <div className="bg-light-surface rounded-input p-4 text-sm text-dark whitespace-pre-wrap leading-relaxed border border-light-border">
            {calc.clientParagraph}
          </div>
        )}

        <button
          onClick={onCopy}
          className={`mt-4 w-full py-2.5 px-4 rounded-input text-sm font-medium transition-colors ${
            copied
              ? 'bg-healthy text-white'
              : 'bg-teal hover:opacity-90 text-white'
          }`}
        >
          {copied ? 'Copied' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
}

// ── Tab 4: Export ─────────────────────────────────────────────────────────────
function Tab4Export({ calc, quote, onReset, onGoAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-card border border-light-border p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold font-heading text-dark mb-1">Download PDF</h3>
          <p className="text-xs text-mid mb-3">Opens print dialog. Use your browser's "Save as PDF" option.</p>
          <button
            onClick={() => window.print()}
            className="bg-dark hover:bg-dark-surface text-white font-medium py-2.5 px-6 rounded-input transition-colors text-sm"
          >
            Download PDF
          </button>
        </div>

        <div className="border-t border-light-border pt-4">
          <h3 className="text-sm font-semibold font-heading text-dark mb-1">Analyse Profitability</h3>
          <p className="text-xs text-mid mb-3">Check if you're making money on this engagement. Fees will be pre-filled.</p>
          <button
            onClick={onGoAnalysis}
            className="bg-teal hover:opacity-90 text-white font-medium py-2.5 px-6 rounded-input transition-opacity text-sm"
          >
            Analyse Profitability →
          </button>
        </div>

        <div className="border-t border-light-border pt-4">
          <h3 className="text-sm font-semibold font-heading text-dark mb-1">Industry Benchmarks</h3>
          <div className="bg-light-surface rounded-input px-4 py-3 border border-dashed border-light-border">
            <p className="text-xs text-mid text-center">Industry benchmarks — coming soon</p>
          </div>
        </div>

        <div className="border-t border-light-border pt-4">
          <h3 className="text-sm font-semibold font-heading text-dark mb-1">Reset Quote</h3>
          <p className="text-xs text-mid mb-3">Clear all inputs and return to defaults.</p>
          <button
            onClick={onReset}
            className="bg-white border border-risk text-risk-text hover:bg-risk-bg font-medium py-2.5 px-6 rounded-input transition-colors text-sm"
          >
            Reset Quote
          </button>
        </div>
      </div>
    </div>
  );
}
