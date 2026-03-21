import { STRATEGIES, ADD_ONS, CORE_TASKS, REVIEW_TASKS, ANNUAL_TASKS, PREMIUM_FACTORS, DISCOUNT_FACTORS, getPremiumRate, getDiscountRate, formatStrategyList } from './serviceLines.js';
import { roundToNearest100 } from './formatters.js';

/**
 * Pure calculation engine for FeeQuote (Phase 1 rebuild).
 * Returns all computed values with no side effects.
 */
export function calculateQuote(state: any) {
  const adviserRate = Number(state.adviserRate) || 106;
  const paraplannerRate = Number(state.paraplannerRate) || 62;
  const adminRate = Number(state.adminRate) || 40;
  const isExternal = state.paraplanner === 'external';
  const entityCount = Number(state.entityCount) || 0;
  const totalEntities = (state.isCouple ? 2 : 1) + entityCount;
  const scenarios = Number(state.scenarios) || 0;
  const marginPercent = Number(state.profitMarginPercent) || 0;
  const applyMarginToOngoing = state.applyMarginToOngoing !== false;

  // ── Helper: calc fee for one line item ────────────────────────────────────
  // quantity multiplies the total fee/hours (hours per unit stay the same for editing)
  function calcLineItemFee(item: any, multiplier = 1, quantity = 1) {
    const overrides = state.hourOverrides || {};
    const advHrs = (overrides[`${item.id}.adviser`] ?? item.adviserHours) * multiplier;
    const paraHrs = isExternal ? 0 : (overrides[`${item.id}.paraplanner`] ?? item.paraplannerHours) * multiplier;
    const admHrs = (overrides[`${item.id}.admin`] ?? item.adminHours) * multiplier;
    const feePerUnit = advHrs * adviserRate + paraHrs * paraplannerRate + admHrs * adminRate;
    const fee = feePerUnit * quantity;
    const totalHours = (advHrs + paraHrs + admHrs) * quantity;
    return {
      ...item,
      quantity,
      feePerUnit,
      adviserHoursUsed: advHrs * quantity,
      paraplannerHoursUsed: paraHrs * quantity,
      adminHoursUsed: admHrs * quantity,
      fee,
      totalHours,
      hours: totalHours,
    };
  }

  // ── Step 2: SOA line items ─────────────────────────────────────────────────
  const strategyItems = STRATEGIES
    .filter(s => state.strategies?.[s.id])
    .map(s => {
      const quantity = Math.max(1, Number(state.strategyQuantities?.[s.id]) || 1);
      return calcLineItemFee(s, 1, quantity);
    });

  const addOnItems = ADD_ONS
    .filter(a => state.addOns?.[a.id])
    .map(a => {
      const quantity = Math.max(1, Number(state.addOnQuantities?.[a.id]) || 1);
      return calcLineItemFee(a, 1, quantity);
    });

  function calcCoreTaskFee(task: any, multiplier = 1) {
    const overrides = state.hourOverrides || {};
    const defaultAdv = isExternal ? task.externalAdviserHours : task.adviserHours;
    const defaultPara = isExternal ? task.externalParaplannerHours : task.paraplannerHours;
    const defaultAdm = isExternal ? task.externalAdminHours : task.adminHours;
    const advHrs = (overrides[`${task.id}.adviser`] ?? defaultAdv) * multiplier;
    const paraHrs = (overrides[`${task.id}.paraplanner`] ?? defaultPara) * multiplier;
    const admHrs = (overrides[`${task.id}.admin`] ?? defaultAdm) * multiplier;
    const fee = advHrs * adviserRate + paraHrs * paraplannerRate + admHrs * adminRate;
    const totalHours = advHrs + paraHrs + admHrs;
    return { ...task, adviserHoursUsed: advHrs, paraplannerHoursUsed: paraHrs, adminHoursUsed: admHrs, fee, totalHours, hours: totalHours };
  }

  const coreTaskItems = CORE_TASKS.map(task => {
    const enabled = state.coreTasks?.[task.id] ?? task.defaultOn ?? false;
    if (!enabled || (isExternal && task.hideWhenExternal)) {
      return { ...task, fee: 0, totalHours: 0, hours: 0, adviserHoursUsed: 0, paraplannerHoursUsed: 0, adminHoursUsed: 0 };
    }
    let multiplier = 1;
    if (task.perEntity) multiplier = totalEntities;
    if (task.perAdditionalScenario) multiplier = Math.max(0, scenarios);
    return calcCoreTaskFee(task, multiplier);
  });

  const lineItems = [...strategyItems, ...addOnItems, ...coreTaskItems];

  const rawParaplannerFee = Number(state.paraplannerFee) || 0;
  const effectiveParaplannerFee = state.paraplannerBuffer ? rawParaplannerFee * 1.1 : rawParaplannerFee;

  const soaLineTotal = lineItems.reduce((s, l) => s + l.fee, 0);
  const baseFee = isExternal ? effectiveParaplannerFee + soaLineTotal : soaLineTotal;
  const totalBaseHours = lineItems.reduce((s, l) => s + l.totalHours, 0);

  // SOA cost components (for profitability)
  const soaAdviserCost = lineItems.reduce((s, l) => s + l.adviserHoursUsed * adviserRate, 0);
  const soaParaplannerCost = isExternal ? 0 : lineItems.reduce((s, l) => s + l.paraplannerHoursUsed * paraplannerRate, 0);
  const soaAdminCost = lineItems.reduce((s, l) => s + l.adminHoursUsed * adminRate, 0);
  const soaExternalFee = isExternal ? effectiveParaplannerFee : 0;

  // ── Step 4: Adjustments ────────────────────────────────────────────────────
  const premiumCount = PREMIUM_FACTORS.filter((_, i) => state.premiumFactors?.[i]).length;
  const discountCount = DISCOUNT_FACTORS.filter((_, i) => state.discountFactors?.[i]).length;
  const premiumRate = getPremiumRate(premiumCount);
  const discountRate = getDiscountRate(discountCount);

  const soaPremiumAuto = baseFee * premiumRate;
  const soaDiscountAuto = baseFee * discountRate;
  const soaPremium = state.premiumSoaOverride ?? soaPremiumAuto;
  const soaDiscount = state.discountSoaOverride ?? soaDiscountAuto;

  // Apply margin AFTER adjustments, BEFORE rounding/GST
  const soaCostBeforeMargin = baseFee + soaPremium - soaDiscount;
  const soaMarginAmount = soaCostBeforeMargin * (marginPercent / 100);
  const adjustedFeeRounded = roundToNearest100(soaCostBeforeMargin + soaMarginAmount);
  const soaGst = adjustedFeeRounded * 0.1;
  const soaTotalInclGst = adjustedFeeRounded + soaGst;

  // ── Implementation fees ────────────────────────────────────────────────────
  const investmentAccounts = Number(state.investmentAccounts) || 0;
  const inSpecieHours = Number(state.inSpecieHours) || 0;
  const insuranceImplHours = Number(state.insuranceImplHours) || 0;
  const commissionOffset = Number(state.insuranceCommissionOffset) || 0;

  const implInvestmentFee = state.implInvestmentOverride ?? (investmentAccounts * 550);
  const implInSpecieFee = state.implInSpecieOverride ?? (inSpecieHours * adminRate * 1.1);
  const implInsuranceFee = state.implInsuranceOverride ?? (insuranceImplHours * adminRate * 1.1);
  const implTotal = Math.max(0, implInvestmentFee + implInSpecieFee + implInsuranceFee - commissionOffset);
  const totalInitialFees = soaTotalInclGst + implTotal;

  // ── Step 3: Ongoing service ────────────────────────────────────────────────
  const hasOngoing = state.hasOngoing !== false;

  function calcReviewTaskFee(task: any, overrides: Record<string, number>) {
    const advHrs = overrides[`${task.id}.adviser`] ?? task.adviserHours;
    const paraHrs = overrides[`${task.id}.paraplanner`] ?? task.paraplannerHours;
    const admHrs = overrides[`${task.id}.admin`] ?? task.adminHours;
    const fee = advHrs * adviserRate + paraHrs * paraplannerRate + admHrs * adminRate;
    const totalHours = advHrs + paraHrs + admHrs;
    return { ...task, adviserHoursUsed: advHrs, paraplannerHoursUsed: paraHrs, adminHoursUsed: admHrs, fee, totalHours };
  }

  const reviewHourOverrides = state.reviewHourOverrides || {};
  const annualTaskHourOverrides = state.annualTaskHourOverrides || {};

  const reviewTaskItems = REVIEW_TASKS.map(t => calcReviewTaskFee(t, reviewHourOverrides));
  const annualTaskItems = ANNUAL_TASKS.map(t => calcReviewTaskFee(t, annualTaskHourOverrides));

  const costPerReview = reviewTaskItems.reduce((s, t) => s + t.fee, 0);
  const totalReviewHours = reviewTaskItems.reduce((s, t) => s + t.totalHours, 0);
  const totalAnnualTaskFee = annualTaskItems.reduce((s, t) => s + t.fee, 0);
  const reviewMeetings = Number(state.reviewMeetings) || 0;
  const reviewMeetingFee = costPerReview * reviewMeetings;
  const fixedOngoingFee = reviewMeetingFee + totalAnnualTaskFee;

  // Total ongoing hours (review × meetings + annual tasks)
  const totalOngoingHours = totalReviewHours * reviewMeetings + annualTaskItems.reduce((s, t) => s + t.totalHours, 0);

  // Ongoing cost components (for profitability)
  const ongoingAdviserCost = reviewTaskItems.reduce((s, t) => s + t.adviserHoursUsed * adviserRate, 0) * reviewMeetings
    + annualTaskItems.reduce((s, t) => s + t.adviserHoursUsed * adviserRate, 0);
  const ongoingParaplannerCost = reviewTaskItems.reduce((s, t) => s + t.paraplannerHoursUsed * paraplannerRate, 0) * reviewMeetings
    + annualTaskItems.reduce((s, t) => s + t.paraplannerHoursUsed * paraplannerRate, 0);
  const ongoingAdminCost = reviewTaskItems.reduce((s, t) => s + t.adminHoursUsed * adminRate, 0) * reviewMeetings
    + annualTaskItems.reduce((s, t) => s + t.adminHoursUsed * adminRate, 0);

  // Variable / percentage-based FUM
  let variableFee = 0;
  let effectiveFumRate = 0;
  if (state.ongoingModel === 'percentageBased') {
    const fum = Number(state.fum) || 0;
    const tiers = state.tiers || [];
    let remaining = fum;
    for (const tier of tiers) {
      if (remaining <= 0) break;
      const tierCap = tier.to !== null ? tier.to - tier.from + 1 : Infinity;
      const applyTo = Math.min(remaining, tierCap);
      variableFee += applyTo * (tier.rate / 100);
      remaining -= applyTo;
    }
    const minFee = Number(state.minimumAnnualFee) || 0;
    variableFee = Math.max(variableFee, minFee);
    if (state.hasAdditionalPlatformFee) {
      const platformCount = Number(state.platformAccounts) || 1;
      variableFee += Math.max(0, platformCount - 1) * (Number(state.additionalPlatformFee) || 500);
    }
    effectiveFumRate = (Number(state.fum) || 0) > 0 ? variableFee / (Number(state.fum) || 1) : 0;
  }

  const subscriptionAnnual = state.ongoingModel === 'subscription'
    ? (Number(state.monthlySubscription) || 0) * 12
    : 0;

  let totalOngoingExGst = 0;
  if (hasOngoing) {
    if (state.ongoingModel === 'fixedOnly') {
      totalOngoingExGst = fixedOngoingFee;
    } else if (state.ongoingModel === 'percentageBased') {
      totalOngoingExGst = variableFee;
    } else {
      totalOngoingExGst = subscriptionAnnual;
    }
  }

  // Ongoing adjustments
  const ongoingPremiumAuto = totalOngoingExGst * premiumRate;
  const ongoingDiscountAuto = totalOngoingExGst * discountRate;
  const ongoingPremium = state.premiumOngoingOverride ?? ongoingPremiumAuto;
  const ongoingDiscount = state.discountOngoingOverride ?? ongoingDiscountAuto;

  const ongoingCommissionOffset = Number(state.ongoingInsuranceCommissionOffset) || 0;

  // Apply margin to ongoing AFTER adjustments, BEFORE rounding/GST
  const ongoingCostBeforeMargin = Math.max(0, totalOngoingExGst + ongoingPremium - ongoingDiscount - ongoingCommissionOffset);
  const ongoingMarginAmount = hasOngoing && applyMarginToOngoing
    ? ongoingCostBeforeMargin * (marginPercent / 100)
    : 0;
  const ongoingMarginPercent = hasOngoing && applyMarginToOngoing ? marginPercent : 0;

  const totalOngoingRounded = hasOngoing
    ? roundToNearest100(ongoingCostBeforeMargin + ongoingMarginAmount)
    : 0;
  const ongoingGst = totalOngoingRounded * 0.1;
  const totalOngoingInclGst = totalOngoingRounded + ongoingGst;
  const monthlyOngoing = totalOngoingInclGst / 12;

  // Implied hourly rates
  const impliedHourlyRateSoa = totalBaseHours > 0 ? adjustedFeeRounded / totalBaseHours : 0;
  const impliedHourlyRateOngoing = totalOngoingHours > 0 ? totalOngoingRounded / totalOngoingHours : 0;

  // ── Billing plan ──────────────────────────────────────────────────────────
  const billingPlan = [
    { phase: '1 — Onboarding', description: '50% of SOA fee', amount: soaTotalInclGst / 2, when: 'On signing engagement letter', how: 'BPay' },
    { phase: '2 — SOA Delivery', description: '50% of SOA fee', amount: soaTotalInclGst / 2, when: 'On SOA presentation', how: 'Platform' },
    { phase: '3 — Implementation', description: 'Full implementation fee', amount: implTotal, when: 'On implementation', how: 'Platform' },
    { phase: '4 — Ongoing Service', description: 'Annual fee (quarterly)', amount: totalOngoingInclGst / 4, when: 'Quarterly in arrears', how: 'Platform' },
  ];

  // ── Client paragraph ──────────────────────────────────────────────────────
  const allStrategies = [...STRATEGIES, ...ADD_ONS];
  const allEnabled = { ...(state.strategies || {}), ...(state.addOns || {}) };
  const strategyListText = formatStrategyList(allStrategies, allEnabled);
  const clientName = state.clientName?.trim() || 'Client';
  const hasStrategies = allStrategies.some(s => allEnabled[s.id]);
  const totalHoursApprox = Math.round(totalBaseHours);
  const hasImpl = implTotal > 0;
  const hasInspecie = inSpecieHours > 0;
  const hasInsuranceImpl = insuranceImplHours > 0;

  let clientParagraph = `Dear ${clientName},\n\n`;
  clientParagraph += `Thank you for the opportunity to outline the fees associated with providing you with comprehensive financial advice. `;
  clientParagraph += `Your initial advice fee of ${fmtCcy(soaTotalInclGst)} (including GST) covers a comprehensive Statement of Advice`;
  if (hasStrategies) clientParagraph += ` addressing ${strategyListText}`;
  if (state.isCouple) clientParagraph += `, tailored to both your individual and joint financial objectives`;
  clientParagraph += `. `;
  if (totalHoursApprox > 0) {
    clientParagraph += `This includes approximately ${totalHoursApprox} hour${totalHoursApprox !== 1 ? 's' : ''} of research, analysis, and preparation`;
    if (scenarios > 0) clientParagraph += `, including ${scenarios} scenario ${scenarios === 1 ? 'analysis' : 'analyses'} to support your decision-making,`;
    clientParagraph += ` and a full compliance and quality review. `;
  }
  if (hasImpl) {
    clientParagraph += `\n\nA separate implementation fee of ${fmtCcy(implTotal)} (including GST) covers the execution of the recommended strategies across ${investmentAccounts} account${investmentAccounts !== 1 ? 's' : ''}`;
    if (hasInspecie) clientParagraph += `, including the transfer of existing assets`;
    if (hasInsuranceImpl) clientParagraph += ` and insurance application processing`;
    clientParagraph += `. `;
  }
  if (hasOngoing && totalOngoingInclGst > 0) {
    clientParagraph += `\n\nYour ongoing service fee of ${fmtCcy(totalOngoingInclGst)} (including GST) per year provides ${reviewMeetings} review meeting${reviewMeetings !== 1 ? 's' : ''} annually`;
    if (hasStrategies) clientParagraph += `, ongoing monitoring of your ${strategyListText}`;
    clientParagraph += `. This equates to approximately ${fmtCcy(Math.round(monthlyOngoing))} per month. `;
  }
  clientParagraph += `\n\nWe believe this fee reflects the scope and complexity of the advice being provided and the value of a continuing professional relationship focused on helping you achieve your financial goals.`;

  // ── Service summary bullets ────────────────────────────────────────────────
  const serviceSummaryItems: string[] = [];
  const discoveryOn = state.coreTasks?.['discovery'] ?? true;
  const soaMeetings = (discoveryOn ? 1 : 0) + 1;
  serviceSummaryItems.push(`${soaMeetings} meeting${soaMeetings > 1 ? 's' : ''} with your adviser (initial consultation and advice presentation)`);
  if (hasStrategies) {
    serviceSummaryItems.push(`Comprehensive Statement of Advice covering ${strategyListText}`);
  } else {
    serviceSummaryItems.push(`Comprehensive Statement of Advice`);
  }
  if (scenarios > 0) serviceSummaryItems.push(`Financial modelling with ${scenarios} scenario ${scenarios === 1 ? 'analysis' : 'analyses'}`);
  if (totalHoursApprox > 0) serviceSummaryItems.push(`${totalHoursApprox} hours of research, analysis, and preparation`);
  serviceSummaryItems.push(`Full compliance and quality review`);
  if (investmentAccounts > 0) serviceSummaryItems.push(`Implementation across ${investmentAccounts} investment and superannuation account${investmentAccounts !== 1 ? 's' : ''}`);
  if (hasOngoing && reviewMeetings > 0) serviceSummaryItems.push(`${reviewMeetings} review meeting${reviewMeetings !== 1 ? 's' : ''} per year`);
  if (hasOngoing && hasStrategies) serviceSummaryItems.push(`Ongoing monitoring and adjustment of your financial strategies`);

  return {
    // SOA line items
    totalEntities,
    lineItems,
    strategyItems,
    addOnItems,
    coreTaskItems,
    reviewTaskItems,
    annualTaskItems,
    totalBaseHours,
    baseFee,

    // SOA cost components
    soaAdviserCost,
    soaParaplannerCost,
    soaAdminCost,
    soaExternalFee,

    // Ongoing cost components
    ongoingAdviserCost,
    ongoingParaplannerCost,
    ongoingAdminCost,

    // Adjustments
    premiumCount,
    discountCount,
    premiumRate,
    discountRate,
    soaPremiumAuto,
    soaDiscountAuto,
    soaPremium,
    soaDiscount,
    ongoingPremiumAuto,
    ongoingDiscountAuto,
    ongoingPremium,
    ongoingDiscount,

    // Margin
    soaCostBeforeMargin,
    soaMarginAmount,
    soaMarginPercent: marginPercent,
    ongoingCostBeforeMargin,
    ongoingMarginAmount,
    ongoingMarginPercent,

    // SOA final
    adjustedFeeRounded,
    soaGst,
    soaTotalInclGst,

    // Implementation
    implInvestmentFee,
    implInSpecieFee,
    implInsuranceFee,
    commissionOffset,
    implTotal,
    totalInitialFees,

    // Ongoing
    hasOngoing,
    costPerReview,
    totalReviewHours,
    totalOngoingHours,
    reviewMeetings,
    fixedOngoingFee,
    totalAnnualTaskFee,
    variableFee,
    effectiveFumRate,
    subscriptionAnnual,
    totalOngoingRounded,
    ongoingGst,
    totalOngoingInclGst,
    monthlyOngoing,

    // Implied rates
    impliedHourlyRateSoa,
    impliedHourlyRateOngoing,

    // Backward-compat aliases (for Step 5)
    complexityCount: premiumCount,
    easeCount: discountCount,
    complexityRate: premiumRate,
    easeRate: discountRate,
    complexityAmount: soaPremium,
    easeAmount: soaDiscount,
    accountKeepingFee: 0,
    marginLendingFee: 0,
    strategyCount: STRATEGIES.filter(s => state.strategies?.[s.id]).length,

    // Output
    billingPlan,
    clientParagraph: state.clientParagraphOverride ?? clientParagraph,
    serviceSummaryItems,
  };
}

function fmtCcy(value: number): string {
  const n = Math.round(Number(value) || 0);
  return '$' + n.toLocaleString('en-AU');
}
