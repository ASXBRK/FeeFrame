import { useState, useMemo } from 'react';
import { calculateFees } from '../lib/calculateFees';
import { formatCurrency, formatHours } from '../lib/formatters';
import ImpliedRateGauge from './ImpliedRateGauge.jsx';
import FeeComparisonBar from './FeeComparisonBar.jsx';
import CopyButton from './CopyButton.jsx';

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'breakdown', label: 'Detailed Breakdown' },
  { key: 'client', label: 'Client Output' },
  { key: 'export', label: 'Export' },
];

function SectionCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-card p-5 ${className}`}>
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>}
      {children}
    </div>
  );
}

function FeeBadge({ label, value, sub, accent = false }) {
  return (
    <div className={`rounded-xl p-5 border ${accent ? 'bg-navy-800 border-navy-700' : 'bg-white border-slate-200'}`}>
      <div className={`text-xs font-medium mb-1 ${accent ? 'text-teal-300' : 'text-slate-400'}`}>{label}</div>
      <div className={`text-3xl font-bold font-heading ${accent ? 'text-white' : 'text-slate-900'}`}>
        {formatCurrency(value)}
      </div>
      {sub && (
        <div className={`text-xs mt-1 ${accent ? 'text-navy-300' : 'text-slate-400'}`}>{sub}</div>
      )}
    </div>
  );
}

function BreakdownTable({ items, total }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Item</th>
            <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Hours</th>
            <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-2.5 pr-4 text-slate-700">{item.label}</td>
              <td className="py-2.5 pr-4 text-right text-slate-400 text-xs whitespace-nowrap">
                {item.hours !== null && item.hours !== undefined ? formatHours(item.hours) : '—'}
              </td>
              <td className="py-2.5 text-right font-medium text-slate-800 whitespace-nowrap">
                {formatCurrency(item.cost)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200">
            <td className="pt-3 pr-4 font-bold text-slate-900">Total</td>
            <td className="pt-3 pr-4" />
            <td className="pt-3 text-right font-bold text-slate-900">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function StepResults({ state, onBack }) {
  const [activeTab, setActiveTab] = useState('summary');

  const fees = useMemo(() => calculateFees(state), [state]);

  const {
    totalAdviserHoursInitial,
    totalAdviserHoursOngoing,
    costRecoveryInitial,
    costRecoveryOngoing,
    modelDerivedFeeInitial,
    modelDerivedFeeOngoing,
    displayInitialFee,
    displayOngoingFee,
    impliedHourlyRateInitial,
    impliedHourlyRateOngoing,
    hourlyRateStatus,
    initialBreakdown,
    ongoingBreakdown,
    clientParagraph,
    serviceSummaryItems,
  } = fees;

  const today = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">Fee Summary</h1>
          <p className="mt-1 text-slate-500 text-sm">Prepared {today}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
        >
          <svg className="inline w-4 h-4 mr-1.5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Edit inputs
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 overflow-x-auto print:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Summary Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'summary' && (
        <div className="space-y-5">
          {/* Fee headline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeeBadge
              label="Initial SOA Fee"
              value={displayInitialFee}
              sub={`Cost recovery: ${formatCurrency(costRecoveryInitial)}`}
              accent
            />
            <FeeBadge
              label="Ongoing Annual Fee"
              value={displayOngoingFee}
              sub={`Cost recovery: ${formatCurrency(costRecoveryOngoing)}`}
            />
          </div>

          {/* Implied rate */}
          <ImpliedRateGauge
            rate={impliedHourlyRateInitial}
            totalHours={totalAdviserHoursInitial}
            fee={displayInitialFee}
            status={hourlyRateStatus}
          />

          {/* Comparison bars */}
          {modelDerivedFeeInitial !== null && (
            <FeeComparisonBar
              costRecovery={costRecoveryInitial}
              modelFee={modelDerivedFeeInitial}
              label="Initial fee — cost recovery vs model"
            />
          )}
          {modelDerivedFeeOngoing !== null && (
            <FeeComparisonBar
              costRecovery={costRecoveryOngoing}
              modelFee={modelDerivedFeeOngoing}
              label="Ongoing fee — cost recovery vs model"
            />
          )}

          {/* Service summary */}
          <SectionCard title="What's included">
            <ul className="space-y-2">
              {serviceSummaryItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Industry benchmarks placeholder */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-sm font-semibold text-slate-500">Industry benchmarks</h3>
            </div>
            <p className="text-xs text-slate-400">
              Industry benchmark comparison data coming soon. This section will show how your fees compare to published adviser fee surveys.
            </p>
          </div>
        </div>
      )}

      {/* ── Breakdown Tab ────────────────────────────────────────────────── */}
      {activeTab === 'breakdown' && (
        <div className="space-y-5">
          <SectionCard title="Initial SOA cost breakdown">
            <BreakdownTable
              items={initialBreakdown}
              total={initialBreakdown.reduce((s, i) => s + i.cost, 0)}
            />
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-slate-400">Adviser hours</div>
                <div className="text-base font-bold font-heading text-slate-800 mt-0.5">
                  {formatHours(totalAdviserHoursInitial)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Cost recovery</div>
                <div className="text-base font-bold font-heading text-slate-800 mt-0.5">
                  {formatCurrency(costRecoveryInitial)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Your fee</div>
                <div className="text-base font-bold font-heading text-teal-700 mt-0.5">
                  {formatCurrency(displayInitialFee)}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Ongoing service cost breakdown">
            <BreakdownTable
              items={ongoingBreakdown}
              total={ongoingBreakdown.reduce((s, i) => s + i.cost, 0)}
            />
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-slate-400">Adviser hours/yr</div>
                <div className="text-base font-bold font-heading text-slate-800 mt-0.5">
                  {formatHours(totalAdviserHoursOngoing)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Cost recovery</div>
                <div className="text-base font-bold font-heading text-slate-800 mt-0.5">
                  {formatCurrency(costRecoveryOngoing)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Your fee</div>
                <div className="text-base font-bold font-heading text-teal-700 mt-0.5">
                  {formatCurrency(displayOngoingFee)}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Implied hourly rate — ongoing">
            <ImpliedRateGauge
              rate={impliedHourlyRateOngoing}
              totalHours={totalAdviserHoursOngoing}
              fee={displayOngoingFee}
              status={
                impliedHourlyRateOngoing >= state.settings.impliedRateGreen
                  ? 'green'
                  : impliedHourlyRateOngoing >= state.settings.impliedRateAmber
                  ? 'amber'
                  : 'red'
              }
            />
          </SectionCard>
        </div>
      )}

      {/* ── Client Output Tab ────────────────────────────────────────────── */}
      {activeTab === 'client' && (
        <div className="space-y-5">
          <SectionCard title="Client-facing paragraph">
            <p className="text-xs text-slate-400 mb-4">
              Ready to paste into an email or SOA cover letter. Review and personalise before sending.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                {clientParagraph}
              </p>
            </div>
            <div className="flex justify-end mt-3">
              <CopyButton text={clientParagraph} />
            </div>
          </SectionCard>

          <SectionCard title="Service inclusion list">
            <p className="text-xs text-slate-400 mb-3">
              Bullet points for use in SOA or FSG-style service description.
            </p>
            <ul className="space-y-2 mb-4">
              {serviceSummaryItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-teal-500 font-bold mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex justify-end">
              <CopyButton text={serviceSummaryItems.map(i => `• ${i}`).join('\n')} />
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Export Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'export' && (
        <div className="space-y-5">
          <SectionCard title="Print / PDF export">
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Generates a clean A4-formatted PDF via your browser's print dialog. Choose "Save as PDF" as the destination.
              The sidebar and navigation are hidden in print — you get the full breakdown and client paragraph on professional-looking pages.
            </p>

            {/* Preview of what will print */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 mb-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Print preview includes:</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Header: "Advice Fee Summary — Prepared {today}"
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Fee overview (initial + ongoing)
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Full cost breakdown tables
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Client-facing paragraph
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Service inclusion list
                </li>
              </ul>
            </div>

            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-navy-800 text-white text-sm font-semibold rounded-xl hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-800 focus:ring-offset-2 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Download PDF (Print to PDF)
            </button>
          </SectionCard>

          {/* Settings */}
          <SectionCard title="Implied rate thresholds">
            <p className="text-xs text-slate-400 mb-4">
              Adjust the green/amber thresholds for the implied hourly rate health check.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Green above ($)</label>
                <input
                  type="number"
                  value={state.settings.impliedRateGreen}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) {
                      // dispatch handled by parent — pass up
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amber above ($)</label>
                <input
                  type="number"
                  value={state.settings.impliedRateAmber}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min={0}
                />
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Print-only content ───────────────────────────────────────────── */}
      <div className="hidden print:block print-content">
        <div className="print-header">
          <h1>Advice Fee Summary</h1>
          <p>Prepared {today}</p>
        </div>

        <div className="print-section">
          <h2>Fee Overview</h2>
          <table className="print-table">
            <tbody>
              <tr>
                <td>Initial SOA Fee</td>
                <td className="text-right font-bold">{formatCurrency(displayInitialFee)}</td>
              </tr>
              <tr>
                <td>Cost recovery (minimum)</td>
                <td className="text-right">{formatCurrency(costRecoveryInitial)}</td>
              </tr>
              <tr>
                <td>Ongoing Annual Fee</td>
                <td className="text-right font-bold">{formatCurrency(displayOngoingFee)}</td>
              </tr>
              <tr>
                <td>Ongoing cost recovery (minimum)</td>
                <td className="text-right">{formatCurrency(costRecoveryOngoing)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="print-section">
          <h2>Initial SOA Cost Breakdown</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">Hours</th>
                <th className="text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {initialBreakdown.map((item, i) => (
                <tr key={i}>
                  <td>{item.label}</td>
                  <td className="text-right">{item.hours !== null && item.hours !== undefined ? formatHours(item.hours) : '—'}</td>
                  <td className="text-right">{formatCurrency(item.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-section">
          <h2>Ongoing Service Cost Breakdown</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">Hours</th>
                <th className="text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {ongoingBreakdown.map((item, i) => (
                <tr key={i}>
                  <td>{item.label}</td>
                  <td className="text-right">{item.hours !== null && item.hours !== undefined ? formatHours(item.hours) : '—'}</td>
                  <td className="text-right">{formatCurrency(item.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-section">
          <h2>Client-Facing Paragraph</h2>
          <p className="print-paragraph">{clientParagraph}</p>
        </div>

        <div className="print-section">
          <h2>Service Inclusions</h2>
          <ul className="print-list">
            {serviceSummaryItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
