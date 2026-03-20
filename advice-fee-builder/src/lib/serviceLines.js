// ── Strategies — core advice areas ────────────────────────────────────────────
export const STRATEGIES = [
  { id: 'super', label: 'Superannuation', shortLabel: 'superannuation', adviserHours: 1.5, paraplannerHours: 2.0, adminHours: 0.5 },
  { id: 'retirementPlanning', label: 'Retirement Planning', shortLabel: 'retirement planning', adviserHours: 2.0, paraplannerHours: 3.0, adminHours: 0.5 },
  { id: 'cashFlowPlanning', label: 'Cash Flow Planning', shortLabel: 'cash flow planning', adviserHours: 1.5, paraplannerHours: 1.5, adminHours: 0.5 },
  { id: 'capitalExpenditure', label: 'Capital Expenditure', shortLabel: 'capital expenditure planning', adviserHours: 1.0, paraplannerHours: 1.5, adminHours: 0.5 },
  { id: 'modellingProjections', label: 'Modelling & Projections', shortLabel: 'financial modelling and projections', adviserHours: 1.0, paraplannerHours: 2.5, adminHours: 0 },
  { id: 'debtManagement', label: 'Debt Management', shortLabel: 'debt management', adviserHours: 1.0, paraplannerHours: 1.0, adminHours: 0.5 },
  { id: 'gearingDebtRecycling', label: 'Gearing / Debt Recycling', shortLabel: 'gearing and debt recycling', adviserHours: 1.5, paraplannerHours: 2.0, adminHours: 0.5 },
  { id: 'centrelink', label: 'Centrelink Entitlements', shortLabel: 'Centrelink entitlements', adviserHours: 1.5, paraplannerHours: 2.0, adminHours: 1.0 },
  { id: 'personalInsurance', label: 'Personal Insurance', shortLabel: 'personal insurance', adviserHours: 2.0, paraplannerHours: 2.5, adminHours: 1.0 },
  { id: 'businessInsurance', label: 'Business Insurance', shortLabel: 'business insurance', adviserHours: 2.0, paraplannerHours: 2.5, adminHours: 1.0 },
  { id: 'estatePlanning', label: 'Estate Planning', shortLabel: 'estate planning', adviserHours: 1.5, paraplannerHours: 1.0, adminHours: 0.5 },
  { id: 'investing', label: 'Investing', shortLabel: 'investment portfolio', adviserHours: 1.5, paraplannerHours: 2.5, adminHours: 0.5 },
];

// ── Add-ons ────────────────────────────────────────────────────────────────────
export const ADD_ONS = [
  { id: 'div296', label: 'Division 296 Tax', shortLabel: 'Division 296 tax planning', adviserHours: 1.0, paraplannerHours: 2.0, adminHours: 0.5 },
  { id: 'marginLending', label: 'Margin Lending', shortLabel: 'margin lending', adviserHours: 1.0, paraplannerHours: 2.0, adminHours: 0.5 },
  { id: 'smsfInvestmentStrategy', label: 'SMSF Investment Strategy', shortLabel: 'SMSF investment strategy', adviserHours: 1.5, paraplannerHours: 2.0, adminHours: 0.5 },
];

// ── Core process tasks ─────────────────────────────────────────────────────────
export const CORE_TASKS = [
  { id: 'discovery', label: 'Discovery / Initial Meeting', shortLabel: 'initial consultation', adviserHours: 2.0, paraplannerHours: 0.5, adminHours: 0.5, defaultOn: true },
  { id: 'engagementLetter', label: 'Engagement Letter', shortLabel: 'engagement letter', adviserHours: 0.5, paraplannerHours: 0.5, adminHours: 0.5, defaultOn: true },
  { id: 'dataCollection', label: 'Data Collection', shortLabel: 'data collection', adviserHours: 0.5, paraplannerHours: 0.5, adminHours: 1.0, defaultOn: true, perEntity: true },
  { id: 'scenarioModelling', label: 'Scenario Modelling', shortLabel: 'scenario modelling', adviserHours: 0.5, paraplannerHours: 1.5, adminHours: 0, defaultOn: true, perAdditionalScenario: true },
];

// ── Per-review-meeting tasks (used in Step 3 ongoing) ─────────────────────────
export const REVIEW_TASKS = [
  { id: 'prepareReport', label: 'Prepare report / presentation', adviserHours: 0.5, paraplannerHours: 1.5, adminHours: 0.5 },
  { id: 'adminCor', label: 'Admin — correspondence', adviserHours: 0, paraplannerHours: 0, adminHours: 0.5 },
  { id: 'conductMeeting', label: 'Conduct review meeting', adviserHours: 1.0, paraplannerHours: 0, adminHours: 0 },
  { id: 'fileNote', label: 'File note', adviserHours: 0.5, paraplannerHours: 0, adminHours: 0 },
  { id: 'adviceAdjustments', label: 'Advice adjustments', adviserHours: 0.5, paraplannerHours: 1.0, adminHours: 0 },
  { id: 'implementation', label: 'Implementation', adviserHours: 0, paraplannerHours: 0.5, adminHours: 0.5 },
  { id: 'compliancePaperwork', label: 'Compliance paperwork', adviserHours: 0, paraplannerHours: 0.5, adminHours: 0.5 },
];

