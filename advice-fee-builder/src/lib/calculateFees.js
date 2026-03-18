import { STRATEGIES, getEnabledStrategies, formatStrategyList } from './strategies.js';

/**
 * Pure calculation function — no side effects
 * @param {object} state - full app state
 * @returns {object} calculated results
 */
export function calculateFees(state) {
  const { client, time, ongoing, rates, costs, feeModel, feeModelInputs, settings } = state;

  // ── Strategy hours ──────────────────────────────────────────────────────────
  const enabledStrategies = getEnabledStrategies(client.strategies);
  const strategyHoursTotal = enabledStrategies.reduce(
    (sum, s) => sum + (client.strategies[s.key]?.hours || s.defaultHours),
    0
  );

  // ── Initial adviser hours ───────────────────────────────────────────────────
  const followUpHours = time.followUpContacts * time.followUpTimeEach;
  const travelHours = time.isVirtual ? 0 : time.travelTime;

  const totalAdviserHoursInitial =
    time.initialMeeting +
    time.adviserPrep +
    strategyHoursTotal +
    time.reportReview +
    time.presentationMeeting +
    followUpHours +
    travelHours;

  // ── Paraplanning cost (initial) ─────────────────────────────────────────────
  const paraplanningCostInitial =
    time.paraplanning.type === 'internal'
      ? time.paraplanning.hoursInternal * time.paraplanning.hourlyRateInternal
      : time.paraplanning.flatFeeExternal;

  // ── Admin hours estimate (initial) ─────────────────────────────────────────
  // Approx 20% of adviser hours for admin support
  const adminHoursInitial = totalAdviserHoursInitial * 0.2;
  const adminCostInitial = adminHoursInitial * rates.adminHourly;

  // ── Cost recovery (initial) ─────────────────────────────────────────────────
  const adviserCostInitial = totalAdviserHoursInitial * rates.adviserHourly;
  const baseCostInitial =
    adviserCostInitial +
    paraplanningCostInitial +
    adminCostInitial +
    costs.disbursements +
    costs.licenseeCost +
    costs.initialMeetingCost;

  const marginMultiplier = 1 + rates.marginPercent / 100;
  const costRecoveryInitial = baseCostInitial * marginMultiplier;

  // ── Ongoing adviser hours ───────────────────────────────────────────────────
  const totalAdviserHoursOngoing =
    (ongoing.adviserHoursPerReview + ongoing.adviserPrepPerReview) *
    ongoing.reviewMeetingsPerYear;

  // ── Paraplanning cost (ongoing) ─────────────────────────────────────────────
  const paraplanningCostOngoing =
    time.paraplanning.type === 'internal'
      ? ongoing.ongoingParaplanningHours * time.paraplanning.hourlyRateInternal
      : ongoing.ongoingParaplanningHours * 100; // external ongoing estimate

  // ── Cost recovery (ongoing) ─────────────────────────────────────────────────
  const adminHoursOngoing = totalAdviserHoursOngoing * 0.2;
  const adminCostOngoing = adminHoursOngoing * rates.adminHourly;
  const adviserCostOngoing = totalAdviserHoursOngoing * rates.adviserHourly;
  const baseCostOngoing =
    adviserCostOngoing +
    paraplanningCostOngoing +
    adminCostOngoing +
    costs.licenseeCost;

  const costRecoveryOngoing = baseCostOngoing * marginMultiplier;

  // ── Model-derived fee ───────────────────────────────────────────────────────
  let modelDerivedFeeInitial = null;
  let modelDerivedFeeOngoing = null;

  switch (feeModel) {
    case 'flat': {
      modelDerivedFeeInitial = feeModelInputs.flatFee;
      modelDerivedFeeOngoing = null; // flat model only sets initial
      break;
    }
    case 'percentage': {
      const annualFee = feeModelInputs.fua * (feeModelInputs.percentage / 100);
      modelDerivedFeeInitial = annualFee;
      modelDerivedFeeOngoing = annualFee;
      break;
    }
    case 'tiered': {
      let fee = 0;
      const fua = feeModelInputs.fua;
      for (const tier of feeModelInputs.tiers) {
        const from = tier.from || 0;
        const to = tier.to !== null && tier.to !== undefined && tier.to !== '' ? tier.to : Infinity;
        if (fua <= from) break;
        const bandAmount = Math.min(fua, to) - from;
        fee += bandAmount * (tier.rate / 100);
      }
      modelDerivedFeeInitial = fee;
      modelDerivedFeeOngoing = fee;
      break;
    }
    case 'subscription': {
      const annualFee = feeModelInputs.monthlySubscription * 12;
      modelDerivedFeeInitial = null; // subscription handles ongoing, initial is cost recovery
      modelDerivedFeeOngoing = annualFee;
      break;
    }
  }

  // ── Fee ranges ──────────────────────────────────────────────────────────────
  const initialFeeMin = costRecoveryInitial;
  const initialFeeMax = costRecoveryInitial * 1.15; // 15% above cost recovery as upper guidance

  const ongoingFeeMin = costRecoveryOngoing;
  const ongoingFeeMax = costRecoveryOngoing * 1.15;

  // Displayed fees (what we show the user as their fee)
  let displayInitialFee = modelDerivedFeeInitial ?? costRecoveryInitial;
  let displayOngoingFee = modelDerivedFeeOngoing ?? costRecoveryOngoing;

  // ── Implied hourly rate ─────────────────────────────────────────────────────
  const impliedHourlyRateInitial =
    totalAdviserHoursInitial > 0 ? displayInitialFee / totalAdviserHoursInitial : 0;
  const impliedHourlyRateOngoing =
    totalAdviserHoursOngoing > 0 ? displayOngoingFee / totalAdviserHoursOngoing : 0;

  const hourlyRateStatus =
    impliedHourlyRateInitial >= settings.impliedRateGreen
      ? 'green'
      : impliedHourlyRateInitial >= settings.impliedRateAmber
      ? 'amber'
      : 'red';

  // ── Breakdown arrays ────────────────────────────────────────────────────────
  const initialBreakdown = [
    {
      label: 'Initial client meeting',
      hours: time.initialMeeting,
      cost: time.initialMeeting * rates.adviserHourly,
    },
    {
      label: 'Adviser preparation',
      hours: time.adviserPrep,
      cost: time.adviserPrep * rates.adviserHourly,
    },
    ...enabledStrategies.map(s => ({
      label: `Strategy: ${s.label}`,
      hours: client.strategies[s.key]?.hours || s.defaultHours,
      cost: (client.strategies[s.key]?.hours || s.defaultHours) * rates.adviserHourly,
    })),
    {
      label: 'Report review',
      hours: time.reportReview,
      cost: time.reportReview * rates.adviserHourly,
    },
    {
      label: 'Advice presentation meeting',
      hours: time.presentationMeeting,
      cost: time.presentationMeeting * rates.adviserHourly,
    },
    ...(followUpHours > 0
      ? [{
          label: `Follow-up contacts (${time.followUpContacts} × ${time.followUpTimeEach}h)`,
          hours: followUpHours,
          cost: followUpHours * rates.adviserHourly,
        }]
      : []),
    ...(travelHours > 0
      ? [{
          label: 'Travel time',
          hours: travelHours,
          cost: travelHours * rates.adviserHourly,
        }]
      : []),
    {
      label: 'Paraplanning',
      hours:
        time.paraplanning.type === 'internal' ? time.paraplanning.hoursInternal : null,
      cost: paraplanningCostInitial,
    },
    {
      label: 'Admin support (est.)',
      hours: adminHoursInitial,
      cost: adminCostInitial,
    },
    ...(costs.disbursements > 0
      ? [{ label: 'Disbursements & file fees', hours: null, cost: costs.disbursements }]
      : []),
    ...(costs.licenseeCost > 0
      ? [{ label: 'Licensee / AFSL cost', hours: null, cost: costs.licenseeCost }]
      : []),
    ...(costs.initialMeetingCost > 0
      ? [{ label: 'Meeting room hire', hours: null, cost: costs.initialMeetingCost }]
      : []),
    {
      label: `Business margin (${rates.marginPercent}%)`,
      hours: null,
      cost: baseCostInitial * (rates.marginPercent / 100),
    },
  ];

  const ongoingBreakdown = [
    {
      label: `Review meetings (${ongoing.reviewMeetingsPerYear}/year × ${ongoing.adviserHoursPerReview}h)`,
      hours: ongoing.adviserHoursPerReview * ongoing.reviewMeetingsPerYear,
      cost: ongoing.adviserHoursPerReview * ongoing.reviewMeetingsPerYear * rates.adviserHourly,
    },
    {
      label: `Review preparation (${ongoing.reviewMeetingsPerYear}/year × ${ongoing.adviserPrepPerReview}h)`,
      hours: ongoing.adviserPrepPerReview * ongoing.reviewMeetingsPerYear,
      cost: ongoing.adviserPrepPerReview * ongoing.reviewMeetingsPerYear * rates.adviserHourly,
    },
    {
      label: 'Ongoing paraplanning',
      hours: ongoing.ongoingParaplanningHours,
      cost: paraplanningCostOngoing,
    },
    {
      label: 'Admin support (est.)',
      hours: adminHoursOngoing,
      cost: adminCostOngoing,
    },
    ...(costs.licenseeCost > 0
      ? [{ label: 'Licensee / AFSL cost', hours: null, cost: costs.licenseeCost }]
      : []),
    {
      label: `Business margin (${rates.marginPercent}%)`,
      hours: null,
      cost: baseCostOngoing * (rates.marginPercent / 100),
    },
  ];

  // ── Client paragraph ────────────────────────────────────────────────────────
  const strategyListText = formatStrategyList(enabledStrategies);
  const stratPrepHours = strategyHoursTotal + time.adviserPrep + time.reportReview;
  const ppHours =
    time.paraplanning.type === 'internal'
      ? time.paraplanning.hoursInternal
      : null;
  const numMeetings = 2; // initial + presentation

  const coupleNote = client.isCouple
    ? ' This fee reflects the additional complexity of providing advice for both partners.'
    : '';

  const ongoingAccessNote = ongoing.phoneEmailAccess
    ? 'ongoing phone and email access to your adviser, '
    : '';

  const initialFeeDisplay = Math.round(displayInitialFee);
  const ongoingFeeDisplay = Math.round(displayOngoingFee);

  const ppNote =
    ppHours !== null
      ? `, and ${ppHours} hours of specialist paraplanning`
      : ' and specialist paraplanning';

  const clientParagraph =
    `Your initial advice fee of $${initialFeeDisplay.toLocaleString('en-AU')} covers ${numMeetings} meetings with your adviser, a comprehensive Statement of Advice addressing ${strategyListText}, approximately ${stratPrepHours.toFixed(1)} hours of research and preparation${ppNote}.${coupleNote} Your ongoing service fee of $${ongoingFeeDisplay.toLocaleString('en-AU')} per year includes ${ongoing.reviewMeetingsPerYear} review meeting${ongoing.reviewMeetingsPerYear !== 1 ? 's' : ''} per year, ${ongoingAccessNote}and annual monitoring and adjustment of your ${strategyListText} strategies.`.trim();

  // ── Service summary items ───────────────────────────────────────────────────
  const serviceSummaryItems = [
    `${numMeetings} face-to-face meetings (initial consultation and advice presentation)`,
    `Comprehensive SOA covering ${strategyListText}`,
    `${stratPrepHours.toFixed(1)} hours of adviser research and preparation`,
    ...(ppHours !== null
      ? [`${ppHours} hours of paraplanning and compliance review`]
      : ['Full paraplanning and compliance review']),
    `${ongoing.reviewMeetingsPerYear} ongoing review meeting${ongoing.reviewMeetingsPerYear !== 1 ? 's' : ''} per year`,
    ...(ongoing.phoneEmailAccess ? ['Phone and email access between reviews'] : []),
  ];

  return {
    totalAdviserHoursInitial,
    totalAdviserHoursOngoing,
    paraplanningCostInitial,
    paraplanningCostOngoing,
    costRecoveryInitial,
    costRecoveryOngoing,
    initialFeeMin,
    initialFeeMax,
    ongoingFeeMin,
    ongoingFeeMax,
    modelDerivedFeeInitial,
    modelDerivedFeeOngoing,
    displayInitialFee,
    displayOngoingFee,
    impliedHourlyRateInitial,
    impliedHourlyRateOngoing,
    hourlyRateStatus,
    initialBreakdown,
    ongoingBreakdown,
    clientParagraph,
    serviceSummaryItems,
    enabledStrategies,
  };
}
