export const defaultState = {
  feeModel: 'flat',

  client: {
    age: 45,
    lifeStage: 'Accumulation',
    isCouple: false,
    strategies: {
      super: { enabled: true, hours: 3 },
      smsf: { enabled: false, hours: 6 },
      investment: { enabled: false, hours: 4 },
      insurance: { enabled: true, hours: 3 },
      estate: { enabled: false, hours: 2 },
      debt: { enabled: false, hours: 1.5 },
      centrelink: { enabled: false, hours: 3 },
      div296: { enabled: false, hours: 2 },
    },
  },

  feeModelInputs: {
    flatFee: 3500,
    percentage: 1.1,
    fua: 500000,
    tiers: [
      { from: 0, to: 500000, rate: 1.1 },
      { from: 500000, to: 1000000, rate: 0.9 },
      { from: 1000000, to: null, rate: 0.7 },
    ],
    monthlySubscription: 400,
  },

  time: {
    initialMeeting: 1.5,
    adviserPrep: 2,
    paraplanning: {
      type: 'internal',
      hoursInternal: 8,
      hourlyRateInternal: 100,
      flatFeeExternal: 1500,
    },
    reportReview: 1.5,
    presentationMeeting: 1,
    followUpContacts: 3,
    followUpTimeEach: 0.25,
    travelTime: 0,
    isVirtual: false,
  },

  ongoing: {
    reviewMeetingsPerYear: 2,
    phoneEmailAccess: true,
    ongoingParaplanningHours: 4,
    adviserHoursPerReview: 2,
    adviserPrepPerReview: 1,
  },

  rates: {
    adviserHourly: 300,
    adminHourly: 80,
    marginPercent: 20,
  },

  costs: {
    initialMeetingCost: 0,
    disbursements: 200,
    licenseeCost: 500,
  },

  settings: {
    impliedRateGreen: 350,
    impliedRateAmber: 250,
  },
};
