import type { AdviceComplexity } from '../../lib/benchmarks/types';

export type { AdviceComplexity };
export type FeeCompareStructure = 'fixed' | 'percentage' | 'subscription';

export interface FeeCompareState {
  fee: number | null;
  feeStructure: FeeCompareStructure;
  feePercent: number | null;
  feeMonthly: number | null;
  clientFUA: number | null;
  adviceComplexity: AdviceComplexity;
}
