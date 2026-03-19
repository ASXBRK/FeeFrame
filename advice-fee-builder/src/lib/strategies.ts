export const STRATEGIES = [
  {
    key: 'super',
    label: 'Superannuation',
    description: 'Super consolidation, contributions, strategy',
    defaultHours: 3,
    shortLabel: 'superannuation',
  },
  {
    key: 'smsf',
    label: 'SMSF',
    description: 'Self-managed super fund setup or review',
    defaultHours: 6,
    shortLabel: 'SMSF',
  },
  {
    key: 'investment',
    label: 'Investment Portfolio',
    description: 'Managed funds, shares, ETF portfolio',
    defaultHours: 4,
    shortLabel: 'investment portfolio',
  },
  {
    key: 'insurance',
    label: 'Personal Insurance',
    description: 'Life, TPD, income protection review',
    defaultHours: 3,
    shortLabel: 'personal insurance',
  },
  {
    key: 'estate',
    label: 'Estate Planning',
    description: 'Wills, beneficiaries, power of attorney',
    defaultHours: 2,
    shortLabel: 'estate planning',
  },
  {
    key: 'debt',
    label: 'Debt Management',
    description: 'Mortgage, loans, debt recycling',
    defaultHours: 1.5,
    shortLabel: 'debt management',
  },
  {
    key: 'centrelink',
    label: 'Centrelink / Age Pension',
    description: 'Pension entitlements, means testing',
    defaultHours: 3,
    shortLabel: 'Centrelink and Age Pension',
  },
  {
    key: 'div296',
    label: 'Division 296',
    description: 'High-balance super tax planning',
    defaultHours: 2,
    shortLabel: 'Division 296 tax planning',
  },
];

export function getEnabledStrategies(strategies) {
  return STRATEGIES.filter(s => strategies[s.key]?.enabled);
}

export function formatStrategyList(enabledStrategies) {
  if (enabledStrategies.length === 0) return 'your financial strategies';
  if (enabledStrategies.length === 1) return enabledStrategies[0].shortLabel;
  const labels = enabledStrategies.map(s => s.shortLabel);
  const last = labels.pop();
  return labels.join(', ') + ' and ' + last;
}
