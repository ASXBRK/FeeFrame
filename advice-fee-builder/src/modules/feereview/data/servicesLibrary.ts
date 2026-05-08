export interface ServiceEntry {
  id: string;
  label: string;
}

export const DEFAULT_SERVICES: ReadonlyArray<ServiceEntry> = [
  { id: 'portfolioReview',       label: 'Annual portfolio review and rebalancing' },
  { id: 'performanceReview',     label: 'Investment performance review' },
  { id: 'insuranceReview',       label: 'Insurance policy review (life, TPD, income protection, trauma)' },
  { id: 'superStrategyReview',   label: 'Superannuation strategy review' },
  { id: 'superContributions',    label: 'Superannuation contribution strategy' },
  { id: 'pensionDrawdown',       label: 'Pension drawdown strategy' },
  { id: 'retirementModelling',   label: 'Retirement income modelling' },
  { id: 'centrelink',            label: 'Centrelink and Age Pension review' },
  { id: 'estatePlanning',        label: 'Estate planning review (wills, POA, beneficiary nominations)' },
  { id: 'taxPlanning',           label: 'Tax planning review (in conjunction with accountant)' },
  { id: 'cashflow',              label: 'Cash flow and budgeting review' },
  { id: 'debtManagement',        label: 'Debt management strategy' },
  { id: 'majorLifeEvent',        label: 'Major life event advice (inheritance, redundancy, divorce, business sale)' },
  { id: 'agedCare',              label: 'Aged care advice' },
  { id: 'adHoc',                 label: 'Ad-hoc strategic advice and ongoing access to adviser' },
] as const;
