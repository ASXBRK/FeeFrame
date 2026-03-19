export default function TierEditor({ tiers, dispatch }) {
  const setTier = (index, field, value) => dispatch({ type: 'SET_TIER', index, field, value });

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Tier</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">From ($)</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">To ($)</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-gray-500">Rate (%)</th>
              <th className="py-2 px-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tiers.map((tier, i) => (
              <tr key={i}>
                <td className="py-2 px-2 text-gray-500">{i + 1}</td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    min={0}
                    value={tier.from}
                    onChange={e => setTier(i, 'from', parseFloat(e.target.value) || 0)}
                    className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </td>
                <td className="py-2 px-2">
                  {tier.to === null ? (
                    <span className="text-gray-400 text-sm block text-right pr-2">Unlimited</span>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      value={tier.to}
                      onChange={e => setTier(i, 'to', parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  )}
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    max={100}
                    value={tier.rate}
                    onChange={e => setTier(i, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </td>
                <td className="py-2 px-2">
                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'REMOVE_TIER', index: i })}
                      className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
                      title="Remove tier"
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
        className="mt-3 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
      >
        + Add tier
      </button>
    </div>
  );
}
