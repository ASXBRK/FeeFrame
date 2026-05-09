export type FeeCompareStructure = 'fixed' | 'percentage' | 'subscription';
export type AdviceComplexity = 'simple' | 'comprehensive';

export interface FeeCompareState {
  fee: number | null;
  feeStructure: FeeCompareStructure;
  feePercent: number | null;
  feeMonthly: number | null;
  clientFUA: number | null;
  adviceComplexity: AdviceComplexity;
}
