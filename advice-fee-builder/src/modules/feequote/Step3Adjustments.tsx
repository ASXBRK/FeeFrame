import { COMPLEXITY_FACTORS, EASE_FACTORS } from '../../lib/serviceLines';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency, formatPercent } from '../../lib/formatters';

export default function Step3Adjustments({ quote, dispatch, onNext, onBack }) {
  const calc = calculateQuote(quote);

  const setComplexity = (i, v) => dispatch({ type: 'SET_COMPLEXITY_FACTOR', index: i, value: v });
  const setEase = (i, v) => dispatch({ type: 'SET_EASE_FACTOR', index: i, value: v });
  const setField = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });

  return (
    <div>
      <h2 className="text-xl font-bold font-heading text-dark mb-1" style={{ letterSpacing: '-0.3px' }}>Adjustments</h2>
      <p className="text-sm text-mid mb-6">Apply complexity premiums, ease discounts, and implementation fees.</p>

      <div className="space-y-5">
        {/* Section A: Complexity */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-sm font-semibold font-heading text-dark mb-1">Complexity Premium</h3>
          <p className="text-xs text-mid mb-4">
            Select any factors that increase the complexity of this engagement.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {COMPLEXITY_FACTORS.map((factor, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!quote.complexityFactors[i]}
                  onChange={e => setComplexity(i, e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-light-border text-teal focus:ring-teal"
                />
                <span className="text-sm text-dark group-hover:text-dark leading-snug">{factor}</span>
              </label>
            ))}
          </div>
          <div className="bg-warning-bg border border-warning rounded-input px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-warning-text">
              Complexity factors selected: <strong>{calc.complexityCount}</strong> → Premium:{' '}
              <strong>{formatPercent(calc.complexityRate, 0)}</strong>
            </div>
            <div className="text-sm font-semibold text-warning-text">
              +{formatCurrency(calc.complexityAmount)}
            </div>
          </div>
        </div>

        {/* Section B: Ease of Dealing */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-sm font-semibold font-heading text-dark mb-1">Ease of Dealing Discount</h3>
          <p className="text-xs text-mid mb-4">
            Select any factors that reduce the cost of serving this client.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {EASE_FACTORS.map((factor, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!quote.easeFactors[i]}
                  onChange={e => setEase(i, e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-light-border text-teal focus:ring-teal"
                />
                <span className="text-sm text-dark group-hover:text-dark leading-snug">{factor}</span>
              </label>
            ))}
          </div>
          <div className="bg-healthy-bg border border-healthy rounded-input px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-healthy-text">
              Discount factors selected: <strong>{calc.easeCount}</strong> → Discount:{' '}
              <strong>{formatPercent(calc.easeRate, 0)}</strong>
            </div>
            <div className="text-sm font-semibold text-healthy-text">
              -{formatCurrency(calc.easeAmount)}
            </div>
          </div>
        </div>

        {/* Section C: Implementation Fees */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-sm font-semibold font-heading text-dark mb-4">Implementation Fees</h3>
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
            <div className="flex items-center gap-4 pt-2 border-t border-light-border">
              <div className="flex-1">
                <div className="text-sm font-medium text-dark">Less: Insurance commission offset</div>
                <div className="text-xs text-mid mt-0.5">Manual entry — adviser discretion</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-mid">-$</span>
                <input
                  type="number"
                  min={0}
                  value={quote.insuranceCommissionOffset}
                  onChange={e => setField('insuranceCommissionOffset', parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 text-right"
                />
              </div>
              <div className="w-24 text-right">
                <span className="text-sm font-medium text-risk-text">
                  {quote.insuranceCommissionOffset > 0 ? `-${formatCurrency(calc.commissionOffset)}` : '—'}
                </span>
              </div>
            </div>

            <div className="bg-light-surface rounded-card px-4 py-3 flex items-center justify-between border border-light-border mt-2">
              <span className="text-sm font-semibold text-dark">Total Implementation Fees (Incl GST)</span>
              <span className="text-base font-bold text-dark">{formatCurrency(calc.implTotal)}</span>
            </div>
          </div>
        </div>

        {/* Fee summary box */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-sm font-semibold font-heading text-dark mb-4">Fee Summary</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-light-border">
              <SummaryRow label="Base Fee Before Adjustments" value={formatCurrency(calc.baseFee)} />
              <SummaryRow label={`Complexity Premium (${formatPercent(calc.complexityRate, 0)})`} value={`+${formatCurrency(calc.complexityAmount)}`} valueClass="text-warning-text" />
              <SummaryRow label={`Ease of Dealing Discount (${formatPercent(calc.easeRate, 0)})`} value={`-${formatCurrency(calc.easeAmount)}`} valueClass="text-healthy-text" />
              <tr><td colSpan={2} className="py-1"><div className="border-t-2 border-light-border" /></td></tr>
              <SummaryRow label="Adjusted SOA Fee (Excl GST)" value={formatCurrency(calc.adjustedFeeRounded)} bold />
              <SummaryRow label="GST" value={formatCurrency(calc.soaGst)} />
              <SummaryRow label="Total SOA Fee (Incl GST)" value={formatCurrency(calc.soaTotalInclGst)} bold />
              <SummaryRow label="Implementation Fees (Incl GST)" value={formatCurrency(calc.implTotal)} />
              <tr><td colSpan={2} className="py-1"><div className="border-t-2 border-light-border" /></td></tr>
              <SummaryRow label="TOTAL INITIAL FEES" value={formatCurrency(calc.totalInitialFees)} bold large />
            </tbody>
          </table>
        </div>
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
          className="bg-teal hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-opacity text-sm"
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
        <div className="text-sm font-medium text-dark">{label}</div>
        <div className="text-xs text-mid mt-0.5">{helper}</div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 text-center"
        />
        <span className="text-xs text-mid">{inputLabel}</span>
      </div>
      <div className="w-24 text-right">
        <span className={`text-sm font-medium ${fee > 0 ? 'text-dark' : 'text-light-border'}`}>
          {formatCurrency(fee)}
        </span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold, large, valueClass }: { label: string; value: string; bold?: boolean; large?: boolean; valueClass?: string }) {
  return (
    <tr>
      <td className={`py-2 text-dark ${bold ? 'font-semibold' : ''} ${large ? 'text-base' : 'text-sm'}`}>{label}</td>
      <td className={`py-2 text-right ${bold ? 'font-bold' : 'font-medium'} ${large ? 'text-base' : 'text-sm'} ${valueClass || 'text-dark'}`}>{value}</td>
    </tr>
  );
}
