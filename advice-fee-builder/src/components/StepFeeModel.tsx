import TierEditor from './TierEditor.jsx';
import { formatCurrency, formatPercent } from '../lib/formatters.js';

const FEE_MODELS = [
  {
    key: 'flat',
    label: 'Flat Fee',
    description: 'Fixed dollar amount for initial SOA',
    icon: '💵',
  },
  {
    key: 'percentage',
    label: 'Percentage of FUA',
    description: 'Fee as % of funds under advice',
    icon: '%',
  },
  {
    key: 'tiered',
    label: 'Tiered Percentage',
    description: 'Different rates for different FUA bands',
    icon: '⬆',
  },
  {
    key: 'subscription',
    label: 'Monthly Subscription',
    description: 'Fixed recurring monthly fee',
    icon: '🔄',
  },
];

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-card p-5 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
    </label>
  );
}

function NumberInput({ id, value, onChange, prefix = '', suffix = '', min = 0, max, step = 1, placeholder = '' }) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-sm text-slate-400 pointer-events-none select-none">{prefix}</span>
      )}
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className={`w-full py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
          prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-8' : 'px-3'
        }`}
      />
      {suffix && (
        <span className="absolute right-3 text-sm text-slate-400 pointer-events-none select-none">{suffix}</span>
      )}
    </div>
  );
}

export default function StepFeeModel({ state, dispatch, onNext }) {
  const { feeModel, feeModelInputs } = state;

  const setModel = (model) => dispatch({ type: 'SET_FEE_MODEL', payload: model });

  const setInput = (field, value) => {
    const num = parseFloat(value);
    dispatch({
      type: 'SET_FEE_MODEL_INPUT',
      payload: { field, value: isNaN(num) ? value : num },
    });
  };

  const setTiers = (tiers) => {
    dispatch({ type: 'SET_TIERS', payload: tiers });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Fee Model</h1>
        <p className="mt-1 text-slate-500 text-sm">
          Select how you structure your fees. You can change this at any time.
        </p>
      </div>

      {/* Model selector */}
      <Card className="mb-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Fee structure</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEE_MODELS.map((model) => (
            <button
              key={model.key}
              onClick={() => setModel(model.key)}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all duration-150 ${
                feeModel === model.key
                  ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                  : 'border-slate-100 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="text-lg leading-none mt-0.5">{model.icon}</span>
              <div>
                <div className={`text-sm font-semibold font-heading ${
                  feeModel === model.key ? 'text-teal-700' : 'text-slate-800'
                }`}>
                  {model.label}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{model.description}</div>
              </div>
              {feeModel === model.key && (
                <div className="ml-auto flex-shrink-0">
                  <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Model-specific inputs */}
      {feeModel === 'flat' && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Flat fee amount</h2>
          <div className="max-w-xs">
            <Label htmlFor="flatFee">Initial SOA fee</Label>
            <NumberInput
              id="flatFee"
              value={feeModelInputs.flatFee}
              onChange={(v) => setInput('flatFee', v)}
              prefix="$"
              min={0}
              step={100}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            The calculator will compare this against your cost recovery to check viability.
          </p>
        </Card>
      )}

      {feeModel === 'percentage' && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Percentage of FUA</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fua">Funds under advice (FUA)</Label>
              <NumberInput
                id="fua"
                value={feeModelInputs.fua}
                onChange={(v) => setInput('fua', v)}
                prefix="$"
                min={0}
                step={10000}
              />
            </div>
            <div>
              <Label htmlFor="percentage">Annual fee rate</Label>
              <NumberInput
                id="percentage"
                value={feeModelInputs.percentage}
                onChange={(v) => setInput('percentage', v)}
                suffix="%"
                min={0}
                max={5}
                step={0.05}
              />
            </div>
          </div>
          {feeModelInputs.fua > 0 && feeModelInputs.percentage > 0 && (
            <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <span className="text-sm text-teal-700">
                Annual fee:{' '}
                <strong>
                  {formatCurrency(feeModelInputs.fua * (feeModelInputs.percentage / 100))}
                </strong>{' '}
                <span className="text-teal-500">
                  ({formatPercent(feeModelInputs.percentage)} of {formatCurrency(feeModelInputs.fua, 0)})
                </span>
              </span>
            </div>
          )}
        </Card>
      )}

      {feeModel === 'tiered' && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Tiered percentage</h2>
          <p className="text-xs text-slate-400 mb-4">
            Apply different rates to each FUA band. Rates cascade — the first band applies to the first $X, etc.
          </p>

          <div className="mb-5">
            <Label htmlFor="fuaTiered">Client's total FUA</Label>
            <div className="max-w-xs">
              <NumberInput
                id="fuaTiered"
                value={feeModelInputs.fua}
                onChange={(v) => setInput('fua', v)}
                prefix="$"
                min={0}
                step={10000}
              />
            </div>
          </div>

          <TierEditor tiers={feeModelInputs.tiers} onChange={setTiers} />
        </Card>
      )}

      {feeModel === 'subscription' && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly subscription</h2>
          <div className="max-w-xs">
            <Label htmlFor="monthlySubscription">Monthly fee</Label>
            <NumberInput
              id="monthlySubscription"
              value={feeModelInputs.monthlySubscription}
              onChange={(v) => setInput('monthlySubscription', v)}
              prefix="$"
              min={0}
              step={25}
            />
          </div>
          {feeModelInputs.monthlySubscription > 0 && (
            <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <span className="text-sm text-teal-700">
                Annual fee:{' '}
                <strong>{formatCurrency(feeModelInputs.monthlySubscription * 12)}</strong>
                {' '}/year
              </span>
            </div>
          )}
          <p className="mt-3 text-xs text-slate-400">
            Subscription covers ongoing service. The initial SOA fee will be calculated separately using cost recovery.
          </p>
        </Card>
      )}

      {/* Next button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors shadow-sm"
        >
          Continue to Client Profile
          <svg className="inline w-4 h-4 ml-2 -mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
