import type { PracticeProfile } from '../practiceProfile/types';

export interface ClientProfile {
  hoursPerYear: number;
}

function isProfileComplete(p: PracticeProfile): boolean {
  return (
    p.adviserSalary > 0 &&
    p.adviserOnCostsPct >= 0 && p.adviserOnCostsPct < 1 &&
    p.billableHoursPerYear >= 500 &&
    p.targetMargin >= 0 && p.targetMargin < 1 &&
    p.totalOverheads >= 0
  );
}

/**
 * Derives a cost-justified annual fee for this client given the practice profile.
 *
 * Cost model: adviser labour + practice overhead, scaled by hours per year for this client.
 * True margin formula: fee = cost / (1 − targetMargin).
 *
 * v1.2 limitation: adviser-only cost model. Does not account for paraplanner or admin time.
 * Returns null when the practice profile is incomplete or hoursPerYear is zero.
 */
export function deriveCostJustifiedFee(
  practiceProfile: PracticeProfile,
  clientProfile: ClientProfile,
): number | null {
  if (!isProfileComplete(practiceProfile)) return null;
  if (clientProfile.hoursPerYear <= 0) return null;

  const { adviserSalary, adviserOnCostsPct, totalOverheads, billableHoursPerYear, targetMargin } = practiceProfile;

  const labourPerHour = (adviserSalary * (1 + adviserOnCostsPct)) / billableHoursPerYear;
  const overheadPerHour = totalOverheads / billableHoursPerYear;
  const costPerHour = labourPerHour + overheadPerHour;

  const annualClientCost = costPerHour * clientProfile.hoursPerYear;

  // True margin: fee = cost / (1 − margin), not cost × (1 + margin)
  return Math.round(annualClientCost / (1 - targetMargin));
}

export function computeProfitability(
  practiceProfile: PracticeProfile,
  fee: number,
  commission: number,
  hoursPerYear: number,
): { revenue: number; cost: number; margin: number; marginPct: number } | null {
  if (!isProfileComplete(practiceProfile)) return null;

  const { adviserSalary, adviserOnCostsPct, totalOverheads, billableHoursPerYear } = practiceProfile;

  const labourPerHour = (adviserSalary * (1 + adviserOnCostsPct)) / billableHoursPerYear;
  const overheadPerHour = totalOverheads / billableHoursPerYear;
  const costPerHour = labourPerHour + overheadPerHour;

  const revenue = fee + commission;
  const cost = Math.round(costPerHour * hoursPerYear);
  const margin = revenue - cost;
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;

  return { revenue, cost, margin, marginPct };
}
