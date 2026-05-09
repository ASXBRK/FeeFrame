interface Props {
  gapReason: string;
  costJustifiedFee: number | null;
}

const GAP_COPY: Record<string, string> = {
  'subscription pricing models':
    'The Australian financial advice industry does not publish granular fee data for subscription pricing models. We\'re keeping an eye out and will surface comparisons when reliable data becomes available.',
  'enter client FUA to see a dollar-equivalent comparison':
    'Enter your client\'s FUA in the field above to see a dollar-equivalent benchmark for percentage-based fees.',
};

function fmt(v: number): string {
  if (v >= 100_000) return '$' + Math.round(v / 1_000) + 'K';
  if (v >= 10_000)  return '$' + (v / 1_000).toFixed(0) + 'K';
  return '$' + Math.round(v).toLocaleString('en-AU');
}

export default function NoDataPanel({ gapReason, costJustifiedFee }: Props) {
  const copy = GAP_COPY[gapReason] ?? `No benchmark data is available for this segment (${gapReason}).`;

  return (
    <div className="space-y-3">
      <div className="bg-light-surface border border-light-border rounded-input px-4 py-3">
        <p className="text-sm font-medium text-dark mb-1">No benchmark data available for this segment.</p>
        <p className="text-sm text-mid">{copy}</p>
      </div>

      {costJustifiedFee !== null && costJustifiedFee > 0 && (
        <div className="bg-teal/5 border border-teal/20 rounded-input px-4 py-3 text-sm text-dark">
          <span className="font-medium">Cost-justified fee for your practice: {fmt(costJustifiedFee)}</span>
          <span className="text-mid"> — derived from your practice profile, independent of market benchmark data.</span>
        </div>
      )}
    </div>
  );
}
