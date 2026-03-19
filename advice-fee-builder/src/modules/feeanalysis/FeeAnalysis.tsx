import { useState } from 'react';
import { calculateProfitability } from '../../lib/calculateProfitability';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { colors } from '../../brand';
import AnalysisSidebar from './AnalysisSidebar';

export default function FeeAnalysis({ state, dispatch, onGoHome, onGoQuote }) {
  const { analysis } = state;
  const calc = calculateProfitability(analysis);
  const [showThresholds, setShowThresholds] = useState(false);

  const setField = (field, value) => dispatch({ type: 'SET_ANALYSIS_FIELD', field, value });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      <AnalysisSidebar
        onGoHome={onGoHome}
        onGoQuote={onGoQuote}
        onReset={() => dispatch({ type: 'RESET_ANALYSIS' })}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto px-4 sm:px-6 py-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Section 1: Fee Inputs */}
        <section id="fee-inputs" className="bg-white rounded-card border border-light-border p-5">
          <h2 className="text-xl font-bold font-heading text-dark mb-4" style={{ letterSpacing: '-0.3px' }}>Fee Inputs</h2>
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
        <section id="cost-inputs" className="bg-white rounded-card border border-light-border p-5">
          <h2 className="text-xl font-bold font-heading text-dark mb-4" style={{ letterSpacing: '-0.3px' }}>Cost Inputs</h2>

          {/* Rates */}
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-mid uppercase tracking-wide mb-3">Your Rates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <RateInput label="Adviser hourly rate" field="adviserRate" value={analysis.adviserRate} setField={setField} />
              <RateInput label="Paraplanner hourly rate" field="paraplannerRate" value={analysis.paraplannerRate} setField={setField} />
              <RateInput label="Admin/support hourly rate" field="adminRate" value={analysis.adminRate} setField={setField} />
            </div>
          </div>

          {/* SOA tasks */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-mid uppercase tracking-wide">Time Spent — Initial SOA</h3>
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
              <h3 className="text-xs font-semibold text-mid uppercase tracking-wide">Time Spent — Ongoing (per year)</h3>
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
            <h3 className="text-xs font-semibold text-mid uppercase tracking-wide mb-3">Fixed Costs to Allocate (per client)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Licensee / AFSL fees', field: 'licenseeFees' },
                { label: 'Software & research tools', field: 'softwareCosts' },
                { label: 'PI insurance allocation', field: 'piInsurance' },
                { label: 'Other disbursements', field: 'otherDisbursements' },
              ].map(({ label, field }) => (
                <div key={field} className="flex items-center gap-2">
                  <span className="text-sm text-mid flex-1">{label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-mid">$</span>
                    <input
                      type="number"
                      min={0}
                      value={analysis[field]}
                      onChange={e => setField(field, parseFloat(e.target.value) || 0)}
                      className="w-24 rounded-input border border-light-border px-2 py-1.5 text-[15px] text-right focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Profitability Dashboard */}
        <section id="profitability" className="bg-white rounded-card border border-light-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold font-heading text-dark" style={{ letterSpacing: '-0.3px' }}>Profitability Dashboard</h2>
            <div className="relative">
              <button
                onClick={() => setShowThresholds(t => !t)}
                className="text-mid hover:text-dark text-sm transition-colors"
                title="Configure thresholds"
              >
                ⚙
              </button>
              {showThresholds && (
                <div className="absolute right-0 top-8 z-10 bg-white border border-light-border rounded-card shadow-card-hover p-4 w-72">
                  <h4 className="text-xs font-semibold text-mid mb-3">Implied Rate Thresholds</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-healthy-text font-medium">Green (≥)</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-mid">$</span>
                        <input
                          type="number"
                          value={analysis.greenThreshold}
                          onChange={e => setField('greenThreshold', parseFloat(e.target.value) || 0)}
                          className="w-20 rounded-input border border-light-border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-warning-text font-medium">Amber (≥)</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-mid">$</span>
                        <input
                          type="number"
                          value={analysis.amberThreshold}
                          onChange={e => setField('amberThreshold', parseFloat(e.target.value) || 0)}
                          className="w-20 rounded-input border border-light-border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-mid">Below amber threshold = Red</p>
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
                { label: 'Adviser Time',  color: colors.dark },
                { label: 'Paraplanning',  color: colors.teal },
                { label: 'Admin',         color: colors.mid },
                { label: 'Fixed Costs',   color: colors.darkSurface },
                { label: 'Margin',        color: colors.healthy },
                { label: 'Loss',          color: colors.risk },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-mid">
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
        </main>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FeeInputCard({ title, fields, setField }) {
  return (
    <div className="bg-white rounded-card p-4 border border-light-border">
      <h4 className="text-xs font-semibold text-mid uppercase tracking-wide mb-3">{title}</h4>
      <div className="space-y-3">
        {fields.map(({ label, field, value }) => (
          <div key={field}>
            <label className="block text-xs text-mid mb-1">{label}</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-mid">$</span>
              <input
                type="number"
                min={0}
                step={100}
                value={value}
                onChange={e => setField(field, parseFloat(e.target.value) || 0)}
                className="flex-1 rounded-input border border-light-border px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
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
      <label className="block text-xs text-mid mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <span className="text-sm text-mid">$</span>
        <input
          type="number"
          min={0}
          step={10}
          value={value}
          onChange={e => setField(field, parseFloat(e.target.value) || 0)}
          className="flex-1 rounded-input border border-light-border px-2 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
        />
        <span className="text-xs text-mid">/hr</span>
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
          <tr className="border-b border-light-border">
            <th className="text-left py-2 text-xs font-medium text-mid">Task</th>
            <th className="text-right py-2 text-xs font-medium text-mid w-20">Hours</th>
            <th className="text-left py-2 text-xs font-medium text-mid w-28 pl-3">Who</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-light-border">
          {tasks.map((task, i) => {
            const isPara = task.who === 'paraplanner';
            return (
              <tr key={i}>
                <td className="py-2 text-dark">{task.label}</td>
                <td className="py-2">
                  {isPara && paraplanningExternal ? (
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs text-mid">$</span>
                      <input
                        type="number"
                        min={0}
                        value={paraplanningExternalFee}
                        onChange={e => onSetExternalFee(parseFloat(e.target.value) || 0)}
                        className="w-20 rounded-input border border-light-border px-2 py-1 text-xs text-right focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                      />
                    </div>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={task.hours}
                      onChange={e => onSetTask(i, 'hours', parseFloat(e.target.value) || 0)}
                      className="w-16 rounded-input border border-light-border px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 float-right"
                    />
                  )}
                </td>
                <td className="py-2 pl-3">
                  {isPara ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-mid">External</span>
                      <button
                        type="button"
                        onClick={() => onToggleExternal(!paraplanningExternal)}
                        className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${paraplanningExternal ? 'bg-teal' : 'bg-light-border'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition ${paraplanningExternal ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={task.who}
                      onChange={e => onSetTask(i, 'who', e.target.value)}
                      className="w-full rounded-input border border-light-border px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
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
    green: 'bg-healthy-bg border-healthy',
    red: 'bg-risk-bg border-risk',
    amber: 'bg-warning-bg border-warning',
    neutral: 'bg-light-surface border-light-border',
  };
  const valueColors = {
    green: 'text-healthy-text',
    red: 'text-risk-text',
    amber: 'text-warning-text',
    neutral: 'text-dark',
  };
  return (
    <div className={`rounded-card border p-4 ${statusColors[status] || statusColors.neutral}`}>
      <div className="text-xs text-mid mb-1 leading-tight">{label}</div>
      <div className={`text-xl font-bold ${valueColors[status] || valueColors.neutral}`}>{value}</div>
      <div className="text-xs text-mid mt-1 leading-tight">{sub}</div>
    </div>
  );
}

function StackedBar({ label, segments, total }) {
  if (!total || total <= 0) return null;
  return (
    <div>
      <div className="text-xs font-medium text-mid mb-1.5">{label}</div>
      <div className="flex h-8 rounded-card overflow-hidden bg-light-surface">
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
          <div key={i} className="flex items-center gap-1 text-xs text-mid">
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
    red: 'bg-risk-bg border-risk text-risk-text',
    amber: 'bg-warning-bg border-warning text-warning-text',
    green: 'bg-healthy-bg border-healthy text-healthy-text',
  };
  const icons = { red: '⚠', amber: '⚠', green: '✓' };
  return (
    <div className={`border rounded-input px-4 py-3 flex items-start gap-2 text-sm ${styles[type] || styles.amber}`}>
      <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
