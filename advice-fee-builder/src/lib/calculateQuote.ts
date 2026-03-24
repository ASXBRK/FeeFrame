import { STRATEGIES, ADD_ONS, CORE_TASKS, REVIEW_TASKS, ANNUAL_TASKS, PREMIUM_FACTORS, DISCOUNT_FACTORS, getPremiumRate, getDiscountRate, formatStrategyList } from './serviceLines.js';
import { roundToNearest100 } from './formatters.js';

// Full repo audit 2026-03-23 — 3 bugs found and fixed. See audit report.
/**
 * Pure calculation engine for FeeQuote (Phase 1 rebuild).
 * Returns all computed values with no side effects.
 *
 * Audited 2026-03-21 — all calculation paths verified against 6 test scenarios.
 * Bugs fixed in prior audit:
 *   1. Relationship discount (state.relationshipDiscountPercent) was stored in state
 *      but never read here — now applied to combined discount rate.
 *   2. Total discount had no cap — now capped at 50% of base fee.
 *      discountCapApplied exported so Step 4 UI warning fires correctly.
 * Bugs fixed in 2026-03-23 audit:
 *   3. quoteDefaults.ts was missing relationshipDiscountEnabled/Percent — deepMerge
 *      in App.tsx only restores keys present in defaults, so saved relationship
 *      discount was silently lost on localStorage restore.
 *   4. Reducer paraplanner switch hardcoded 4 core task IDs; 'soaReviewPresentation'
 *      (added later as alwaysOn task) was omitted, so its hour overrides were never
 *      cleared when switching internal↔external.
 *   5. Tab2 Detailed Breakdown discount percentage label used discountRate (engagement
 *      factors only) but dollar amounts used effectiveDiscountRate (combined with
 *      relationship discount) — label was wrong whenever relationship discount active.
 */
