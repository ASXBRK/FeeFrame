export interface PracticeProfile {
  version: 1;
  practiceName?: string;
  totalOverheads: number;
  adviserSalary: number;
  adviserOnCostsPct: number;     // decimal fraction, e.g. 0.25 = 25%
  billableHoursPerYear: number;
  targetMargin: number;          // decimal fraction, e.g. 0.30 = 30%
  lastUpdated: string;           // ISO date string
}
