import { useState } from 'react';
import { calculateProfitability } from '../../lib/calculateProfitability.js';
import { formatCurrency, formatPercent } from '../../lib/formatters.js';
import logoLight from '../../assets/logos/feeframe-primary-light.svg';
import feeanalysisLogo from '../../assets/logos/feeanalysis-light.svg';

export default function FeeAnalysis({ state, dispatch, onGoHome, onGoQuote }) {
  const { analysis } = state;
  const calc = calculateProfitability(analysis);
  const [showThresholds, setShowThresholds] = useState(false);

  const setField = (field, value) => dispatch({ type: 'SET_ANALYSIS_FIELD', field, value });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-light-border px-6 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onGoHome} className="flex items-center hover:opacity-75 transition-opacity">
            <img src={logoLight} alt="FeeFrame" className="h-6" />
          </button>
          <span className="text-light-border">|</span>
          <img src={feeanalysisLogo} alt="FeeAnalysis" className="h-6" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'RESET_ANALYSIS' })}
            className="text-xs text-mid hover:text-red-500 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onGoQuote}
            className="text-xs font-medium text-teal hover:opacity-80 border border-teal-subtle hover:border-teal-light px-3 py-1.5 rounded-input transition-colors"
          >
            ← Back to FeeQuote
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Section 1: Fee Inputs */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Fee Inputs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FeeInputCard
              title="Initial SOA"
              fields={[
                { label: 'SOA fee charged (excl GST)', field: 'soaFeeExGst', value: analysis.soaFeeExGst },
                { label: 'Implementation fee (excl GST)', field: 'implFeeExGst', value: analysis.implFeeExGst },
              ]}
              setField={setField}
            />
            <FeeInputCard
              title="Ongoing (Annual)"
              fields={[
                { label: 'Ongoing fee charged (excl GST)', field: 'ongoingFeeExGst', value: analysis.ongoingFeeExGst },
              ]}
              setField={setField}
            />
          </div>
        </section>

        {/* Section 2: Cost Inputs */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Cost Inputs</h2>

          {/* Rates */}
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Rates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <RateInput label="Adviser hourly rate" field="adviserRate" value={analysis.adviserRate} setField={setField} />
              <RateInput label="Paraplanner hourly rate" field="paraplannerRate" value={analysis.paraplannerRate} setField={setField} />
              <RateInput label="Admin/support hourly rate" field="adminRate" value={analysis.adminRate} setField={setField} />
            </div>
          </div>

          {/* SOA tasks */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time Spent — Initial SOA</h3>
            </div>
            <TaskTable
              tasks={analysis.soaTasks}
              onSetTask={(i, field, value) => dispatch({ type: 'SET_SOA_TASK', index: i, field, value })}
              paraplanningExternal={analysis.soaParaplanningExternal}
              paraplanningExternalFee={analysis.soaParaplanningExternalFee}
              onToggleExternal={v => setField('soaParaplanningExternal', v)}
              onSetExternalFee={v => setField('soaParaplanningExternalFee', v)}
            />
          </div>

          {/* Ongoing tasks */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time Spent — Ongoing (per year)</h3>
            </div>
            <TaskTable
              tasks={analysis.ongoingTasks}
              onSetTask={(i, field, value) => dispatch({ type: 'SET_ONGOING_TASK', index: i, field, value })}
              paraplanningExternal={analysis.ongoingParaplanningExternal}
              paraplanningExternalFee={analysis.ongoingParaplanningExternalFee}
              onToggleExternal={v => setField('ongoingParaplanningExternal', v)}
              onSetExternalFee={v => setField('ongoingParaplanningExternalFee', v)}
            />
          </div>

          {/* Fixed costs */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Fixed Costs to Allocate (per client)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Licensee / AFSL fees', field: 'licenseeFees' },
                { label: 'Software & research tools', field: 'softwareCosts' },
                { label: 'PI insurance allocation', field: 'piInsurance' },
                { label: 'Other disbursements', field: 'otherDisbursements' },
              ].map(({ label, field }) => (
                <div key={field} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 flex-1">{label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      min={0}
                      value={analysis[field]}
                      onChange={e => setField(field, parseFloat(e.target.value) || 0)}
                      className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Profitability Dashboard */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-800">Profitability Dashboard</h2>
            <div className="relative">
              <button
                onClick={() => setShowThresholds(t => !t)}
                className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                title="Configure thresholds"
              >
                ⚙
              </button>
              {showThresholds && (
                <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72">
                  <h4 className="text-xs font-semibold text-gray-600 mb-3">Implied Rate Thresholds</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-green-700 font-medium">Green (≥)</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">$</span>
                        <input
                          type="number"
                          value={analysis.greenThreshold}
                          onChange={e => setField('greenThreshold', parseFloat(e.target.value) || 0)}
                          className="w-20 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-amber-700 font-medium">Amber (≥)</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">$</span>
                        <input
                          type="number"
                          value={analysis.amberThreshold}
                          onChange={e => setField('amberThreshold', parseFloat(e.target.value) || 0)}
                          className="w-20 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Below amber threshold = Red</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hero metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <MetricCard
              label="Implied Rate — Initial SOA"
              value={formatCurrency(calc.soaImpliedRate)}
              sub={`${formatCurrency(analysis.soaFeeExGst)} ÷ ${calc.soaAdviserHours.toFixed(1)} adviser hrs`}
              status={calc.soaRateStatus}
            />
            <MetricCard
              label="Implied Rate — Ongoing"
              value={formatCurrency(calc.ongoingImpliedRate)}
              sub={`${formatCurrency(analysis.ongoingFeeExGst)} ÷ ${calc.ongoingAdviserHours.toFixed(1)} adviser hrs`}
              status={calc.ongoingRateStatus}
            />
            <MetricCard
              label="Total Cost — Initial SOA"
              value={formatCurrency(calc.soaTotalCost)}
              sub="adviser + para + admin + fixed"
              status="neutral"
            />
            <MetricCard
              label="Margin — Initial SOA"
              value={formatCurrency(calc.soaMarginDollar)}
              sub={`${formatPercent(calc.soaMarginPercent, 1)} of fee`}
              status={calc.soaMarginDollar >= 0 ? 'green' : 'red'}
            />
            <MetricCard
              label="Total Cost — Ongoing"
              value={formatCurrency(calc.ongoingTotalCost)}
              sub="adviser + para + admin + fixed"
              status="neutral"
            />
            <MetricCard
              label="Margin — Ongoing"
              value={formatCurrency(calc.ongoingMarginDollar)}
              sub={`${formatPercent(calc.ongoingMarginPercent, 1)} of fee`}
              status={calc.ongoingMarginDollar >= 0 ? 'green' : 'red'}
            />
          </div>

          {/* Stacked bar charts */}
          <div className="space-y-4 mb-6">
            <StackedBar label="Initial SOA" segments={calc.soaSegments} total={Math.max(analysis.soaFeeExGst, calc.soaTotalCost)} />
            <StackedBar label="Ongoing" segments={calc.ongoingSegments} total={Math.max(analysis.ongoingFeeExGst, calc.ongoingTotalCost)} />

            {/* Legend */}
            <div className="flex flex-wrap gap-3 pt-1">
              {[
                { label: 'Adviser Time', color: '#2563EB' },
                { label: 'Paraplanning', color: '#0D9488' },
                { label: 'Admin', color: '#9CA3AF' },
                { label: 'Fixed Costs', color: '#4B5563' },
                { label: 'Margin', color: '#16A34A' },
                { label: 'Loss', color: '#DC2626' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Warning flags */}
          {calc.warnings.length > 0 && (
            <div className="space-y-2">
              {calc.warnings.map((w, i) => (
                <WarningCard key={i} type={w.type} message={w.message} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FeeInputCard({ title, fields, setField }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h4>
      <div className="space-y-3">
        {fields.map(({ label, field, value }) => (
          <div key={field}>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400">$</span>
              <input
                type="number"
                min={0}
                step={100}
                value={value}
                onChange={e => setField(field, parseFloat(e.target.value) || 0)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RateInput({ label, field, value, setField }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-400">$</span>
        <input
          type="number"
          min={0}
          step={10}
          value={value}
          onChange={e => setField(field, parseFloat(e.target.value) || 0)}
          className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-400">/hr</span>
      </div>
    </div>
  );
}

function TaskTable({ tasks, onSetTask, paraplanningExternal, paraplanningExternalFee, onToggleExternal, onSetExternalFee }) {
  const WHO_LABELS = { adviser: 'Adviser', paraplanner: 'Paraplanner', admin: 'Admin' };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 text-xs font-medium text-gray-500">Task</th>
            <th className="text-right py-2 text-xs font-medium text-gray-500 w-20">Hours</th>
            <th className="text-left py-2 text-xs font-medium text-gray-500 w-28 pl-3">Who</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tasks.map((task, i) => {
            const isPara = task.who === 'paraplanner';
            return (
              <tr key={i}>
                <td className="py-2 text-gray-700">{task.label}</td>
                <td className="py-2">
                  {isPara && paraplanningExternal ? (
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs text-gray-400">$</span>
                      <input
                        type="number"
                        min={0}
                        value={paraplanningExternalFee}
                        onChange={e => onSetExternalFee(parseFloat(e.target.value) || 0)}
                        className="w-20 rounded border border-gray-200 px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={task.hours}
                      onChange={e => onSetTask(i, 'hours', parseFloat(e.target.value) || 0)}
                      className="w-16 rounded border border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500 float-right"
                    />
                  )}
                </td>
                <td className="py-2 pl-3">
                  {isPara ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">External</span>
                      <button
                        type="button"
                        onClick={() => onToggleExternal(!paraplanningExternal)}
                        className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${paraplanningExternal ? 'bg-blue-500' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition ${paraplanningExternal ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={task.who}
                      onChange={e => onSetTask(i, 'who', e.target.value)}
                      className="w-full rounded border border-gray-200 px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="adviser">Adviser</option>
                      <option value="paraplanner">Paraplanner</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MetricCard({ label, value, sub, status }) {
  const statusColors = {
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    amber: 'bg-amber-50 border-amber-200',
    neutral: 'bg-gray-50 border-gray-200',
  };
  const valueColors = {
    green: 'text-green-700',
    red: 'text-red-600',
    amber: 'text-amber-700',
    neutral: 'text-gray-900',
  };
  return (
    <div className={`rounded-xl border p-4 ${statusColors[status] || statusColors.neutral}`}>
      <div className="text-xs text-gray-500 mb-1 leading-tight">{label}</div>
      <div className={`text-xl font-bold ${valueColors[status] || valueColors.neutral}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1 leading-tight">{sub}</div>
    </div>
  );
}

function StackedBar({ label, segments, total }) {
  if (!total || total <= 0) return null;
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 mb-1.5">{label}</div>
      <div className="flex h-8 rounded-lg overflow-hidden bg-gray-100">
        {segments.map((seg, i) => {
          const pct = Math.min(100, (seg.value / total) * 100);
          if (pct <= 0) return null;
          return (
            <div
              key={i}
              style={{ width: `${pct}%`, backgroundColor: seg.color }}
              className="transition-all duration-300 relative group"
              title={`${seg.label}: ${formatCurrency(seg.value)}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 mt-1.5">
        {segments.filter(s => s.value > 0).map((seg, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span>{seg.label}: {formatCurrency(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarningCard({ type, message }) {
  const styles = {
    red: 'bg-red-50 border-red-200 text-red-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    green: 'bg-green-50 border-green-200 text-green-800',
  };
  const icons = { red: '⚠', amber: '⚠', green: '✓' };
  return (
    <div className={`border rounded-lg px-4 py-3 flex items-start gap-2 text-sm ${styles[type] || styles.amber}`}>
      <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