// ── Annual tasks (fixed per year regardless of meeting count) ──────────────────
export const ANNUAL_TASKS = [
  { id: 'ongoingMonitoring', label: 'Ongoing monitoring', adviserHours: 1.0, paraplannerHours: 2.0, adminHours: 0 },
  { id: 'adHocQueries', label: 'Ad-hoc client queries', adviserHours: 1.0, paraplannerHours: 0, adminHours: 0.5 },
  { id: 'accountAdmin', label: 'Account administration', adviserHours: 0, paraplannerHours: 0, adminHours: 1.0 },
];

// ── Premium factors (replaces COMPLEXITY_FACTORS) ─────────────────────────────
export const PREMIUM_FACTORS = [
  { label: 'Conflicting goals', description: 'When partners or family members disagree on financial goals, significant adviser time is spent mediating, reconciling priorities, and finding common ground before advice can progress.' },
  { label: 'Detail-oriented client', description: 'Financially sophisticated clients who demand detailed justifications, multiple options, and extensive reporting require considerably more preparation and communication.' },
  { label: 'Slow to respond', description: 'Clients who are slow to provide documents or return calls extend the engagement timeline, requiring repeated follow-ups and rework as circumstances change.' },
  { label: 'Family complexity', description: 'Divorce, blended families, or inheritance disputes add legal complexity, emotional sensitivity, and often require coordination with multiple external parties.' },
  { label: 'Legacy mess', description: 'Unwinding previous poor advice — incorrect structures, unsuitable products, or missing documentation — adds significant remediation work before new advice can begin.' },
  { label: 'Health considerations', description: 'Serious health conditions may require urgent timelines, liaison with medical professionals, and careful consideration of insurance and estate planning implications.' },
  { label: 'Expectation reset needed', description: 'Clients expecting returns or outcomes that are not achievable require careful education and multiple conversations to reset expectations before advice can proceed.' },
  { label: 'Business intertwined', description: 'Intertwined business and personal finances — multiple entities, related-party transactions, or business succession — add layers of analysis and compliance requirements.' },
  { label: 'New to advice', description: 'Clients who have never received financial advice require more education, hand-holding, and explanation of the process, which adds to the initial engagement time.' },
  { label: 'Over-structured', description: 'More structures than necessary — multiple trusts, companies, SMSFs — each require separate analysis, documentation, and compliance consideration.' },
  { label: 'Hands-on client', description: 'Clients who want involvement in every detail, frequent updates, and extensive meeting time consume significantly more adviser capacity than standard engagements.' },
];

// ── Discount factors (replaces EASE_FACTORS) ──────────────────────────────────
export const DISCOUNT_FACTORS = [
  { label: 'Existing relationship', description: 'Familiarity with the client circumstances, existing data on file, and an established relationship reduce discovery and onboarding time significantly.' },
  { label: 'Referral', description: 'Referred clients — whether from existing clients, professional networks, staff, or friends and family — typically arrive with higher trust and clearer expectations, reducing rapport-building time.' },
  { label: 'Delegator', description: 'Clients who trust the adviser judgement require fewer options, shorter meetings, and less back-and-forth before accepting recommendations.' },
  { label: 'Responsive client', description: 'Clients who listen, respond promptly, provide documents on time, and follow through on actions reduce the overall engagement effort.' },
  { label: 'Motivated', description: 'Motivated clients who actively participate in the planning process, do their homework, and stay focused make the advice process more efficient.' },
  { label: 'Simple structure', description: 'Single entity, straightforward financial position, limited products — the absence of complexity is itself a reason the engagement costs less to deliver.' },
  { label: 'Tech-savvy client', description: 'Clients comfortable with digital tools, portals, and electronic signatures reduce admin overhead and speed up data collection and implementation.' },
  { label: 'Well-organised records', description: 'Clients who arrive with complete, accurate, and well-organised financial records significantly reduce data collection and verification time.' },
];

// ── Banding functions ──────────────────────────────────────────────────────────
export function getPremiumRate(count) {
  if (count === 0) return 0;
  if (count <= 2) return 0.05;
  if (count <= 4) return 0.10;
  if (count <= 6) return 0.15;
  if (count <= 8) return 0.20;
  return 0.25;
}

export function getDiscountRate(count) {
  if (count === 0) return 0;
  if (count <= 2) return 0.05;
  if (count <= 4) return 0.10;
  return 0.15;
}

// Backward-compat aliases
export const getComplexityPremiumRate = getPremiumRate;
export const getEaseDiscountRate = getDiscountRate;
export const COMPLEXITY_FACTORS = PREMIUM_FACTORS.map(f => f.label);
export const EASE_FACTORS = DISCOUNT_FACTORS.map(f => f.label);
// Stub so old imports don't crash
export const SERVICE_LINES = [];

export function formatStrategyList(strategies, enabledStrategies) {
  const labels = strategies
    .filter(s => enabledStrategies[s.id])
    .map(s => s.shortLabel);
  if (labels.length === 0) return 'your financial strategies';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}
