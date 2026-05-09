export type FuaBand = 'under_250k' | '250k_to_1m' | '1m_to_3m' | 'above_3m';

export type BenchmarkFeeStructure = 'fixed' | 'percentage' | 'subscription';

export type AdviceComplexity = 'simple' | 'comprehensive';

export interface AnchorSet {
  floor: number;
  median: number;
  topTwentyPct: number;
  ceiling: number;
  xAxisMin: number;
  xAxisMax: number;
  fuaBand: FuaBand;
  dataAvailable: boolean;
  gapReason?: string;
}

export interface BenchmarkInput {
  fee: number;
  feeStructure: BenchmarkFeeStructure;
  feePercent?: number;
  clientFUA: number;
  adviceComplexity?: AdviceComplexity;
}
