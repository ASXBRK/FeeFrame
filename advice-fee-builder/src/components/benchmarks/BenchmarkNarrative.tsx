import type { AnchorSet } from '../../lib/benchmarks/types';

const FUA_BAND_LABELS: Record<string, string> = {
  under_250k:  'under $250K FUA',
  '250k_to_1m': '$250K–$1M FUA',
  '1m_to_3m':  '$1M–$3M FUA',
  above_3m:    'above $3M FUA',
};

function fmt(v: number): string {
  if (v >= 100_000) return '$' + Math.round(v / 1_000) + 'K';
  if (v >= 10_000)  return '$' + (v / 1_000).toFixed(0) + 'K';
  return '$' + Math.round(v).toLocaleString('en-AU');
}

interface Props {
  anchors: AnchorSet;
  userFee: number;
  costJustifiedFee: number | null;
}

export default function BenchmarkNarrative({ anchors, userFee, costJustifiedFee }: Props) {
  const { median, topTwentyPct, floor, fuaBand, xAxisMin } = anchors;
  const bandLabel = FUA_BAND_LABELS[fuaBand] ?? fuaBand;

  let positionLine = '';

  const pctVsMedian = median > 0 ? ((userFee - median) / median) * 100 : 0;

  if (userFee < xAxisMin) {
    positionLine = `Your fee of ${fmt(userFee)} falls below the typical market range for ${bandLabel} clients.`;
  } else if (userFee < floor) {
    positionLine = `Your fee of ${fmt(userFee)} is in the bottom of the market range for ${bandLabel} clients.`;
  } else if (Math.abs(pctVsMedian) < 5) {
    positionLine = `Your fee of ${fmt(userFee)} is at the market median for ${bandLabel} clients.`;
  } else if (userFee >= topTwentyPct) {
    positionLine = `Your fee of ${fmt(userFee)} sits in the top 20% for this FUA band.`;
  } else if (pctVsMedian > 0) {
    positionLine = `Your fee of ${fmt(userFee)} is ${Math.round(pctVsMedian)}% above the market median (${fmt(median)}) for ${bandLabel} clients.`;
  } else {
    positionLine = `Your fee of ${fmt(userFee)} is ${Math.round(Math.abs(pctVsMedian))}% below the market median for ${bandLabel} clients.`;
  }

  let cjLine = '';
  if (costJustifiedFee !== null && costJustifiedFee > 0) {
    const delta = userFee - costJustifiedFee;
    const absDelta = Math.abs(delta);
    if (delta >= 0) {
      cjLine = `Your cost-justified fee is ${fmt(costJustifiedFee)} — fee is ${fmt(absDelta)} above this.`;
    } else {
      cjLine = `Your cost-justified fee is ${fmt(costJustifiedFee)} — fee is ${fmt(absDelta)} short of target margin.`;
    }
  }

  return (
    <p className="text-sm text-dark mt-3">
      {positionLine}
      {cjLine && (
        <>
          {' '}
          <span className="text-mid">{cjLine}</span>
        </>
      )}
    </p>
  );
}
