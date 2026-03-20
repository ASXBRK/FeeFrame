import { CORE_TASKS } from './serviceLines.js';

const defaultCoreTasks = {};
CORE_TASKS.forEach(t => { defaultCoreTasks[t.id] = t.defaultOn ?? false; });

export const defaultQuoteState = {
  // Step 1: Client Profile
  clientName: '',
  date: new Date().toISOString().split('T')[0],
  isCouple: false,
  lifeStage: 'accumulation',
  ageBracket: 'under40',
  entityCount: 1,

  // Step 2: Scope of Advice — paraplanner
  paraplanner: 'internal',
  paraplannerFee: 0,
  paraplannerBuffer: false,

  // Step 2: Role rates
  adviserRate: 106,
  paraplannerRate: 62,
  adminRate: 40,

  // Step 2: Scope selections
  strategies: {},
  addOns: {},
  coreTasks: defaultCoreTasks,
  scenarios: 2,

  // Step 2: Hour overrides — key: "{itemId}.{role}" e.g. "super.adviser"
  hourOverrides: {},

  // Step 2: Implementation fees
  investmentAccounts: 0,
  inSpecieHours: 0,
  insuranceImplHours: 0,
  insuranceCommissionOffset: 0,

  // Step 3: Ongoing service
  hasOngoing: true,
  ongoingModel: 'fixedOnly', // 'fixedOnly' | 'percentageBased' | 'subscription'
  reviewMeetings: 2,
  reviewHourOverrides: {},
  annualTaskHourOverrides: {},

  // Percentage-based model
  fum: 0,
  tiers: [
    { from: 0, to: 500000, rate: 1.1 },
    { from: 500001, to: 1000000, rate: 0.88 },
    { from: 1000001, to: null, rate: 0.66 },
  ],
  minimumAnnualFee: 0,
  hasAdditionalPlatformFee: false,
  platformAccounts: 1,
  additionalPlatformFee: 500,

  // Subscription model
  monthlySubscription: 0,
  includedReviews: 2,
  additionalServicesRate: 0,

  // Step 4: Adjustments
  premiumFactors: {},
  discountFactors: {},
  premiumSoaOverride: null,
  premiumOngoingOverride: null,
  discountSoaOverride: null,
  discountOngoingOverride: null,

  // Entity fee split
  entities: [],

  // Step 5
  clientParagraphOverride: null,
};
