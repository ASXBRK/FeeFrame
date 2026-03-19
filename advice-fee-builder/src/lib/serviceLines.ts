// Initial SOA service lines
export const SERVICE_LINES = [
  {
    id: 'discovery',
    label: 'Discovery / Initial Meeting',
    description: 'Recovered in SOA fee if prospect proceeds',
    baseHours: 2.5,
    inputType: 'toggle',
    defaultEnabled: true,
  },
  {
    id: 'engagementLetter',
    label: 'Terms of Engagement Letter',
    description: 'Standard engagement process',
    baseHours: 1,
    inputType: 'toggle',
    defaultEnabled: true,
  },
  {
    id: 'dataCollection',
    label: 'Data Collection & Onboarding',
    description: 'Billed per entity in family group (from Step 1)',
    baseHours: 1, // per entity
    inputType: 'auto-entity',
    defaultEnabled: true,
  },
  {
    id: 'strategyDevelopment',
    label: 'Development of Financial Strategies',
    description: 'Based on number of strategy checkboxes enabled below',
    baseHours: 2, // per strategy
    inputType: 'auto-strategy',
    defaultEnabled: true,
  },
  {
    id: 'financialModelling',
    label: 'Financial Modelling / Scenario Analysis',
    description: 'First scenario included free; charged per additional scenario',
    baseHours: 1.5, // per scenario above 1
    inputType: 'number',
    defaultValue: 2,
  },
  {
    id: 'gearing',
    label: 'Gearing or Margin Lending',
    description: 'In scope or not',
    baseHours: 3,
    inputType: 'toggle',
    defaultEnabled: false,
  },
  {
    id: 'investmentResearch',
    label: 'Investment Product Research & Risk Profiling',
    description: 'Investment or super product advice',
    baseHours: 2.5,
    inputType: 'toggle',
    defaultEnabled: true,
  },
  {
    id: 'smsfAdvice',
    label: 'SMSF Advice — Investment Strategy',
    description: 'SMSF in scope',
    baseHours: 2.5,
    inputType: 'toggle',
    defaultEnabled: false,
  },
  {
    id: 'insurance',
    label: 'Insurance / Risk Management Review',
    description: 'Life insurance in scope',
    baseHours: 6.5,
    inputType: 'toggle',
    defaultEnabled: false,
  },
  {
    id: 'estatePlanning',
    label: 'Estate Planning',
    description: 'Estate planning in scope',
    baseHours: 2,
    inputType: 'toggle',
    defaultEnabled: false,
  },
  {
    id: 'centrelink',
    label: 'Centrelink / Aged Care',
    description: 'Centrelink or aged care in scope',
    baseHours: 3,
    inputType: 'toggle',
    defaultEnabled: false,
  },
  {
    id: 'debtManagement',
    label: 'Debt Management',
    description: 'Debt structuring in scope',
    baseHours: 1.5,
    inputType: 'toggle',
    defaultEnabled: false,
  },
  {
    id: 'div296',
    label: 'Division 296 Tax',
    description: 'Div 296 in scope',
    baseHours: 2,
    inputType: 'toggle',
    defaultEnabled: false,
  },
];

// Strategy checkboxes — each has an optional linked service line it auto-toggles
export const STRATEGIES = [
  { id: 'superContributions', label: 'Super contributions / consolidation', linkedServiceLine: null, shortLabel: 'super contributions' },
  { id: 'smsf', label: 'SMSF', linkedServiceLine: 'smsfAdvice', shortLabel: 'SMSF' },
  { id: 'investmentPortfolio', label: 'Investment portfolio', linkedServiceLine: 'investmentResearch', shortLabel: 'investment portfolio' },
  { id: 'insuranceRisk', label: 'Insurance / risk management', linkedServiceLine: 'insurance', shortLabel: 'insurance and risk management' },
  { id: 'estatePlanning', label: 'Estate planning', linkedServiceLine: 'estatePlanning', shortLabel: 'estate planning' },
  { id: 'debtManagement', label: 'Debt management', linkedServiceLine: 'debtManagement', shortLabel: 'debt management' },
  { id: 'centrelink', label: 'Centrelink / aged care', linkedServiceLine: 'centrelink', shortLabel: 'Centrelink and aged care' },
  { id: 'div296', label: 'Division 296', linkedServiceLine: 'div296', shortLabel: 'Division 296 tax planning' },
  { id: 'gearing', label: 'Gearing / margin lending', linkedServiceLine: 'gearing', shortLabel: 'gearing and margin lending' },
];

// Complexity premium factors
export const COMPLEXITY_FACTORS = [
  'Couple disagree on financial objectives',
  'Financially sophisticated — high knowledge, high expectations',
  'Financially complex — too many entities or accounts with no clear reason',
  'Planning has not been collaborative in the past (couples)',
  'Uncomfortable or burdened by money decisions',
  'Distrust of the advice industry',
  'Family breakdown — divorce, blended family, inheritance disputes',
  'Has never taken financial advice before',
  'Historically poorly advised or poorly structured',
  'Language or communication barriers',
  'Significant health issues impacting planning',
  'Unrealistic financial expectations',
  'Seeks involvement in every detail — high-touch, demanding',
  'Significant business complexity affecting personal finances',
];

// Ease of dealing discount factors
export const EASE_FACTORS = [
  'Existing client of the firm (adjacent service)',
  'Referral from existing client',
  'High degree of trust — delegator, time poor',
  'Easy to work with — listens and implements advice',
  'Engaged and driven to achieve financial goals',
  'Strong advocate of the firm',
  'Corporate or professional group arrangement',
];

export function getComplexityPremiumRate(count) {
  if (count === 0) return 0;
  if (count <= 2) return 0.05;
  if (count <= 4) return 0.10;
  if (count <= 6) return 0.15;
  if (count <= 8) return 0.20;
  return 0.25;
}

export function getEaseDiscountRate(count) {
  if (count === 0) return 0;
  if (count <= 2) return 0.05;
  if (count <= 4) return 0.10;
  return 0.15;
}

export function formatStrategyList(strategies, enabledStrategies) {
  const labels = STRATEGIES
    .filter(s => enabledStrategies[s.id])
    .map(s => s.shortLabel);
  if (labels.length === 0) return 'your financial strategies';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}
