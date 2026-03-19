import { useState } from 'react';
import Toggle from '../../components/shared/Toggle';
import { SERVICE_LINES, STRATEGIES } from '../../lib/serviceLines';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency } from '../../lib/formatters';

export default function Step2ScopeOfAdvice({ quote, dispatch, onNext, onBack }) {
  const [strategiesOpen, setStrategiesOpen] = useState(true);
  const calc = calculateQuote(quote);

  const set = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });
  const setRate = (v) => set('hourlyRate', v);
  const setServiceLine = (id, value) => dispatch({ type: 'SET_SERVICE_LINE', id, value });
  const setStrategy = (id, enabled) => dispatch({ type: 'SET_STRATEGY', id, enabled });

  const isExternal = quote.paraplanner === 'external';

  return (
    <div>
      <h2 className="text-xl font-semibold font-heading text-dark mb-1">Scope of Advice</h2>
      <p className="text-sm text-mid mb-6">Select the services in scope. Fees calculate automatically.</p>

      <div className="space-y-5">
        {/* Paraplanner type */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <label className="block text-sm font-medium text-dark mb-3">Paraplanner</label>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${!isExternal ? 'font-medium text-dark' : 'text-mid'}`}>Internal</span>
            <Toggle
              checked={isExternal}
              onChange={v => set('paraplanner', v ? 'external' : 'internal')}
              label="Paraplanner type"
            />
            <span className={`text-sm ${isExternal ? 'font-medium text-dark' : 'text-mid'}`}>External</span>
          </div>
        </div>

        {/* External: just a quoted fee */}
        {isExternal && (
          <div className="bg-white rounded-card border border-light-border p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                External paraplanning fee (excl GST)
              </label>
              <p className="text-xs text-mid mb-3">Enter the fee quoted by your external paraplanner.</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-mid">$</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={quote.paraplannerFee}
                  onChange={e => set('paraplannerFee', parseFloat(e.target.value) || 0)}
                  className="block w-36 rounded-input border border-light-border px-3 py-2 text-sm focus:outline-none focus:shadow-input"
                />
                <span className="text-sm text-mid">ex GST</span>
              </div>
            </div>

            {/* Buffer toggle */}
            <div className="border-t border-light-border pt-4">
              <div className="flex items-start gap-3">
                <Toggle
                  checked={!!quote.paraplannerBuffer}
                  onChange={v => set('paraplannerBuffer', v)}
                  label="Add 10% buffer"
                />
                <div>
                  <p className="text-sm font-medium text-dark">Add a 10% buffer</p>
                  <p className="text-xs text-mid mt-0.5">
                    If the paraplanning fee could increase before completion, a buffer protects your margin from absorbing the difference.
                  </p>
                </div>
              </div>
            </div>

            {/* Fee summary */}
            <div className="p-3 bg-teal-subtle rounded-input border border-teal-light space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-teal">Quoted fee</span>
                <span className="text-xs text-teal">{formatCurrency(quote.paraplannerFee)}</span>
              </div>
              {quote.paraplannerBuffer && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-teal">10% buffer</span>
                  <span className="text-xs text-teal">+ {formatCurrency(quote.paraplannerFee * 0.1)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-teal-light pt-1.5">
                <span className="text-sm text-teal font-medium">Base fee (ex GST)</span>
                <span className="text-sm font-bold text-teal">
                  {formatCurrency(quote.paraplannerBuffer ? quote.paraplannerFee * 1.1 : quote.paraplannerFee)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Internal: full service lines */}
        {!isExternal && (
          <>
            {/* Hourly rate */}
            <div className="bg-white rounded-card border border-light-border p-5">
              <label className="block text-sm font-medium text-dark mb-1">
                Average staff hourly rate (excl GST)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-mid">$</span>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={quote.hourlyRate}
                  onChange={e => setRate(parseFloat(e.target.value) || 0)}
                  className="block w-28 rounded-input border border-light-border px-3 py-2 text-sm focus:outline-none focus:shadow-input"
                />
                <span className="text-sm text-mid">per hour</span>
              </div>
            </div>

            {/* Service lines table */}
            <div className="bg-white rounded-card border border-light-border overflow-hidden">
              <div className="px-5 py-4 border-b border-light-border">
                <h3 className="text-sm font-semibold text-dark">Service Lines</h3>
              </div>

              <div className="divide-y divide-light-border">
                {SERVICE_LINES.map((line, idx) => {
                  const computed = calc.lineItems.find(l => l.id === line.id);
                  return (
                    <ServiceLineRow
                      key={line.id}
                      line={line}
                      computed={computed}
                      quote={quote}
                      onSetServiceLine={setServiceLine}
                      onSetField={(field, val) => dispatch({ type: 'SET_QUOTE_FIELD', field, value: val })}
                      rowIndex={idx}
                    />
                  );
                })}
              </div>

              {/* Base fee total */}
              <div className="px-5 py-4 bg-light-surface border-t border-light-border flex items-center justify-between">
                <span className="text-sm font-semibold text-dark">Base Fee Before Adjustments</span>
                <span className="text-base font-bold text-dark">{formatCurrency(calc.baseFee)}</span>
              </div>
            </div>

            {/* Strategy checkboxes */}
            <div className="bg-white rounded-card border border-light-border overflow-hidden">
              <button
                type="button"
                onClick={() => setStrategiesOpen(o => !o)}
                className="w-full px-5 py-4 flex items-center justify-between text-left border-b border-light-border hover:bg-light-surface transition-colors"
              >
                <div>
                  <h3 className="text-sm font-semibold text-dark">Strategies in Scope</h3>
                  <p className="text-xs text-mid mt-0.5">
                    Checking a strategy auto-enables its service line and increments the strategy development count.
                  </p>
                </div>
                <span className="text-mid text-xs ml-4">{strategiesOpen ? '▲' : '▼'}</span>
              </button>

              {strategiesOpen && (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STRATEGIES.map((strategy) => (
                    <label key={strategy.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!!quote.strategies[strategy.id]}
                        onChange={e => setStrategy(strategy.id, e.target.checked)}
                        className="w-4 h-4 rounded border-light-border text-teal focus:ring-teal"
                      />
                      <span className="text-sm text-dark group-hover:text-dark">{strategy.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="text-sm text-mid hover:text-dark font-medium py-2.5 px-4 rounded-input border border-light-border hover:border-mid transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="bg-teal hover:opacity-90 text-white font-medium py-2.5 px-6 rounded-input transition-opacity text-sm"
        >
          Next: Adjustments →
        </button>
      </div>
    </div>
  );
}

function ServiceLineRow({ line, computed, quote, onSetServiceLine, onSetField }) {
  const fee = computed?.fee ?? 0;

  const renderControl = () => {
    if (line.inputType === 'toggle') {
      const checked = !!quote.serviceLines[line.id];
      return (
        <Toggle
          checked={checked}
          onChange={v => onSetServiceLine(line.id, v)}
          label={line.label}
        />
      );
    }
    if (line.inputType === 'number') {
      return (
        <input
          type="number"
          min={0}
          step={1}
          value={quote.scenarios}
          onChange={e => onSetField('scenarios', Math.max(0, parseInt(e.target.value) || 0))}
          className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:shadow-input text-center"
        />
      );
    }
    if (line.inputType === 'auto-entity') {
      return (
        <span className="text-sm text-mid">{quote.entityCount} entities</span>
      );
    }
    if (line.inputType === 'auto-strategy') {
      return (
        <span className="text-sm text-mid">{computed?.displayValue ?? 0} strategies</span>
      );
    }
    return null;
  };

  return (
    <div className="px-5 py-3.5 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-dark">{line.label}</div>
        <div className="text-xs text-mid mt-0.5">{line.description}</div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        {renderControl()}
        <div className="w-20 text-right">
          <span className={`text-sm font-medium ${fee > 0 ? 'text-dark' : 'text-light-border'}`}>
            {formatCurrency(fee)}
          </span>
        </div>
      </div>
    </div>
  );
}
