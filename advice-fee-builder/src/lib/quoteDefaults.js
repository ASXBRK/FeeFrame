import { SERVICE_LINES, STRATEGIES, COMPLEXITY_FACTORS, EASE_FACTORS } from './serviceLines.js';

// Build default service lines state
const defaultServiceLines = {};
SERVICE_LINES.forEach(line => {
  if (line.inputType === 'toggle') {
    defaultServiceLines[line.id] = line.defaultEnabled ?? false;
  } else if (line.inputType === 'number') {
    defaultServiceLines[line.id] = line.defaultValue ?? 0;
  }
  // auto types are derived from other state, no stored value needed
});

const defaultStrategies = {};
STRATEGIES.forEach(s => { defaultStrategies[s.id] = false; });

const defaultComplexityFactors = {};
COMPLEXITY_FACTORS.forEach((_, i) => { defaultComplexityFactors[i] = false; });

const defaultEaseFactors = {};
EASE_FACTORS.forEach((_, i) => { defaultEaseFactors[i] = false; });

export const defaultQuoteState = {
  // Step 1: Client Profile
  clientName: '',
  date: new Date().toISOString().split('T')[0],
  isCouple: false,
  lifeStage: 'accumulation',
  ageBracket: 'under40',
  entityCount: 2,

  // Step 2: Scope of Advice
  hourlyRate: 335,
  serviceLines: defaultServiceLines,
  scenarios: 2,
  strategies: defaultStrategies,

  // Step 3: Adjustments
  complexityFactors: defaultComplexityFactors,
  easeFactors: defaultEaseFactors,
  investmentAccounts: 2,
  inSpecieHours: 0,
  insuranceImplHours: 0,
  insuranceCommissionOffset: 0,

  // Step 4: Ongoing Service
  ongoingModel: 'fixedOnly', // 'fixedOnly' | 'fixedVariable' | 'subscription'
  reviewMeetings: 1,
  ongoingAccounts: 3,
  marginLending: false,
  fum: 500000,
  tiers: [
    { from: 0, to: 250000, rate: 0.70 },
    { from: 250001, to: 500000, rate: 0.45 },
    { from: 500001, to: 1000000, rate: 0.40 },
    { from: 1000001, to: 2000000, rate: 0.20 },
    { from: 2000001, to: 4000000, rate: 0.10 },
    { from: 4000001, to: null, rate: 0.00 },
  ],
  monthlySubscription: 500,

  // Review meeting hours (all editable)
  reviewHours: {
    updateXplan: 1.0,
    prepareReport: 3.0,
    admin: 0.5,
    buffer: 0.5,
    conductMeeting: 1.5,
    fileNote: 0.5,
    prepareROA: 1.5,
    implementROA: 0.5,
    fofaConsents: 1.0,
  },

  // Entity fee split (optional, up to 6 rows)
  entities: [],

  // Step 5: client paragraph override (null = auto-generated)
  clientParagraphOverride: null,
};
