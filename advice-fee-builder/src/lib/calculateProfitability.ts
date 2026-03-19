/**
 * Pure calculation engine for FeeAnalysis.
 * Returns all computed profitability metrics with no side effects.
 */
import { colors } from '../brand';

export function calculateProfitability(state) {
  const adviserRate = Number(state.adviserRate) || 0;
  const paraplannerRate = Number(state.paraplannerRate) || 0;
  const adminRate = Number(state.adminRate) || 0;

  const soaFee = Number(state.soaFeeExGst) || 0;
  const implFee = Number(state.implFeeExGst) || 0;
  const ongoingFee = Number(state.ongoingFeeExGst) || 0;

  const greenThreshold = Number(state.greenThreshold) || 350;
  const amberThreshold = Number(state.amberThreshold) || 250;

  // ── SOA Cost ──────────────────────────────────────────────────────────────
  const soaTasks = state.soaTasks || [];

  let soaAdviserHours = 0;
  let soaParaplannerHours = 0;
  let soaAdminHours = 0;

  soaTasks.forEach(task => {
    const h = Number(task.hours) || 0;
    if (task.who === 'adviser') soaAdviserHours += h;
    else if (task.who === 'paraplanner') soaParaplannerHours += h;
    else if (task.who === 'admin') soaAdminHours += h;
  });

  const soaAdviserCost = soaAdviserHours * adviserRate;
  const soaAdminCost = soaAdminHours * adminRate;

  let soaParaplannerCost;
  if (state.soaParaplanningExternal) {
    soaParaplannerCost = Number(state.soaParaplanningExternalFee) || 0;
  } else {
    soaParaplannerCost = soaParaplannerHours * paraplannerRate;
  }

  const fixedCosts = (Number(state.licenseeFees) || 0) +
    (Number(state.softwareCosts) || 0) +
    (Number(state.piInsurance) || 0) +
    (Number(state.otherDisbursements) || 0);

  const soaTotalCost = soaAdviserCost + soaParaplannerCost + soaAdminCost + fixedCosts;
  const soaMarginDollar = soaFee - soaTotalCost;
  const soaMarginPercent = soaFee > 0 ? soaMarginDollar / soaFee : 0;

  // Implied hourly rate uses adviser-only hours (paraplanning/admin are costs)
  const soaImpliedRate = soaAdviserHours > 0 ? soaFee / soaAdviserHours : 0;

  // ── Ongoing Cost ─────────────────────────────────────────────────────────
  const ongoingTasks = state.ongoingTasks || [];

  let ongoingAdviserHours = 0;
  let ongoingParaplannerHours = 0;
  let ongoingAdminHours = 0;

  ongoingTasks.forEach(task => {
    const h = Number(task.hours) || 0;
    if (task.who === 'adviser') ongoingAdviserHours += h;
    else if (task.who === 'paraplanner') ongoingParaplannerHours += h;
    else if (task.who === 'admin') ongoingAdminHours += h;
  });

  const ongoingAdviserCost = ongoingAdviserHours * adviserRate;
  const ongoingAdminCost = ongoingAdminHours * adminRate;

  let ongoingParaplannerCost;
  if (state.ongoingParaplanningExternal) {
    ongoingParaplannerCost = Number(state.ongoingParaplanningExternalFee) || 0;
  } else {
    ongoingParaplannerCost = ongoingParaplannerHours * paraplannerRate;
  }

  const ongoingTotalCost = ongoingAdviserCost + ongoingParaplannerCost + ongoingAdminCost + fixedCosts;
  const ongoingMarginDollar = ongoingFee - ongoingTotalCost;
  const ongoingMarginPercent = ongoingFee > 0 ? ongoingMarginDollar / ongoingFee : 0;

  const ongoingImpliedRate = ongoingAdviserHours > 0 ? ongoingFee / ongoingAdviserHours : 0;

  // ── Colour status ─────────────────────────────────────────────────────────
  function rateStatus(rate) {
    if (rate >= greenThreshold) return 'green';
    if (rate >= amberThreshold) return 'amber';
    return 'red';
  }

  const soaRateStatus = rateStatus(soaImpliedRate);
  const ongoingRateStatus = rateStatus(ongoingImpliedRate);

  // ── Bar chart segments ────────────────────────────────────────────────────
  // Each segment: { label, value, color }
  const soaSegments = [
    { label: 'Adviser Time', value: soaAdviserCost, color: colors.dark },
    { label: 'Paraplanning', value: soaParaplannerCost, color: colors.teal },
    { label: 'Admin', value: soaAdminCost, color: colors.mid },
    { label: 'Fixed Costs', value: fixedCosts, color: colors.darkSurface },
    { label: soaMarginDollar >= 0 ? 'Margin' : 'Loss', value: Math.abs(soaMarginDollar), color: soaMarginDollar >= 0 ? colors.healthy : colors.risk },
  ];

  const ongoingSegments = [
    { label: 'Adviser Time', value: ongoingAdviserCost, color: colors.dark },
    { label: 'Paraplanning', value: ongoingParaplannerCost, color: colors.teal },
    { label: 'Admin', value: ongoingAdminCost, color: colors.mid },
    { label: 'Fixed Costs', value: fixedCosts, color: colors.darkSurface },
    { label: ongoingMarginDollar >= 0 ? 'Margin' : 'Loss', value: Math.abs(ongoingMarginDollar), color: ongoingMarginDollar >= 0 ? colors.healthy : colors.risk },
  ];

  // ── Warning flags ─────────────────────────────────────────────────────────
  const warnings = [];

  if (soaImpliedRate > 0 && soaImpliedRate < amberThreshold) {
    warnings.push({
      type: 'red',
      message: `Your implied hourly rate of $${Math.round(soaImpliedRate)} (initial SOA) is below $${amberThreshold}. You may be significantly undercharging for this engagement.`,
    });
  }

  if (soaMarginDollar < 0) {
    warnings.push({
      type: 'red',
      message: `Your total cost of $${Math.round(soaTotalCost).toLocaleString('en-AU')} exceeds the SOA fee of $${Math.round(soaFee).toLocaleString('en-AU')}. You are losing $${Math.abs(Math.round(soaMarginDollar)).toLocaleString('en-AU')} on this engagement.`,
    });
  }

  if (ongoingMarginDollar < 0) {
    warnings.push({
      type: 'red',
      message: `Your total cost of $${Math.round(ongoingTotalCost).toLocaleString('en-AU')} exceeds the ongoing fee of $${Math.round(ongoingFee).toLocaleString('en-AU')}. You are losing $${Math.abs(Math.round(ongoingMarginDollar)).toLocaleString('en-AU')} per year on this client.`,
    });
  }

  if (ongoingImpliedRate > 0 && ongoingImpliedRate < amberThreshold) {
    warnings.push({
      type: 'red',
      message: `Your implied hourly rate of $${Math.round(ongoingImpliedRate)} (ongoing) is below $${amberThreshold}. Consider increasing the ongoing fee.`,
    });
  }

  const soaParaTotal = soaParaplannerCost;
  if (soaTotalCost > 0 && soaParaTotal / soaTotalCost > 0.40) {
    warnings.push({
      type: 'amber',
      message: `Paraplanning represents ${Math.round(soaParaTotal / soaTotalCost * 100)}% of your total SOA cost. Consider whether external paraplanning would be more cost-effective.`,
    });
  }

  if (ongoingFee > 0 && ongoingMarginPercent < 0.15 && ongoingMarginPercent >= 0) {
    warnings.push({
      type: 'amber',
      message: `Your ongoing margin is only ${Math.round(ongoingMarginPercent * 100)}%. Consider reviewing the scope of service or increasing the ongoing fee.`,
    });
  }

  if (soaRateStatus === 'green' && ongoingRateStatus === 'green') {
    warnings.push({
      type: 'green',
      message: `Your implied rates of $${Math.round(soaImpliedRate)}/hr (initial) and $${Math.round(ongoingImpliedRate)}/hr (ongoing) are healthy. This engagement is well-priced.`,
    });
  }

  return {
    // SOA
    soaAdviserHours,
    soaParaplannerHours,
    soaAdminHours,
    soaAdviserCost,
    soaParaplannerCost,
    soaAdminCost,
    soaTotalCost,
    soaMarginDollar,
    soaMarginPercent,
    soaImpliedRate,
    soaRateStatus,
    soaSegments,

    // Ongoing
    ongoingAdviserHours,
    ongoingParaplannerHours,
    ongoingAdminHours,
    ongoingAdviserCost,
    ongoingParaplannerCost,
    ongoingAdminCost,
    ongoingTotalCost,
    ongoingMarginDollar,
    ongoingMarginPercent,
    ongoingImpliedRate,
    ongoingRateStatus,
    ongoingSegments,

    fixedCosts,
    warnings,
  };
}
