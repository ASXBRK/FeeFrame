import { formatCurrency } from '../lib/formatters';

export default function FeeComparisonBar({ costRecovery, modelFee, label }) {
  if (!modelFee) return null;

  const max = Math.max(costRecovery, modelFee) * 1.1;
  const costPct = Math.min((costRecovery / max) * 100, 100);
  const feePct = Math.min((modelFee / max) * 100, 100);
  const gap = modelFee - costRecovery;
  const isAbove = gap >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{label}</h3>
      <p className="text-xs text-slate-400 mb-4">
        Visual comparison: cost recovery vs model-derived fee
      </p>

      <div className="space-y-3">
        {/* Cost recovery bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Cost recovery (minimum viable)</span>
            <span className="font-semibold text-slate-700">{formatCurrency(costRecovery)}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-400 rounded-full transition-all duration-500"
              style={{ width: `${costPct}%` }}
            />
          </div>
        </div>

        {/* Model fee bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Your model fee</span>
            <span className={`font-semibold ${isAbove ? 'text-teal-700' : 'text-red-600'}`}>
              {formatCurrency(modelFee)}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isAbove ? 'bg-teal-500' : 'bg-red-400'}`}
              style={{ width: `${feePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gap indicator */}
      <div className={`mt-4 flex items-center gap-2 text-xs font-medium p-2.5 rounded-lg ${
        isAbove ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'
      }`}>
        {isAbove ? (
          <>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Fee is {formatCurrency(Math.abs(gap))} above cost recovery — healthy margin
          </>
        ) : (
          <>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Fee is {formatCurrency(Math.abs(gap))} below cost recovery — consider revising
          </>
        )}
      </div>
    </div>
  );
}
