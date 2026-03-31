import { formatCurrency, formatHours } from '../lib/formatters';

export default function ImpliedRateGauge({ rate, totalHours, fee, status }) {
  const colors = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-500',
      text: 'text-green-700',
      label: 'Healthy',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-400',
      text: 'text-amber-700',
      label: 'Borderline',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-500',
      text: 'text-red-700',
      label: 'Below cost',
    },
  };

  const c = colors[status] || colors.green;

  return (
    <div className={`rounded-xl border p-5 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${c.badge} rounded-xl p-3 shadow-sm`}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-bold font-heading text-slate-900">
              {formatCurrency(rate, 0)}
            </span>
            <span className="text-sm text-slate-500">/hr implied rate</span>
            <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge} text-white`}>
              {c.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Based on {formatCurrency(fee, 0)} fee ÷ {formatHours(totalHours)} total adviser time
          </p>
        </div>
      </div>

      {status === 'red' && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-white/70 rounded-lg border border-red-100">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-red-700">
            This implied rate is below typical cost recovery thresholds. Consider reviewing your fee or reducing the scope of advice.
          </p>
        </div>
      )}

      {status === 'amber' && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-white/70 rounded-lg border border-amber-100">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-amber-700">
            Borderline rate. This may work if your overhead structure is lean, but check your cost recovery breakdown.
          </p>
        </div>
      )}
    </div>
  );
}
