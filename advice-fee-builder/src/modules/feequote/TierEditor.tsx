import NumInput from '../../components/shared/NumInput';

export default function TierEditor({ tiers, dispatch }) {
  const setTier = (index, field, value) => dispatch({ type: 'SET_TIER', index, field, value });

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-light-border">
              <th className="text-left py-2 px-2 text-xs font-medium text-mid">Tier</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-mid">From ($)</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-mid">To ($)</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-mid">Rate (%)</th>
              <th className="py-2 px-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border">
            {tiers.map((tier, i) => (
              <tr key={i}>
                <td className="py-2 px-2 text-mid">{i + 1}</td>
                <td className="py-2 px-2">
                  <NumInput
                    value={tier.from}
                    onChange={v => setTier(i, 'from', v)}
                    min={0}
                    max={50000000}
                    className="w-full rounded-input border border-light-border px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                  />
                </td>
                <td className="py-2 px-2">
                  {tier.to === null ? (
                    <span className="text-mid text-sm block text-right pr-2">Unlimited</span>
                  ) : (
                    <NumInput
                      value={tier.to}
                      onChange={v => setTier(i, 'to', v)}
                      min={0}
                      max={50000000}
                      className="w-full rounded-input border border-light-border px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                    />
                  )}
                </td>
                <td className="py-2 px-2">
                  <NumInput
                    value={tier.rate}
                    onChange={v => setTier(i, 'rate', v)}
                    min={0}
                    max={5}
                    className="w-full rounded-input border border-light-border px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                  />
                </td>
                <td className="py-2 px-2">
                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'REMOVE_TIER', index: i })}
                      className="text-light-border hover:text-risk transition-colors text-base leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1"
                      title="Remove tier"
                      aria-label="Remove tier"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: 'ADD_TIER' })}
        className="mt-3 text-xs font-medium text-teal hover:opacity-80 transition-opacity"
      >
        + Add tier
      </button>
    </div>
  );
}
