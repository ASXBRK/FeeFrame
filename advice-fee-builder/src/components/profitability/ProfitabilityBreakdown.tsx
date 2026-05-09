interface Props {
  revenue: number;
  cost: number;
  margin: number;
  marginPct: number;
  fee: number;
  commission: number;
}

function fmt(v: number): string {
  const abs = Math.abs(Math.round(v));
  return (v < 0 ? '-$' : '$') + abs.toLocaleString('en-AU');
}

function fmtPct(v: number): string {
  return (v >= 0 ? '' : '-') + Math.abs(v).toFixed(1) + '%';
}

export default function ProfitabilityBreakdown({ revenue, cost, margin, marginPct, fee, commission }: Props) {
  const isNegative = margin < 0;
  const marginBarWidth = Math.min(100, Math.max(0, Math.abs(marginPct)));

  return (
    <div className="space-y-4">
      {/* Revenue / Cost columns */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-light-surface rounded-input border border-light-border p-3 space-y-2">
          <p className="text-xs font-semibold font-heading text-mid uppercase tracking-wide">Revenue</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-mid">Annual fee</span>
              <span className="font-medium text-dark">${Math.round(fee).toLocaleString('en-AU')}</span>
            </div>
            {commission > 0 && (
              <div className="flex justify-between">
                <span className="text-mid">Commission</span>
                <span className="font-medium text-dark">${Math.round(commission).toLocaleString('en-AU')}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-light-border pt-1 mt-1">
              <span className="font-semibold text-dark">Total</span>
              <span className="font-bold text-dark">${Math.round(revenue).toLocaleString('en-AU')}</span>
            </div>
          </div>
        </div>

        <div className="bg-light-surface rounded-input border border-light-border p-3 space-y-2">
          <p className="text-xs font-semibold font-heading text-mid uppercase tracking-wide">Cost to serve</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-mid">Adviser time + overhead</span>
              <span className="font-medium text-dark">${Math.round(cost).toLocaleString('en-AU')}</span>
            </div>
            <div className="flex justify-between border-t border-light-border pt-1 mt-1">
              <span className="font-semibold text-dark">Total</span>
              <span className="font-bold text-dark">${Math.round(cost).toLocaleString('en-AU')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Margin block */}
      <div className={`rounded-input border px-4 py-3 ${isNegative ? 'bg-amber-50 border-amber-200' : 'bg-teal/5 border-teal/20'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-dark">Margin</span>
          <div className="text-right">
            <span className={`text-lg font-bold ${isNegative ? 'text-amber-800' : 'text-teal'}`}>
              {fmt(margin)}
            </span>
            <span className={`text-sm font-medium ml-2 ${isNegative ? 'text-amber-700' : 'text-mid'}`}>
              {fmtPct(marginPct)}
            </span>
          </div>
        </div>

        {/* Margin bar */}
        <div className="h-2 bg-white border border-light-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isNegative ? 'bg-amber-400' : 'bg-teal'}`}
            style={{ width: `${marginBarWidth}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-mid">0%</span>
          <span className="text-xs text-mid">50%</span>
          <span className="text-xs text-mid">100%</span>
        </div>

        {isNegative && (
          <p className="text-xs text-amber-800 mt-2 font-medium">
            This client's fee does not cover the cost to serve at your practice rates.
          </p>
        )}
      </div>

      <p className="text-xs text-mid">
        v1.2 note: cost model covers adviser time and practice overhead only — paraplanner and admin time not included.
      </p>
    </div>
  );
}
