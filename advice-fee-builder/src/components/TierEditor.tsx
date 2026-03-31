import { formatCurrency } from '../lib/formatters';

export default function TierEditor({ tiers, onChange }) {
  const addTier = () => {
    const last = tiers[tiers.length - 1];
    const newFrom = last?.to ?? 0;
    onChange([
      ...tiers.map((t, i) => i === tiers.length - 1 ? { ...t, to: newFrom } : t),
      { from: newFrom, to: null, rate: 0.5 },
    ]);
  };

  const removeTier = (index) => {
    if (tiers.length <= 1) return;
    const next = tiers.filter((_, i) => i !== index);
    // Fix the last tier's "to" so it's null (unlimited)
    next[next.length - 1] = { ...next[next.length - 1], to: null };
    onChange(next);
  };

  const updateTier = (index, field, value) => {
    const next = tiers.map((t, i) => {
      if (i !== index) return t;
      const parsed = field === 'rate' ? parseFloat(value) : parseFloat(value);
      return { ...t, [field]: isNaN(parsed) ? value : parsed };
    });

    // Cascade: when "to" changes, update next tier's "from"
    if (field === 'to' && index < next.length - 1) {
      const toVal = parseFloat(value);
      if (!isNaN(toVal)) {
        next[index + 1] = { ...next[index + 1], from: toVal };
      }
    }

    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-400 px-1">
        <div className="col-span-4">From ($)</div>
        <div className="col-span-4">To ($)</div>
        <div className="col-span-3">Rate (%)</div>
        <div className="col-span-1" />
      </div>

      {tiers.map((tier, index) => {
        const isLast = index === tiers.length - 1;
        return (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-4">
              <input
                type="number"
                value={tier.from}
                readOnly={index === 0}
                onChange={(e) => updateTier(index, 'from', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                  index === 0
                    ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-slate-200'
                }`}
                min={0}
              />
            </div>
            <div className="col-span-4">
              {isLast ? (
                <div className="px-3 py-2 text-sm text-slate-400 bg-slate-50 border border-slate-100 rounded-lg">
                  Unlimited
                </div>
              ) : (
                <input
                  type="number"
                  value={tier.to ?? ''}
                  onChange={(e) => updateTier(index, 'to', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  min={tier.from}
                />
              )}
            </div>
            <div className="col-span-3">
              <div className="relative">
                <input
                  type="number"
                  value={tier.rate}
                  onChange={(e) => updateTier(index, 'rate', e.target.value)}
                  step={0.05}
                  min={0}
                  max={10}
                  className="w-full px-3 py-2 pr-7 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
              </div>
            </div>
            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => removeTier(index)}
                disabled={tiers.length <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-md text-slate-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                title="Remove tier"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview */}
            <div className="col-span-12 -mt-1 ml-1 text-xs text-slate-400">
              {formatCurrency(tier.from)} – {isLast ? '∞' : formatCurrency(tier.to ?? 0)} @ {tier.rate}%
            </div>
          </div>
        );
      })}

      <button
        onClick={addTier}
        className="mt-2 flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add tier
      </button>
    </div>
  );
}