export function calculateQuote(state: any) {
  const adviserRate = Number(state.adviserRate ?? 106);
  const paraplannerRate = Number(state.paraplannerRate ?? 62);
  const adminRate = Number(state.adminRate ?? 40);
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
    const enabled = task.alwaysOn ? true : (state.coreTasks?.[task.id] ?? task.defaultOn ?? false);
    if (!enabled) {
      return { ...task, fee: 0, totalHours: 0, hours: 0, adviserHoursUsed: 0, paraplannerHoursUsed: 0, adminHoursUsed: 0 };
    }
    if (isExternal && task.hideWhenExternal) {
      return { ...task, fee: 0, totalHours: 0, hours: 0, adviserHoursUsed: 0, paraplannerHoursUsed: 0, adminHoursUsed: 0 };
    }
    let multiplier = 1;
    if (task.perEntity) multiplier = totalEntities;
    if (task.perAdditionalScenario) multiplier = Math.max(0, scenarios - 1);
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
  const soaTrueCost = soaAdviserCost + soaParaplannerCost + soaAdminCost + soaExternalFee;

  // ── Step 4: Adjustments ────────────────────────────────────────────────────
  const premiumCount = PREMIUM_FACTORS.filter((_, i) => state.premiumFactors?.[i]).length;
  const discountCount = DISCOUNT_FACTORS.filter((_, i) => state.discountFactors?.[i]).length;
  const premiumRate = getPremiumRate(premiumCount);
  const discountRate = getDiscountRate(discountCount);

  // Relationship discount adds to the factor-based discount rate.
  // Bug fix: state.relationshipDiscountPercent was collected in the UI but never applied here.
  const relationshipDiscountRate = state.relationshipDiscountEnabled
    ? (Number(state.relationshipDiscountPercent) || 0) / 100
    : 0;
  const combinedDiscountRate = discountRate + relationshipDiscountRate;
  // Cap total discount at 50% of base fee to prevent negative fees.
  const discountCapApplied = combinedDiscountRate > 0.50;
  const effectiveDiscountRate = Math.min(0.50, combinedDiscountRate);

  const soaPremiumAuto = baseFee * premiumRate;
  const soaDiscountAuto = baseFee * effectiveDiscountRate;
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
  // implGross = raw implementation before discounts or commission ("sticker price")
  const implGross = implInvestmentFee + implInSpecieFee + implInsuranceFee;
  const implTotal = implGross; // backwards-compat alias — commission & discounts applied later

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
  const ongoingTrueCost = ongoingAdviserCost + ongoingParaplannerCost + ongoingAdminCost;

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

  // Ongoing adjustments — use same effectiveDiscountRate (incl. relationship discount + cap)
  const ongoingPremiumAuto = totalOngoingExGst * premiumRate;
  const ongoingDiscountAuto = totalOngoingExGst * effectiveDiscountRate;
  const ongoingPremium = state.premiumOngoingOverride ?? ongoingPremiumAuto;
  const ongoingDiscount = state.discountOngoingOverride ?? ongoingDiscountAuto;

  const ongoingCommissionOffset = Number(state.ongoingInsuranceCommissionOffset) || 0;

  // Gross ongoing (before commission) — used for display only
  const ongoingGrossCost = Math.max(0, totalOngoingExGst + ongoingPremium - ongoingDiscount);
  const ongoingGrossMargin = hasOngoing && applyMarginToOngoing && state.ongoingModel === 'fixedOnly'
    ? ongoingGrossCost * (marginPercent / 100)
    : 0;
  const ongoingRoundedBeforeCommission = hasOngoing
    ? roundToNearest100(ongoingGrossCost + ongoingGrossMargin)
    : 0;

  // Apply margin to ongoing AFTER adjustments, BEFORE rounding/GST
  const ongoingCostBeforeMargin = Math.max(0, totalOngoingExGst + ongoingPremium - ongoingDiscount - ongoingCommissionOffset);
  const ongoingMarginAmount = hasOngoing && applyMarginToOngoing && state.ongoingModel === 'fixedOnly'
    ? ongoingCostBeforeMargin * (marginPercent / 100)
    : 0;
  const ongoingMarginPercent = hasOngoing && applyMarginToOngoing && state.ongoingModel === 'fixedOnly' ? marginPercent : 0;

  const totalOngoingRounded = hasOngoing
    ? roundToNearest100(ongoingCostBeforeMargin + ongoingMarginAmount)
    : 0;
  const ongoingGst = totalOngoingRounded * 0.1;
  const totalOngoingInclGst = totalOngoingRounded + ongoingGst;
  const monthlyOngoing = totalOngoingInclGst / 12;

  // Implied hourly rates
  const impliedHourlyRateSoa = totalBaseHours > 0 ? adjustedFeeRounded / totalBaseHours : 0;
  const impliedHourlyRateOngoing = totalOngoingHours > 0 ? totalOngoingRounded / totalOngoingHours : 0;

  // ── Client incentives ─────────────────────────────────────────────────────
  const soaDiscountPercent = Number(state.soaDiscountPercent) || 0;
  const soaDiscountAmount = soaTotalInclGst * (soaDiscountPercent / 100);
  const soaIncentivisedFee = soaTotalInclGst - soaDiscountAmount;

  const implDiscountPercent = Number(state.implDiscountPercent) || 0;
  // Discount applied to gross impl (before commission)
  const implDiscountAmount = implGross * (implDiscountPercent / 100);
  const implIncentivisedFee = implGross - implDiscountAmount; // after discount, before commission

  const hasIncentives = soaDiscountPercent > 0 || implDiscountPercent > 0;
  const totalIncentiveSaving = soaDiscountAmount + implDiscountAmount;
  const totalIncentivisedInitialFees = soaIncentivisedFee + implIncentivisedFee; // before commission

  // Commission applied AFTER incentive discounts (to post-discount amounts)
  const commissionAppliedToImpl = Math.min(commissionOffset, implIncentivisedFee);
  const implAfterCommission = Math.max(0, implIncentivisedFee - commissionAppliedToImpl);
  const commissionOverflow = Math.max(0, commissionOffset - implIncentivisedFee);
  const soaAfterCommission = Math.max(0, soaIncentivisedFee - commissionOverflow);
  // Total initial fees = what the client actually pays
  const totalInitialFees = soaAfterCommission + implAfterCommission;

  // ── Billing plan ──────────────────────────────────────────────────────────
  const soaSplit = state.soaSplit || '50/50';
  const soaPhase2Method = state.soaPhase2Method || 'platform';
  const implMethod = state.implMethod || 'platform';
  const ongoingFrequency = state.ongoingFrequency || 'monthly';
  const ongoingMethod = state.ongoingMethod || 'directDebit';

  // Billing plan uses actual client-pay amounts (post-discount, post-commission)
  const soaFeeForPlan = soaAfterCommission;
  const billingPlan: any[] = [];

  if (soaSplit === '100/0') {
    billingPlan.push({ phase: 'SOA Fee', description: 'Full SOA fee on engagement', amount: soaFeeForPlan, when: 'On signing engagement letter', method: 'Invoice' });
  } else if (soaSplit === '0/100') {
    billingPlan.push({ phase: 'SOA Fee', description: 'Full SOA fee on presentation', amount: soaFeeForPlan, when: 'On SOA presentation', method: soaPhase2Method === 'invoice' ? 'Invoice' : 'Platform' });
  } else {
    billingPlan.push({ phase: 'SOA Fee — Phase 1', description: '50% of SOA fee', amount: soaFeeForPlan / 2, when: 'On signing engagement letter', method: 'Invoice' });
    billingPlan.push({ phase: 'SOA Fee — Phase 2', description: '50% of SOA fee', amount: soaFeeForPlan / 2, when: 'On SOA presentation', method: soaPhase2Method === 'invoice' ? 'Invoice' : 'Platform' });
  }

  if (implAfterCommission > 0) {
    billingPlan.push({ phase: 'Implementation', description: 'Implementation fee', amount: implAfterCommission, when: 'On implementation', method: implMethod === 'invoice' ? 'Invoice' : 'Platform' });
  } else if (implGross > 0) {
    const zeroReason = implDiscountPercent === 100 ? 'waived' : 'covered by commission';
    billingPlan.push({ phase: 'Implementation', description: `Implementation fee — ${zeroReason}`, amount: 0, when: 'On implementation', method: '—' });
  }

  if (hasOngoing && totalOngoingInclGst > 0) {
    const freqLabels: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', halfYearly: 'Half-yearly', annually: 'Annually' };
    const freqDivisors: Record<string, number> = { monthly: 12, quarterly: 4, halfYearly: 2, annually: 1 };
    const methodLabels: Record<string, string> = { directDebit: 'Direct Debit', platform: 'Platform', invoice: 'Invoice' };
    billingPlan.push({
      phase: 'Ongoing Service',
      description: `${freqLabels[ongoingFrequency] || 'Monthly'} ongoing fee`,
      amount: totalOngoingInclGst / (freqDivisors[ongoingFrequency] || 12),
      when: freqLabels[ongoingFrequency] || 'Monthly',
      method: methodLabels[ongoingMethod] || 'Direct Debit',
      annual: totalOngoingInclGst,
    });
  }

  // ── Client letter ─────────────────────────────────────────────────────────
  const allStrategies = [...STRATEGIES, ...ADD_ONS];
  const allEnabled = { ...(state.strategies || {}), ...(state.addOns || {}) };
  const strategyListText = formatStrategyList(allStrategies, allEnabled);
  const clientName = state.clientName?.trim() || '';
  const hasStrategies = allStrategies.some(s => allEnabled[s.id]);
  const hasImpl = implGross > 0;

  const isCouple = !!state.isCouple;
  const lifeStage = state.lifeStage || 'accumulation';
  const clientStatus = state.clientStatus || 'new';
  const SEP = '──────────────────────────────────────────────────────';

  const greeting = clientName
    ? `Dear ${clientName},`
    : (isCouple ? 'Dear Clients,' : 'Dear Client,');

  let clientParagraph = greeting + '\n\n';

  // Opening
  clientParagraph += `Thank you for meeting with us to discuss your financial situation. We are pleased to outline our advice fees and the services we will provide.\n\n`;

  // Life stage context
  if (lifeStage === 'accumulation') {
    clientParagraph += `As you continue to build your wealth, our advice will focus on positioning you to achieve your financial goals through strategic planning and disciplined execution.\n\n`;
  } else if (lifeStage === 'preRetirement') {
    clientParagraph += `As you approach retirement, our advice will focus on ensuring you are well-positioned to transition into retirement with confidence and financial security.\n\n`;
  } else if (lifeStage === 'retirement') {
    clientParagraph += `As you enjoy retirement, our advice will focus on ensuring your wealth continues to support your lifestyle and provide security for the years ahead.\n\n`;
  }

  // Scope of advice
  clientParagraph += `Based on our initial discussion, we will prepare a comprehensive Statement of Advice`;
  if (hasStrategies) clientParagraph += ` covering ${strategyListText}`;
  clientParagraph += `.`;
  if (isCouple) clientParagraph += ` This will be tailored to both your individual and joint financial objectives.`;
  clientParagraph += `\n\nOur advice process involves a thorough analysis of your current financial position, the development of tailored strategies designed to meet your specific goals, and clear recommendations backed by detailed research and modelling. Every recommendation we make is subject to a rigorous compliance and quality review to ensure it meets the highest professional standards and is in your best interest.`;
  if (clientStatus === 'new') {
    clientParagraph += `\n\nAs part of this engagement, we will take the time to understand your complete financial picture — your assets, liabilities, income, expenses, insurances, estate planning, and long-term objectives. This foundational work ensures our advice is built on a thorough understanding of where you are today and where you want to be.`;
  } else {
    clientParagraph += `\n\nAs an existing client of our firm, we have the benefit of an established understanding of your financial position and goals. This allows us to build efficiently on the work we have done together previously and focus on advancing your strategies.`;
  }
  clientParagraph += '\n\n';

  // Initial fee table
  // SOA and Impl shown at post-incentive (pre-commission) amounts; commission shown as deduction
  const soaTableFee = soaIncentivisedFee;   // incl GST, post-incentive discount
  const implTableFee = implIncentivisedFee; // incl GST, post-incentive discount
  const soaFeeExGst = soaTableFee / 1.1;
  const soaFeeGst = soaTableFee - soaFeeExGst;
  const implFeeExGst = implTableFee / 1.1;
  const implFeeGst = implTableFee - implFeeExGst;

  clientParagraph += `INITIAL FEES\n${SEP}\n`;
  clientParagraph += `${''.padEnd(30)}${'Excl GST'.padStart(9)}  ${'GST'.padStart(7)}  Incl GST\n`;
  clientParagraph += `${'SOA Preparation Fee'.padEnd(30)}${fmtCcy(soaFeeExGst).padStart(9)}  ${fmtCcy(soaFeeGst).padStart(7)}  ${fmtCcy(soaTableFee)}\n`;
  if (hasImpl) {
    clientParagraph += `${'Implementation Fee'.padEnd(30)}${fmtCcy(implFeeExGst).padStart(9)}  ${fmtCcy(implFeeGst).padStart(7)}  ${fmtCcy(implTableFee)}\n`;
  }
  if (commissionOffset > 0) {
    clientParagraph += `${'Less: Insurance Commission'.padEnd(48)}-${fmtCcy(commissionOffset)}\n`;
  }
  clientParagraph += `${SEP}\n`;
  clientParagraph += `${'TOTAL INITIAL FEES'.padEnd(48)}${fmtCcy(totalInitialFees)}\n`;
  clientParagraph += `${SEP}\n\n`;

  // Client incentives
  if (hasIncentives) {
    if (soaDiscountPercent > 0) {
      clientParagraph += `As you are proceeding with an ongoing service arrangement, we are pleased to offer a ${soaDiscountPercent}% reduction on the SOA preparation fee, reducing your initial fee from ${fmtCcy(soaTotalInclGst)} to ${fmtCcy(soaIncentivisedFee)} (including GST).\n\n`;
    }
    if (implDiscountPercent === 100) {
      clientParagraph += `Your implementation fees will be waived as part of your ongoing service arrangement.\n\n`;
    } else if (implDiscountPercent >= 25 && implDiscountPercent <= 75) {
      clientParagraph += `We are also offering a ${implDiscountPercent}% reduction on implementation fees, reducing this from ${fmtCcy(implGross)} to ${fmtCcy(implIncentivisedFee)}.\n\n`;
    }
  }

  // Relationship discount
  if (state.relationshipDiscountEnabled) {
    const relPct = Number(state.relationshipDiscountPercent) || 10;
    clientParagraph += `Given your relationship with our firm, we are pleased to offer a ${relPct}% discount on our standard fees. This is reflected in the amounts above.\n\n`;
  }

  // Ongoing service
  if (hasOngoing && totalOngoingInclGst > 0) {
    clientParagraph += `In addition to the initial advice, we will provide ongoing support to ensure your financial strategies remain aligned with your goals as your life evolves. Financial planning is not a one-off event — your circumstances, the markets, legislation, and your personal goals will all change over time. Our ongoing service ensures you always have a professional in your corner, proactively managing these changes on your behalf.\n\n`;

    const freqLabelsLetter: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', halfYearly: 'Half-yearly', annually: 'Annually' };
    const freqDivisorsLetter: Record<string, number> = { monthly: 12, quarterly: 4, halfYearly: 2, annually: 1 };
    const freqLabelLetter = freqLabelsLetter[ongoingFrequency] || 'Monthly';
    const freqDivisorLetter = freqDivisorsLetter[ongoingFrequency] || 12;
    const freqAmountLetter = totalOngoingInclGst / freqDivisorLetter;

    clientParagraph += `ONGOING FEES\n${SEP}\n`;
    clientParagraph += `${'Annual Service Fee (incl GST)'.padEnd(42)}${fmtCcy(totalOngoingInclGst)}\n`;
    if (ongoingFrequency !== 'annually') {
      clientParagraph += `${(freqLabelLetter + ' equivalent').padEnd(42)}${fmtCcy(freqAmountLetter)}\n`;
    }
    if (ongoingCommissionOffset > 0) {
      clientParagraph += `${'Less: Ongoing Insurance Commission'.padEnd(42)}-${fmtCcy(ongoingCommissionOffset)}\n`;
      clientParagraph += `${'Net Annual Fee'.padEnd(42)}${fmtCcy(totalOngoingInclGst - ongoingCommissionOffset)}\n`;
    }
    clientParagraph += `${SEP}\n\n`;

    const freqWordMap: Record<string, string> = { monthly: 'monthly', quarterly: 'each quarter', halfYearly: 'every six months', annually: 'annually' };
    const freqWord = freqWordMap[ongoingFrequency] || 'monthly';

    clientParagraph += `Your ongoing service includes:\n\n`;
    clientParagraph += `  • ${reviewMeetings} scheduled review meeting${reviewMeetings !== 1 ? 's' : ''} per year — we will meet with you ${freqWord} to review your progress, assess any changes in your circumstances, and adjust your strategies accordingly\n`;
    clientParagraph += `  • Proactive strategy monitoring — between meetings, we actively monitor your ${hasStrategies ? strategyListText : 'financial strategies'} to ensure everything remains on track and identify opportunities or risks as they arise\n`;
    clientParagraph += `  • Access to your adviser — you are not limited to scheduled meetings. Whenever a life event occurs — a career change, property purchase, inheritance, health event, or any financial decision — we are a phone call away to provide guidance\n`;
    clientParagraph += `  • Legislative and market updates — tax laws, superannuation rules, and financial markets are constantly changing. We keep across these developments and proactively notify you when changes affect your situation\n`;
    clientParagraph += `  • Annual compliance and documentation review — we ensure all your structures, insurances, nominations, and estate planning documents remain current and compliant\n`;
    clientParagraph += `  • Coordination with your other professionals — where relevant, we work alongside your accountant, solicitor, and other advisers to ensure your financial affairs are well-coordinated\n`;
    if (isCouple) {
      clientParagraph += `\nAs a couple, we understand that your financial goals may evolve both individually and jointly. Our ongoing service is designed to support both of you, ensuring your shared objectives stay on track while also addressing your individual needs.\n`;
    }
    clientParagraph += '\n';
  } else {
    clientParagraph += `This engagement covers the preparation and implementation of your initial advice. We encourage you to consider an ongoing advisory relationship — financial planning delivers the greatest value when your strategies are actively monitored and adjusted over time. Should you wish to discuss ongoing services in the future, we would welcome the conversation.\n\n`;
  }

  // Billing schedule
  clientParagraph += `BILLING SCHEDULE\n${SEP}\n`;
  clientParagraph += `${'Phase'.padEnd(26)}${'Amount'.padEnd(14)}${'When'.padEnd(32)}Method\n`;
  for (const item of billingPlan) {
    const phaseStr = (item.phase as string).padEnd(26);
    const amtStr = (item.amount > 0 ? fmtCcy(item.amount) : 'Nil').padEnd(14);
    const whenStr = (item.when as string).padEnd(32);
    clientParagraph += `${phaseStr}${amtStr}${whenStr}${item.method}\n`;
  }
  clientParagraph += `${SEP}\n\n`;

  // Entity allocation
  if (state.entityAllocationEnabled && ((state.entityAllocations as any[]) || []).filter((r: any) => r.name || r.type).length > 0) {
    const entityAllocRows = ((state.entityAllocations as any[]) || []).filter((r: any) => r.name || r.type);
    const isPctAlloc = (state.entityAllocationType || 'percentage') === 'percentage';
    const ENTITY_TYPE_LABELS: Record<string, string> = {
      individual: 'Individual', joint: 'Joint', superannuation: 'Superannuation',
      smsf: 'SMSF', familyTrust: 'Family Trust', company: 'Company',
      investmentBond: 'Investment Bond', other: 'Other',
    };
    clientParagraph += `FEE ALLOCATION\n${SEP}\n`;
    clientParagraph += `${'Entity'.padEnd(26)}${'Type'.padEnd(22)}${'Initial'.padEnd(18)}Ongoing\n`;
    for (const ea of entityAllocRows) {
      const nameStr = ((ea.name || 'Unknown') as string).padEnd(26);
      const typeStr = (ENTITY_TYPE_LABELS[ea.type] || ea.type || '—').padEnd(22);
      let initStr: string;
      let ongStr: string;
      if (isPctAlloc) {
        const initAmt = totalInitialFees * ((Number(ea.soaAllocation) || 0) / 100);
        const ongAmt = totalOngoingInclGst * ((Number(ea.ongoingAllocation) || 0) / 100);
        initStr = `${ea.soaAllocation}% (${fmtCcy(initAmt)})`;
        ongStr = `${ea.ongoingAllocation}% (${fmtCcy(ongAmt)})`;
      } else {
        initStr = fmtCcy(Number(ea.soaAllocation) || 0);
        ongStr = fmtCcy(Number(ea.ongoingAllocation) || 0);
      }
      clientParagraph += `${nameStr}${typeStr}${initStr.padEnd(18)}${ongStr}\n`;
    }
    clientParagraph += `${SEP}\n\n`;
  }

  // Closing
  clientParagraph += `We are committed to providing you with advice that is clear, considered, and genuinely in your best interest. Our goal is not just to deliver a document, but to build a lasting professional relationship that supports you and your family through every stage of your financial life.\n\n`;
  clientParagraph += `If you have any questions about these fees, the services outlined, or anything else, please do not hesitate to reach out. We are here to help.\n\n`;
  clientParagraph += `We look forward to working with you.\n\nKind regards`;

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
  serviceSummaryItems.push(`Full compliance and quality review`);
  if (investmentAccounts > 0) serviceSummaryItems.push(`Implementation across ${investmentAccounts} investment and superannuation account${investmentAccounts !== 1 ? 's' : ''}`);
  if (hasOngoing && reviewMeetings > 0) serviceSummaryItems.push(`${reviewMeetings} review meeting${reviewMeetings !== 1 ? 's' : ''} per year`);
  if (hasOngoing && hasStrategies) serviceSummaryItems.push(`Ongoing monitoring and adjustment of your financial strategies`);

  // ── Discount summary ──────────────────────────────────────────────────────
  const totalInitialDiscounts = soaDiscount + soaDiscountAmount + implDiscountAmount
    + Math.min(commissionOffset, implGross + soaTotalInclGst);
  const totalOngoingDiscounts = ongoingDiscount + ongoingCommissionOffset;
  const hasAnyDiscount = soaDiscount > 0 || soaDiscountPercent > 0 || implDiscountPercent > 0
    || commissionOffset > 0 || ongoingDiscount > 0 || ongoingCommissionOffset > 0;

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
    soaTrueCost,

    // Ongoing cost components
    ongoingAdviserCost,
    ongoingParaplannerCost,
    ongoingAdminCost,
    ongoingTrueCost,

    // Adjustments
    premiumCount,
    discountCount,
    premiumRate,
    discountRate,
    relationshipDiscountRate,
    combinedDiscountRate,
    effectiveDiscountRate,
    discountCapApplied,
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
    commissionAppliedToImpl,
    commissionOverflow,
    implGross,
    implTotal,       // = implGross (backwards-compat alias)
    implAfterCommission,
    soaAfterCommission,
    totalInitialFees,

    // Ongoing
    ongoingCommissionOffset,
    ongoingRoundedBeforeCommission,
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

    // Discount summary
    totalInitialDiscounts,
    totalOngoingDiscounts,
    hasAnyDiscount,

    // Client incentives
    soaDiscountPercent,
    soaDiscountAmount,
    soaIncentivisedFee,
    implDiscountPercent,
    implDiscountAmount,
    implIncentivisedFee,
    totalIncentivisedInitialFees,
    totalIncentiveSaving,
    hasIncentives,

    // Output
    billingPlan,
    soaSplit,
    ongoingFrequency,
    ongoingMethod,
    entityAllocations: state.entityAllocationEnabled ? (state.entityAllocations || []) : [],
    entityAllocationEnabled: !!state.entityAllocationEnabled,
    entityAllocationType: state.entityAllocationType || 'percentage',
    clientParagraph: state.clientParagraphOverride ?? clientParagraph,
    serviceSummaryItems,
  };
}

function fmtCcy(value: number): string {
  const n = Math.round(Number(value) || 0);
  return '$' + n.toLocaleString('en-AU');
}
