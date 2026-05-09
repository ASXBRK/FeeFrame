import Nav from '../../components/Nav';
import FooterBar from '../../components/shared/FooterBar';
import BenchmarkSection from '../../components/benchmarks/BenchmarkSection';
import { useFeeCompareForm } from './useFeeCompareForm';
import { useDebouncedValue } from '../../lib/useDebouncedValue';
import CrossLinkCTAs from './CrossLinkCTAs';
import { useDocumentMeta } from '../../lib/useDocumentMeta';
import type { FeeCompareStructure, AdviceComplexity } from './types';

interface Props {
  onGoHome: () => void;
  onNavigate: (page: string) => void;
}

const STRUCTURES: ReadonlyArray<{ value: FeeCompareStructure; label: string }> = [
  { value: 'fixed',        label: 'Fixed dollar' },
  { value: 'percentage',   label: '% of FUA' },
  { value: 'subscription', label: 'Subscription' },
];

const COMPLEXITIES: ReadonlyArray<{ value: AdviceComplexity; label: string; sub: string }> = [
  { value: 'simple',        label: 'Simple',        sub: 'Single-issue, one entity' },
  { value: 'comprehensive', label: 'Comprehensive', sub: 'Multi-strategy, complex structure' },
];

function fmtAnnual(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-AU') + ' / year';
}

const inputCls = 'w-full rounded-input border border-light-border px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0';

