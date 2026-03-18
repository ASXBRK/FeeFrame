import { COMPLEXITY_FACTORS, EASE_FACTORS } from '../../lib/serviceLines.js';
import { calculateQuote } from '../../lib/calculateQuote.js';
import { formatCurrency, formatPercent } from '../../lib/formatters.js';

export default function Step3Adjustments({ quote, dispatch, onNext, onBack }) {
  const calc = calculateQuote(quote);

  const setComplexity = (i, v) => dispatch({ type: 'SET_COMPLEXITY_FACTOR', index: i, value: v });
  const setEase = (i, v) => dispatch({ type: 'SET_EASE_FACTOR', index: i, value: v });
  const setField = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Adjustments</h2>
      <p className="text-sm text-gray-500 mb-6">Apply complexity premiums, ease discounts, and implementation fees.</p>

      <div className="space-y-5">
        {/* Section A: Complexity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Complexity Premium</h3>
          <p className="text-xs text-gray-400 mb-4">
            Select any factors that increase the complexity of this engagement.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {COMPLEXITY_FACTORS.map((factor, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!quote.complexityFactors[i]}
                  onChange={e => setComplexity(i, e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-snug">{factor}</span>
              </label>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-amber-800">
              Complexity factors selected: <strong>{calc.complexityCount}</strong> → Premium:{' '}
              <strong>{formatPercent(calc.complexityRate, 0)}</strong>
            </div>
            <div className="text-sm font-semibold text-amber-900">
              +{formatCurrency(calc.complexityAmount)}
            </div>
          </div>
        </div>

        {/* Section B: Ease of Dealing */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Ease of Dealing Discount</h3>
          <p className="text-xs text-gray-400 mb-4">
            Select any factors that reduce the cost of serving this client.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {EASE_FACTORS.map((factor, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!quote.easeFactors[i]}
                  onChange={e => setEase(i, e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-snug">{factor}</span>
              </label>
            ))}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-green-800">
              Discount factors selected: <strong>{calc.easeCount}</strong> → Discount:{' '}
              <strong>{formatPercent(calc.easeRate, 0)}</strong>
            </div>
            <div className="text-sm font-semibold text-green-900">
              -{formatCurrency(calc.easeAmount)}
            </div>
          </div>
        </div>

        {/* Section C: Implementation Fees */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Implementation Fees</h3>
          <div className="space-y-4">

            <ImplRow
              label="Investment & super implementation"
              helper={`$550 incl GST per account`}
              value={quote.investmentAccounts}
              inputLabel="accounts"
              onChange={v => setField('investmentAccounts', v)}
              fee={calc.implInvestmentFee}
            />

            <ImplRow
              label="In-specie transfers of existing assets"
              helper={`Hourly rate × 1.1 per hour`}
              value={quote.inSpecieHours}
              inputLabel="hours"
              onChange={v => setField('inSpecieHours', v)}
              fee={calc.implInSpecieFee}
            />

            <ImplRow
              label="Insurance implementation"
              helper={`Hourly rate × 1.1 per hour`}
              value={quote.insuranceImplHours}
              inputLabel="hours"
              onChange={v => setField('insuranceImplHours', v)}
              fee={calc.implInsuranceFee}
            />

            {/* Commission offset */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Less: Insurance commission offset</div>
                <div className="text-xs text-gray-400 mt-0.5">Manual entry — adviser discretion</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">-$</span>
                <input
                  type="number"
                  min={0}
                  value={quote.insuranceCommissionOffset}
                  onChange={e => setField('insuranceCommissionOffset', parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-right"
                />
              </div>
              <div className="w-24 text-right">
                <span className="text-sm font-medium text-red-600">
                  {quote.insuranceCommissionOffset > 0 ? `-${formatCurrency(calc.commissionOffset)}` : '—'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between border border-gray-200 mt-2">
              <span className="text-sm font-semibold text-gray-700">Total Implementation Fees (Incl GST)</span>
              <span className="text-base font-bold text-gray-900">{formatCurrency(calc.implTotal)}</span>
            </div>
          </div>
        </div>

        {/* Fee summary box */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Fee Summary</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <SummaryRow label="Base Fee Before Adjustments" value={formatCurrency(calc.baseFee)} />
              <SummaryRow label={`Complexity Premium (${formatPercent(calc.complexityRate, 0)})`} value={`+${formatCurrency(calc.complexityAmount)}`} valueClass="text-amber-700" />
              <SummaryRow label={`Ease of Dealing Discount (${formatPercent(calc.easeRate, 0)})`} value={`-${formatCurrency(calc.easeAmount)}`} valueClass="text-green-700" />
              <tr><td colSpan={2} className="py-1"><div className="border-t-2 border-gray-300" /></td></tr>
              <SummaryRow label="Adjusted SOA Fee (Excl GST)" value={formatCurrency(calc.adjustedFeeRounded)} bold />
              <SummaryRow label="GST" value={formatCurrency(calc.soaGst)} />
              <SummaryRow label="Total SOA Fee (Incl GST)" value={formatCurrency(calc.soaTotalInclGst)} bold />
              <SummaryRow label="Implementation Fees (Incl GST)" value={formatCurrency(calc.implTotal)} />
              <tr><td colSpan={2} className="py-1"><div className="border-t-2 border-gray-300" /></td></tr>
              <SummaryRow label="TOTAL INITIAL FEES" value={formatCurrency(calc.totalInitialFees)} bold large />
            </tbody>
          </table>
        </div>
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
          Next: Ongoing Service →
        </button>
      </div>
    </div>
  );
}

function ImplRow({ label, helper, value, inputLabel, onChange, fee }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{helper}</div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
        />
        <span className="text-xs text-gray-400">{inputLabel}</span>
      </div>
      <div className="w-24 text-right">
        <span className={`text-sm font-medium ${fee > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
          {formatCurrency(fee)}
        </span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold, large, valueClass }) {
  return (
    <tr>
      <td className={`py-2 text-gray-700 ${bold ? 'font-semibold' : ''} ${large ? 'text-base' : 'text-sm'}`}>{label}</td>
      <td className={`py-2 text-right ${bold ? 'font-bold' : 'font-medium'} ${large ? 'text-base' : 'text-sm'} ${valueClass || 'text-gray-900'}`}>{value}</td>
    </tr>
  );
}
