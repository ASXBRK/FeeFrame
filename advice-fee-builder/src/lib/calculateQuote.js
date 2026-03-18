import { SERVICE_LINES, STRATEGIES, COMPLEXITY_FACTORS, EASE_FACTORS, getComplexityPremiumRate, getEaseDiscountRate, formatStrategyList } from './serviceLines.js';
import { roundToNearest100 } from './formatters.js';

/**
 * Pure calculation engine for FeeQuote.
 * Returns all computed values with no side effects.
 */
export function calculateQuote(state) {
  const rate = Number(state.hourlyRate) || 335;

  // ── Step 2: Service line fees ──────────────────────────────────────────────
  const isExternal = state.paraplanner === 'external';
  const strategyCount = STRATEGIES.filter(s => state.strategies[s.id]).length;
  const entityCount = Number(state.entityCount) || 1;
  const scenarios = Number(state.scenarios) || 0;

  const lineItems = SERVICE_LINES.map(line => {
    let hours = 0;
    let fee = 0;
    let displayValue = null;

    if (line.inputType === 'toggle') {
      const enabled = state.serviceLines[line.id] ?? false;
      hours = enabled ? line.baseHours : 0;
      fee = hours * rate;
      displayValue = enabled;
    } else if (line.inputType === 'auto-entity') {
      hours = line.baseHours * entityCount;
      fee = hours * rate;
      displayValue = entityCount;
    } else if (line.inputType === 'auto-strategy') {
      hours = line.baseHours * strategyCount;
      fee = hours * rate;
      displayValue = strategyCount;
    } else if (line.inputType === 'number') {
      // financialModelling: first scenario free
      const extra = Math.max(0, scenarios - 1);
      hours = line.baseHours * extra;
      fee = hours * rate;
      displayValue = scenarios;
    }

    return { ...line, hours, fee, displayValue };
  });

  const rawParaplannerFee = Number(state.paraplannerFee) || 0;
  const effectiveParaplannerFee = state.paraplannerBuffer ? rawParaplannerFee * 1.1 : rawParaplannerFee;
  const baseFee = isExternal
    ? effectiveParaplannerFee
    : lineItems.reduce((sum, l) => sum + l.fee, 0);
  const totalBaseHours = isExternal ? 0 : lineItems.reduce((sum, l) => sum + l.hours, 0);

  // ── Step 3: Adjustments ────────────────────────────────────────────────────
  const complexityCount = COMPLEXITY_FACTORS.filter((_, i) => state.complexityFactors[i]).length;
  const easeCount = EASE_FACTORS.filter((_, i) => state.easeFactors[i]).length;

  const complexityRate = isExternal ? 0 : getComplexityPremiumRate(complexityCount);
  const easeRate = isExternal ? 0 : getEaseDiscountRate(easeCount);

  const complexityAmount = baseFee * complexityRate;
  const easeAmount = baseFee * easeRate;

  const adjustedFeeExact = baseFee + complexityAmount - easeAmount;
  const adjustedFeeRounded = isExternal ? baseFee : roundToNearest100(adjustedFeeExact);

  const soaGst = adjustedFeeRounded * 0.1;
  const soaTotalInclGst = adjustedFeeRounded + soaGst;

  // Implementation fees
  const investmentAccounts = Number(state.investmentAccounts) || 0;
  const inSpecieHours = Number(state.inSpecieHours) || 0;
  const insuranceImplHours = Number(state.insuranceImplHours) || 0;
  const commissionOffset = Number(state.insuranceCommissionOffset) || 0;

  const implInvestmentFee = investmentAccounts * 550; // incl GST per account
  const implInSpecieFee = inSpecieHours * rate * 1.1;
  const implInsuranceFee = insuranceImplHours * rate * 1.1;
  const implTotal = implInvestmentFee + implInSpecieFee + implInsuranceFee - commissionOffset;

  const totalInitialFees = soaTotalInclGst + implTotal;

  // ── Step 4: Ongoing ────────────────────────────────────────────────────────
  const totalReviewHours = Object.values(state.reviewHours || {}).reduce((s, h) => s + (Number(h) || 0), 0);
  const costPerReview = totalReviewHours * rate;

  const reviewMeetings = Number(state.reviewMeetings) || 0;
  const reviewMeetingFee = reviewMeetings * costPerReview;

  const ongoingAccounts = Number(state.ongoingAccounts) || 0;
  const accountKeepingFee = Math.max(0, ongoingAccounts - 1) * 500;

  const marginLendingFee = state.marginLending ? rate * 10 : 0;

  const fixedOngoingFee = reviewMeetingFee + accountKeepingFee + marginLendingFee;

  // Variable FUM component
  let variableFee = 0;
  let effectiveFumRate = 0;
  if (state.ongoingModel === 'fixedVariable') {
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
    effectiveFumRate = fum > 0 ? variableFee / fum : 0;
  }

  const subscriptionAnnual = state.ongoingModel === 'subscription'
    ? (Number(state.monthlySubscription) || 0) * 12
    : 0;

  let totalOngoingExGst = 0;
  if (state.ongoingModel === 'fixedOnly') {
    totalOngoingExGst = fixedOngoingFee;
  } else if (state.ongoingModel === 'fixedVariable') {
    totalOngoingExGst = fixedOngoingFee + variableFee;
  } else {
    totalOngoingExGst = subscriptionAnnual;
  }

  const totalOngoingRounded = roundToNearest100(totalOngoingExGst);
  const ongoingGst = totalOngoingRounded * 0.1;
  const totalOngoingInclGst = totalOngoingRounded + ongoingGst;
  const monthlyOngoing = totalOngoingInclGst / 12;

  // ── Step 5: Billing plan ────────────────────────────────────────────────────
  const billingPlan = [
    { phase: '1 — Onboarding', description: '50% of SOA fee', amount: soaTotalInclGst / 2, when: 'On signing engagement letter', how: 'BPay' },
    { phase: '2 — SOA Delivery', description: '50% of SOA fee', amount: soaTotalInclGst / 2, when: 'On SOA presentation', how: 'Platform' },
    { phase: '3 — Implementation', description: 'Full implementation fee', amount: implTotal, when: 'On implementation', how: 'Platform' },
    { phase: '4 — Ongoing Service', description: `Annual fee (quarterly)`, amount: totalOngoingInclGst / 4, when: 'Quarterly in arrears', how: 'Platform' },
  ];

  // ── Client paragraph ────────────────────────────────────────────────────────
  const strategyListText = formatStrategyList(STRATEGIES, state.strategies);
  const clientName = state.clientName?.trim() || 'Client';
  const enabledStrategies = STRATEGIES.filter(s => state.strategies[s.id]);
  const hasStrategies = enabledStrategies.length > 0;
  const totalHoursApprox = Math.round(totalBaseHours);
  const hasModelling = scenarios > 1;
  const hasImpl = implTotal > 0;
  const hasOngoing = totalOngoingInclGst > 0;
  const hasInspecie = inSpecieHours > 0;
  const hasInsuranceImpl = insuranceImplHours > 0;

  let clientParagraph = `Dear ${clientName},\n\n`;
  clientParagraph += `Thank you for the opportunity to outline the fees associated with providing you with comprehensive financial advice. `;
  clientParagraph += `Your initial advice fee of ${formatCurrencyInline(soaTotalInclGst)} (including GST) covers ${reviewMeetings > 0 ? `${reviewMeetings > 1 ? reviewMeetings + ' meetings' : 'a meeting'} with your adviser, ` : ''}a comprehensive Statement of Advice`;

  if (hasStrategies) {
    clientParagraph += ` addressing ${strategyListText}`;
  }
  if (state.isCouple) {
    clientParagraph += `, tailored to both your individual and joint financial objectives`;
  }
  clientParagraph += `. `;

  clientParagraph += `This includes approximately ${totalHoursApprox} hour${totalHoursApprox !== 1 ? 's' : ''} of research, analysis, and preparation`;
  if (hasModelling) {
    clientParagraph += `, including ${scenarios} scenario analyses to support your decision-making,`;
  }
  clientParagraph += ` and a full compliance and quality review. `;

  if (hasImpl) {
    clientParagraph += `\n\nA separate implementation fee of ${formatCurrencyInline(implTotal)} (including GST) covers the execution of the recommended strategies across ${investmentAccounts} account${investmentAccounts !== 1 ? 's' : ''}`;
    if (hasInspecie) clientParagraph += `, including the transfer of existing assets`;
    if (hasInsuranceImpl) clientParagraph += ` and insurance application processing`;
    clientParagraph += `. `;
  }

  if (hasOngoing) {
    clientParagraph += `\n\nYour ongoing service fee of ${formatCurrencyInline(totalOngoingInclGst)} (including GST) per year provides ${reviewMeetings} review meeting${reviewMeetings !== 1 ? 's' : ''} annually, ongoing monitoring of your ${hasStrategies ? strategyListText : 'financial strategies'}. This equates to approximately ${formatCurrencyInline(Math.round(monthlyOngoing))} per month. `;
  }

  clientParagraph += `\n\nWe believe this fee reflects the scope and complexity of the advice being provided and the value of a continuing professional relationship focused on helping you achieve your financial goals.`;

  // Service summary bullets
  const serviceSummaryItems = [];

  const discoveryOn = state.serviceLines['discovery'];
  const soaMeetings = (discoveryOn ? 1 : 0) + 1;
  if (soaMeetings > 0) {
    serviceSummaryItems.push(`${soaMeetings} meeting${soaMeetings > 1 ? 's' : ''} with your adviser (initial consultation and advice presentation)`);
  }
  if (hasStrategies) {
    serviceSummaryItems.push(`Comprehensive Statement of Advice covering ${strategyListText}`);
  } else {
    serviceSummaryItems.push(`Comprehensive Statement of Advice`);
  }
  if (scenarios > 0) {
    serviceSummaryItems.push(`Detailed financial modelling with ${scenarios} scenario ${scenarios > 1 ? 'analyses' : 'analysis'}`);
  }
  if (state.serviceLines['investmentResearch']) {
    serviceSummaryItems.push(`Investment product research and risk profiling`);
  }
  if (totalHoursApprox > 0) {
    serviceSummaryItems.push(`${totalHoursApprox} hours of research, analysis, and preparation`);
  }
  serviceSummaryItems.push(`Full compliance and quality review`);
  if (investmentAccounts > 0) {
    serviceSummaryItems.push(`Implementation across ${investmentAccounts} investment and superannuation account${investmentAccounts !== 1 ? 's' : ''}`);
  }
  if (reviewMeetings > 0) {
    serviceSummaryItems.push(`${reviewMeetings} review meeting${reviewMeetings !== 1 ? 's' : ''} per year`);
  }
  if (hasStrategies) {
    serviceSummaryItems.push(`Ongoing monitoring and adjustment of your financial strategies`);
  }

  return {
    // Service line details
    lineItems,
    strategyCount,
    totalBaseHours,
    baseFee,

    // Adjustments
    complexityCount,
    easeCount,
    complexityRate,
    easeRate,
    complexityAmount,
    easeAmount,
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
    totalReviewHours,
    costPerReview,
    reviewMeetings,
    accountKeepingFee,
    marginLendingFee,
    fixedOngoingFee,
    variableFee,
    effectiveFumRate,
    subscriptionAnnual,
    totalOngoingRounded,
    ongoingGst,
    totalOngoingInclGst,
    monthlyOngoing,

    // Output
    billingPlan,
    clientParagraph: state.clientParagraphOverride ?? clientParagraph,
    serviceSummaryItems,
  };
}

function formatCurrencyInline(value) {
  const n = Math.round(Number(value) || 0);
  return '$' + n.toLocaleString('en-AU');
}