export default function FeeCompare({ onGoHome, onNavigate }: Props) {
  useDocumentMeta({ title: 'FeeCompare — Benchmark your fee against the Australian advice market', description: 'See how your fee compares to current Australian market data, auto-scaled to your client\'s wealth band. Free, no signup.', ogUrl: 'https://feeframe.com/feecompare' });
  const { state, setFee, setStructure, setFeePercent, setFeeMonthly, setClientFUA, setComplexity } = useFeeCompareForm();

  // Debounce numeric inputs 300ms; structure/complexity are immediate
  const dFee       = useDebouncedValue(state.fee,       300);
  const dFeePercent= useDebouncedValue(state.feePercent,300);
  const dFeeMonthly= useDebouncedValue(state.feeMonthly,300);
  const dClientFUA = useDebouncedValue(state.clientFUA, 300);

  // Derive annual fee in $ from debounced state
  function deriveAnnualFee(): number | null {
    if (state.feeStructure === 'fixed') {
      return dFee !== null && dFee > 0 ? dFee : null;
    }
    if (state.feeStructure === 'percentage') {
      if (!dFeePercent || !dClientFUA) return null;
      return (dFeePercent / 100) * dClientFUA;
    }
    // subscription
    return dFeeMonthly !== null && dFeeMonthly > 0 ? dFeeMonthly * 12 : null;
  }

  const annualFee = deriveAnnualFee();
  const hasData   = annualFee !== null && annualFee > 0;

  const segBtn = (value: FeeCompareStructure, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setStructure(value)}
      className={`px-3 py-1.5 rounded-input text-sm font-medium transition-colors ${
        state.feeStructure === value
          ? 'bg-teal text-white'
          : 'bg-light-surface text-dark hover:bg-light-border'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <Nav current="landing" onNavigate={p => onNavigate(p)} />
      <div className="min-h-screen bg-light flex flex-col">

        {/* Page header */}
        <header className="bg-white border-b border-light-border px-6 py-5">
          <div className="max-w-3xl mx-auto flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold font-heading text-dark" style={{ letterSpacing: '-0.3px' }}>
                Fee benchmark
              </h1>
              <p className="text-sm text-mid mt-0.5">
                Compare your advice fee to 2025 Australian market data. Nothing is saved.
              </p>
            </div>
            <button
              onClick={onGoHome}
              className="text-xs text-mid hover:text-dark transition-colors"
            >
              ← Home
            </button>
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" className="flex-1 px-4 sm:px-6 py-6 pb-12 max-w-3xl w-full mx-auto space-y-5">

          {/* Quick-entry form card */}
          <div className="bg-white rounded-card border border-light-border p-5 space-y-5">
            <div>
              <h2 className="text-base font-bold font-heading text-dark">Enter your fee details</h2>
              <p className="text-xs text-mid mt-0.5">Fill in the fields below to see an instant benchmark.</p>
            </div>

            {/* Fee structure */}
            <div>
              <p className="text-xs font-medium text-mid mb-2">Fee structure</p>
              <div className="flex flex-wrap gap-2">
                {STRUCTURES.map(s => segBtn(s.value, s.label))}
              </div>
            </div>

            {/* Fee amount inputs — conditional on structure */}
            {state.feeStructure === 'fixed' && (
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Annual advice fee</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid">$</span>
                  <input
                    type="number"
                    min="0"
                    max="500000"
                    value={state.fee ?? ''}
                    onChange={e => setFee(e.target.value === '' ? null : Math.max(0, Number(e.target.value)))}
                    placeholder="e.g. 5500"
                    className={`${inputCls} w-40`}
                  />
                  <span className="text-sm text-mid">/ year (incl. GST)</span>
                </div>
              </div>
            )}

            {state.feeStructure === 'percentage' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Fee rate</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.01"
                      value={state.feePercent ?? ''}
                      onChange={e => setFeePercent(e.target.value === '' ? null : Number(e.target.value))}
                      placeholder="e.g. 0.75"
                      className={`${inputCls} w-24`}
                    />
                    <span className="text-sm text-mid">% of FUA</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Client FUA</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-mid">$</span>
                    <input
                      type="number"
                      min="0"
                      max="50000000"
                      value={state.clientFUA ?? ''}
                      onChange={e => setClientFUA(e.target.value === '' ? null : Number(e.target.value))}
                      placeholder="e.g. 500000"
                      className={`${inputCls} w-40`}
                    />
                  </div>
                </div>
              </div>
            )}

            {state.feeStructure === 'subscription' && (
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Monthly subscription</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid">$</span>
                  <input
                    type="number"
                    min="0"
                    max="50000"
                    value={state.feeMonthly ?? ''}
                    onChange={e => setFeeMonthly(e.target.value === '' ? null : Number(e.target.value))}
                    placeholder="e.g. 450"
                    className={`${inputCls} w-36`}
                  />
                  <span className="text-sm text-mid">/ month (incl. GST)</span>
                </div>
              </div>
            )}

            {/* FUA for fixed / subscription — optional for band context */}
            {state.feeStructure !== 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-dark mb-1">
                  Client FUA <span className="text-xs font-normal text-mid">(optional — used to scale the benchmark band)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid">$</span>
                  <input
                    type="number"
                    min="0"
                    max="50000000"
                    value={state.clientFUA ?? ''}
                    onChange={e => setClientFUA(e.target.value === '' ? null : Number(e.target.value))}
                    placeholder="e.g. 500000"
                    className={`${inputCls} w-40`}
                  />
                </div>
              </div>
            )}

            {/* Advice complexity */}
            <div>
              <p className="text-xs font-medium text-mid mb-2">Advice complexity</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMPLEXITIES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setComplexity(c.value)}
                    className={`flex items-start gap-3 px-4 py-3 rounded-input border text-left transition-colors ${
                      state.adviceComplexity === c.value
                        ? 'border-teal bg-teal/5'
                        : 'border-light-border hover:border-teal/30 bg-white'
                    }`}
                  >
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                      state.adviceComplexity === c.value ? 'border-teal bg-teal' : 'border-light-border bg-white'
                    }`} />
                    <span>
                      <span className="block text-sm font-medium text-dark">{c.label}</span>
                      <span className="block text-xs text-mid mt-0.5">{c.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Annual fee summary */}
            {hasData && (
              <div className="bg-teal/5 border border-teal/20 rounded-input px-4 py-2.5">
                <p className="text-sm text-dark">
                  <span className="font-semibold text-teal">{fmtAnnual(annualFee!)}</span>
                  {state.feeStructure === 'percentage' && dFeePercent
                    ? ` (${dFeePercent}% of $${(dClientFUA ?? 0).toLocaleString('en-AU')} FUA)`
                    : state.feeStructure === 'subscription' && dFeeMonthly
                    ? ` ($${dFeeMonthly.toLocaleString('en-AU')}/mo × 12)`
                    : ''}
                </p>
              </div>
            )}
          </div>

          {/* Benchmark section — expanded by default, or placeholder */}
          {hasData ? (
            <BenchmarkSection
              fee={annualFee!}
              feeStructure={state.feeStructure}
              feePercent={dFeePercent ?? undefined}
              clientFUA={dClientFUA ?? 0}
              adviceComplexity={state.adviceComplexity}
              defaultOpen={true}
            />
          ) : (
            <div className="bg-white rounded-card border border-light-border px-5 py-8 text-center">
              <p className="text-sm text-mid">Enter a fee above to see where it sits in the market.</p>
            </div>
          )}

          <CrossLinkCTAs onNavigate={onNavigate} />
        </main>

        <FooterBar
          currentPage="feecompare"
          onNavigate={p => {
            if (p === 'home') onGoHome();
            else onNavigate(p);
          }}
        />
      </div>
    </>
  );
}
