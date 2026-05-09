import type { FuaBand, AnchorSet, BenchmarkInput, AdviceComplexity } from './types';
import { BENCHMARKS } from './loader';

const X_AXIS_RANGES: Record<FuaBand, [number, number]> = {
  under_250k:  [0,      7_500],
  '250k_to_1m': [1_500, 12_000],
  '1m_to_3m':  [5_000, 35_000],
  above_3m:    [10_000, 100_000],
};

function getFuaBand(clientFUA: number): FuaBand {
  if (clientFUA < 250_000) return 'under_250k';
  if (clientFUA < 1_000_000) return '250k_to_1m';
  if (clientFUA < 3_000_000) return '1m_to_3m';
  return 'above_3m';
}

function noData(fuaBand: FuaBand, gapReason: string): AnchorSet {
  const [xAxisMin, xAxisMax] = X_AXIS_RANGES[fuaBand];
  return { floor: 0, median: 0, topTwentyPct: 0, ceiling: xAxisMax, xAxisMin, xAxisMax, fuaBand, dataAvailable: false, gapReason };
}

// For low-FUA bands (under_250k, 250k_to_1m): pick the absolute median for the complexity tier
// Only called from within deriveAnchors after null guard, so BENCHMARKS is non-null here.
function getOngoingMedian(complexity?: AdviceComplexity): number {
  if (complexity === 'simple')        return BENCHMARKS!.ongoing_fee.simple.median_ongoing_fee;
  if (complexity === 'comprehensive') return BENCHMARKS!.ongoing_fee.comprehensive.median_ongoing_fee;
  return BENCHMARKS!.ongoing_fee.typical.median_ongoing_fee;
}

// For high-FUA bands (1m_to_3m, above_3m): scale FUA-based median by complexity ratio against typical
function getComplexityMultiplier(complexity?: AdviceComplexity): number {
  if (!complexity) return 1;
  const typical = BENCHMARKS!.ongoing_fee.typical.median_ongoing_fee;
  if (complexity === 'simple')        return BENCHMARKS!.ongoing_fee.simple.median_ongoing_fee / typical;
  if (complexity === 'comprehensive') return BENCHMARKS!.ongoing_fee.comprehensive.median_ongoing_fee / typical;
  return 1;
}

export function deriveAnchors(input: BenchmarkInput): AnchorSet {
  if (!BENCHMARKS) {
    return noData('250k_to_1m', 'benchmark data unavailable');
  }

  const { fee, feeStructure, feePercent, clientFUA, adviceComplexity } = input;

  // Subscription below $1,500/yr — only digital-scale data exists, not useful for full-service
  if (feeStructure === 'subscription' && fee < 1_500) {
    return noData('under_250k', 'subscription pricing models');
  }

  // Percentage fee with no FUA — can't compute dollar equivalent
  if (feeStructure === 'percentage' && (!feePercent || clientFUA <= 0)) {
    return noData('250k_to_1m', 'enter client FUA to see a dollar-equivalent comparison');
  }

  const fuaBand = clientFUA > 0 ? getFuaBand(clientFUA) : '250k_to_1m';
  const [xAxisMin, xAxisMax] = X_AXIS_RANGES[fuaBand];

  let floor: number;
  let median: number;
  let topTwentyPct: number;

  if (fuaBand === 'under_250k' || fuaBand === '250k_to_1m') {
    // Low-FUA bands: ongoing_fee data has highest confidence; complexity picks the segmented median.
    // Floor + top-20% threshold stay constant per spec.
    floor = 1_500;
    median = getOngoingMedian(adviceComplexity);
    topTwentyPct = BENCHMARKS.ongoing_fee.top_20pct_highly_profitable.value; // 7,700
  } else if (fuaBand === '1m_to_3m') {
    const bd = BENCHMARKS.fua_based_fee['1m_to_3m'];
    floor = Math.round(clientFUA * (bd.range[0] / 100));
    median = Math.round(clientFUA * (bd.value_pct / 100) * getComplexityMultiplier(adviceComplexity));
    topTwentyPct = Math.round(clientFUA * (bd.range[1] / 100));
  } else {
    const bd = BENCHMARKS.fua_based_fee['above_3m'];
    floor = Math.round(clientFUA * (bd.range[0] / 100));
    median = Math.round(clientFUA * (bd.value_pct / 100) * getComplexityMultiplier(adviceComplexity));
    topTwentyPct = Math.round(clientFUA * (bd.range[1] / 100));
  }

  return {
    floor,
    median,
    topTwentyPct,
    ceiling: xAxisMax,
    xAxisMin,
    xAxisMax,
    fuaBand,
    dataAvailable: true,
  };
}
