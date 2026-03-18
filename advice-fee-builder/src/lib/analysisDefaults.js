export const defaultAnalysisState = {
  // Section 1: Fee Inputs
  soaFeeExGst: 0,
  implFeeExGst: 0,
  ongoingFeeExGst: 0,

  // Section 2: Cost Inputs — Rates
  adviserRate: 300,
  paraplannerRate: 100,
  adminRate: 80,

  // Time spent — Initial SOA
  soaTasks: [
    { label: 'Discovery / initial meeting', hours: 2, who: 'adviser' },
    { label: 'Adviser preparation & research', hours: 4, who: 'adviser' },
    { label: 'Strategy development', hours: 3, who: 'adviser' },
    { label: 'Paraplanning', hours: 8, who: 'paraplanner' },
    { label: 'Report review & sign-off', hours: 1.5, who: 'adviser' },
    { label: 'Presentation meeting', hours: 1, who: 'adviser' },
    { label: 'Follow-up calls/emails', hours: 1, who: 'adviser' },
    { label: 'Travel time', hours: 0, who: 'adviser' },
    { label: 'Admin / support tasks', hours: 2, who: 'admin' },
  ],

  // Paraplanning mode for SOA
  soaParaplanningExternal: false,
  soaParaplanningExternalFee: 0,

  // Time spent — Ongoing (per year)
  ongoingTasks: [
    { label: 'Review preparation', hours: 3, who: 'adviser' },
    { label: 'Review meeting(s)', hours: 2, who: 'adviser' },
    { label: 'ROA preparation', hours: 1.5, who: 'adviser' },
    { label: 'Implementation', hours: 1, who: 'adviser' },
    { label: 'Admin & file notes', hours: 2, who: 'admin' },
    { label: 'Ad hoc calls/emails', hours: 2, who: 'adviser' },
    { label: 'Paraplanning', hours: 4, who: 'paraplanner' },
  ],

  // Paraplanning mode for Ongoing
  ongoingParaplanningExternal: false,
  ongoingParaplanningExternalFee: 0,

  // Fixed costs per client
  licenseeFees: 500,
  softwareCosts: 200,
  piInsurance: 100,
  otherDisbursements: 0,

  // Thresholds
  greenThreshold: 350,
  amberThreshold: 250,
};
