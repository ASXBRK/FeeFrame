import { useState, useRef } from 'react';
import { calculateQuote } from '../../lib/calculateQuote.js';
import { formatCurrency, formatHours } from '../../lib/formatters.js';
import { SERVICE_LINES } from '../../lib/serviceLines.js';
import ConfirmModal from '../shared/ConfirmModal.jsx';

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
      <h2 className="text-xl font-semibold text-gray-900 mb-1 print:hidden">Fee Summary & Output</h2>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Advice Fee Summary{quote.clientName ? ` — ${quote.clientName}` : ''}
        </h1>
        <p className="text-sm text-gray-500">{quote.date}</p>
        <div className="border-b-2 border-teal-500 mt-3" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200 print:hidden">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === i
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
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
          className="text-sm text-gray-500 hover:text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
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
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Initial Fees</h3>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-sm text-gray-600">SOA Preparation Fee (Incl GST)</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(calc.soaTotalInclGst)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Implementation Fees (Incl GST)</span>
            <span className="text-base font-semibold text-gray-700">{formatCurrency(calc.implTotal)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Total Initial Fees</span>
            <span className="text-xl font-bold text-teal-700">{formatCurrency(calc.totalInitialFees)}</span>
          </div>
        </div>
      </div>

      {/* Ongoing fees hero */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Ongoing Fees</h3>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-sm text-gray-600">Annual Service Fee (Incl GST)</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(calc.totalOngoingInclGst)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Monthly equivalent</span>
            <span className="text-base font-semibold text-gray-700">{formatCurrency(calc.monthlyOngoing)}</span>
          </div>
        </div>
      </div>

      {/* Billing plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Suggested Billing Plan</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-xs font-medium text-gray-500">Phase</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500 hidden sm:table-cell">Description</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500">Amount</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500 hidden md:table-cell">When</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500 hidden md:table-cell">How</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calc.billingPlan.map((row, i) => (
                <tr key={i}>
                  <td className="py-2.5 text-gray-700 font-medium pr-3">{row.phase}</td>
                  <td className="py-2.5 text-gray-500 pr-3 hidden sm:table-cell">{row.description}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-900">{formatCurrency(row.amount)}</td>
                  <td className="py-2.5 text-gray-500 pl-3 hidden md:table-cell">{row.when}</td>
                  <td className="py-2.5 text-gray-500 pl-3 hidden md:table-cell">{row.how}</td>
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
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Initial SOA Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-xs font-medium text-gray-500">Service Line</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500">Hours</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500">Rate</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calc.lineItems.filter(l => l.fee > 0).map(line => (
                <tr key={line.id}>
                  <td className="py-2 text-gray-700">{line.label}</td>
                  <td className="py-2 text-right text-gray-500">{formatHours(line.hours)}</td>
                  <td className="py-2 text-right text-gray-500">{formatCurrency(quote.hourlyRate)}</td>
                  <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(line.fee)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300">
                <td className="py-2 font-semibold text-gray-800" colSpan={3}>Subtotal (Base Fee)</td>
                <td className="py-2 text-right font-bold text-gray-900">{formatCurrency(calc.baseFee)}</td>
              </tr>
              {calc.complexityAmount > 0 && (
                <tr>
                  <td className="py-2 text-amber-700" colSpan={3}>Complexity Premium ({Math.round(calc.complexityRate * 100)}%)</td>
                  <td className="py-2 text-right font-medium text-amber-700">+{formatCurrency(calc.complexityAmount)}</td>
                </tr>
              )}
              {calc.easeAmount > 0 && (
                <tr>
                  <td className="py-2 text-green-700" colSpan={3}>Ease of Dealing Discount ({Math.round(calc.easeRate * 100)}%)</td>
                  <td className="py-2 text-right font-medium text-green-700">-{formatCurrency(calc.easeAmount)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-gray-300">
                <td className="py-2 font-semibold text-gray-800" colSpan={3}>Adjusted SOA Fee (Excl GST)</td>
                <td className="py-2 text-right font-bold text-gray-900">{formatCurrency(calc.adjustedFeeRounded)}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600" colSpan={3}>GST</td>
                <td className="py-2 text-right text-gray-600">{formatCurrency(calc.soaGst)}</td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-gray-900" colSpan={3}>Total SOA Fee (Incl GST)</td>
                <td className="py-2 text-right font-bold text-teal-700">{formatCurrency(calc.soaTotalInclGst)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Implementation breakdown */}
      {calc.implTotal > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Implementation Breakdown</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {calc.implInvestmentFee > 0 && (
                <tr>
                  <td className="py-2 text-gray-700">Investment & super implementation ({quote.investmentAccounts} accounts × $550)</td>
                  <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(calc.implInvestmentFee)}</td>
                </tr>
              )}
              {calc.implInSpecieFee > 0 && (
                <tr>
                  <td className="py-2 text-gray-700">In-specie transfers ({quote.inSpecieHours} hrs)</td>
                  <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(calc.implInSpecieFee)}</td>
                </tr>
              )}
              {calc.implInsuranceFee > 0 && (
                <tr>
                  <td className="py-2 text-gray-700">Insurance implementation ({quote.insuranceImplHours} hrs)</td>
                  <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(calc.implInsuranceFee)}</td>
                </tr>
              )}
              {calc.commissionOffset > 0 && (
                <tr>
                  <td className="py-2 text-gray-600">Less: Insurance commission offset</td>
                  <td className="py-2 text-right font-medium text-red-600">-{formatCurrency(calc.commissionOffset)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-gray-300">
                <td className="py-2 font-bold text-gray-900">Total Implementation Fees (Incl GST)</td>
                <td className="py-2 text-right font-bold text-teal-700">{formatCurrency(calc.implTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Ongoing breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Ongoing Service Breakdown</h3>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2 text-gray-700">Review meetings ({quote.reviewMeetings} × {formatCurrency(calc.costPerReview)})</td>
              <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(calc.reviewMeetings * calc.costPerReview)}</td>
            </tr>
            {calc.accountKeepingFee > 0 && (
              <tr>
                <td className="py-2 text-gray-700">Account keeping fees ({quote.ongoingAccounts} accounts)</td>
                <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(calc.accountKeepingFee)}</td>
              </tr>
            )}
            {quote.marginLending && (
              <tr>
                <td className="py-2 text-gray-700">Margin lending facility fee</td>
                <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(calc.marginLendingFee)}</td>
              </tr>
            )}
            {quote.ongoingModel === 'fixedVariable' && calc.variableFee > 0 && (
              <tr>
                <td className="py-2 text-gray-700">Variable FUM component</td>
                <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(calc.variableFee)}</td>
              </tr>
            )}
            <tr className="border-t-2 border-gray-300">
              <td className="py-2 font-semibold text-gray-800">Total Ongoing Fee (Excl GST)</td>
              <td className="py-2 text-right font-bold text-gray-900">{formatCurrency(calc.totalOngoingRounded)}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600">GST</td>
              <td className="py-2 text-right text-gray-600">{formatCurrency(calc.ongoingGst)}</td>
            </tr>
            <tr>
              <td className="py-2 font-bold text-gray-900">Total Ongoing Fee (Incl GST)</td>
              <td className="py-2 text-right font-bold text-teal-700">{formatCurrency(calc.totalOngoingInclGst)}</td>
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
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">What's Included — Service Summary</h3>
        <ul className="space-y-2">
          {calc.serviceSummaryItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-teal-500 mt-0.5 flex-shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Client paragraph */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Client-Facing Justification Paragraph</h3>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={editingParagraph}
              onChange={e => setEditingParagraph(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            Edit before copying
          </label>
        </div>

        {editingParagraph ? (
          <textarea
            value={calc.clientParagraph}
            onChange={e => dispatch({ type: 'SET_QUOTE_FIELD', field: 'clientParagraphOverride', value: e.target.value })}
            rows={12}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
          />
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-200">
            {calc.clientParagraph}
          </div>
        )}

        <button
          onClick={onCopy}
          className={`mt-4 w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
}

// ── Tab 4: Export ─────────────────────────────────────────────────────────────
function Tab4Export({ calc, quote, onReset, onGoAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Download PDF</h3>
          <p className="text-xs text-gray-400 mb-3">Opens print dialog. Use your browser's "Save as PDF" option.</p>
          <button
            onClick={() => window.print()}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            Download PDF
          </button>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Analyse Profitability</h3>
          <p className="text-xs text-gray-400 mb-3">Check if you're making money on this engagement. Fees will be pre-filled.</p>
          <button
            onClick={onGoAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            Analyse Profitability →
          </button>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Industry Benchmarks</h3>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-dashed border-gray-300">
            <p className="text-xs text-gray-400 text-center">Industry benchmarks — coming soon</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Reset Quote</h3>
          <p className="text-xs text-gray-400 mb-3">Clear all inputs and return to defaults.</p>
          <button
            onClick={onReset}
            className="bg-white border border-red-300 text-red-600 hover:bg-red-50 font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            Reset Quote
          </button>
        </div>
      </div>
    </div>
  );
}
