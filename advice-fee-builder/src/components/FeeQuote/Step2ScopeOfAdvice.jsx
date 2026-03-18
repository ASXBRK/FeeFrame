import { useState } from 'react';
import Toggle from '../shared/Toggle.jsx';
import { SERVICE_LINES, STRATEGIES } from '../../lib/serviceLines.js';
import { calculateQuote } from '../../lib/calculateQuote.js';
import { formatCurrency } from '../../lib/formatters.js';

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
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Scope of Advice</h2>
      <p className="text-sm text-gray-500 mb-6">Select the services in scope. Fees calculate automatically.</p>

      <div className="space-y-5">
        {/* Paraplanner type */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <label className="block text-sm font-medium text-gray-700 mb-3">Paraplanner</label>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${!isExternal ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Internal</span>
            <Toggle
              checked={isExternal}
              onChange={v => set('paraplanner', v ? 'external' : 'internal')}
              label="Paraplanner type"
            />
            <span className={`text-sm ${isExternal ? 'font-medium text-gray-900' : 'text-gray-400'}`}>External</span>
          </div>
        </div>

        {/* External: just a quoted fee */}
        {isExternal && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quoted paraplanning fee (excl GST)
            </label>
            <p className="text-xs text-gray-400 mb-3">Enter the fixed fee quoted by your external paraplanner.</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                min={0}
                step={50}
                value={quote.paraplannerFee}
                onChange={e => set('paraplannerFee', parseFloat(e.target.value) || 0)}
                className="block w-36 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-400">ex GST</span>
            </div>
            <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-teal-700 font-medium">Base fee (ex GST)</span>
                <span className="text-sm font-bold text-teal-800">{formatCurrency(quote.paraplannerFee)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Internal: full service lines */}
        {!isExternal && (
          <>
            {/* Hourly rate */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average staff hourly rate (excl GST)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={quote.hourlyRate}
                  onChange={e => setRate(parseFloat(e.target.value) || 0)}
                  className="block w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-400">per hour</span>
              </div>
            </div>

            {/* Service lines table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Service Lines</h3>
              </div>

              <div className="divide-y divide-gray-100">
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
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Base Fee Before Adjustments</span>
                <span className="text-base font-bold text-gray-900">{formatCurrency(calc.baseFee)}</span>
              </div>
            </div>

            {/* Strategy checkboxes */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setStrategiesOpen(o => !o)}
                className="w-full px-5 py-4 flex items-center justify-between text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Strategies in Scope</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Checking a strategy auto-enables its service line and increments the strategy development count.
                  </p>
                </div>
                <span className="text-gray-400 text-xs ml-4">{strategiesOpen ? '▲' : '▼'}</span>
              </button>

              {strategiesOpen && (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STRATEGIES.map((strategy) => (
                    <label key={strategy.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!!quote.strategies[strategy.id]}
                        onChange={e => setStrategy(strategy.id, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{strategy.label}</span>
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
          className="text-sm text-gray-500 hover:text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
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
          className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
        />
      );
    }
    if (line.inputType === 'auto-entity') {
      return (
        <span className="text-sm text-gray-500">{quote.entityCount} entities</span>
      );
    }
    if (line.inputType === 'auto-strategy') {
      return (
        <span className="text-sm text-gray-500">{computed?.displayValue ?? 0} strategies</span>
      );
    }
    return null;
  };

  return (
    <div className="px-5 py-3.5 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800">{line.label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{line.description}</div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        {renderControl()}
        <div className="w-20 text-right">
          <span className={`text-sm font-medium ${fee > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
            {formatCurrency(fee)}
          </span>
        </div>
      </div>
    </div>
  );
}
