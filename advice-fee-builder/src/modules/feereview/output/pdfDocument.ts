import type { FeeReviewState } from '../types';
import { DEFAULT_SERVICES } from '../data/servicesLibrary';
import {
  CONSENT_INTRO,
  CONSENT_DURATION,
  OFA_CONSENT,
  DEDUCTION_CONSENT_INTRO,
  DEDUCTION_CONSENT_OUTRO,
  WITHDRAWAL_LANGUAGE,
  FOOTER_DISCLAIMER,
  interpolate,
} from './consentLanguage';

function escapeHtml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatAud(value: number): string {
  if (!Number.isFinite(value)) return '$0';
  return '$' + Math.round(value).toLocaleString('en-AU');
}

function formatDateLong(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function describeAccountType(type: FeeReviewState['accounts'][number]['type']): string {
  switch (type) {
    case 'superannuation': return 'Superannuation';
    case 'investment':     return 'Investment';
    case 'cash':           return 'Cash management';
    case 'other':          return 'Other';
  }
}

function describeFee(state: FeeReviewState, indexedFee: number | null): string {
  if (state.feeStructure === 'fixed') {
    const amt = indexedFee ?? state.fixedAmount;
    return `${formatAud(amt)} per year, charged ${state.fixedFrequency}.`;
  }
  if (state.feeStructure === 'percentage') {
    const fua = state.fuaBalance > 0
      ? ` Calculated on a current FUA balance of ${formatAud(state.fuaBalance)}.`
      : '';
    return `${state.percentageRate}% of funds under advice (FUA), charged ${state.percentageFrequency}.${fua}`;
  }
  return `${formatAud(state.subscriptionMonthly)} per month subscription.`;
}

function buildServicesList(ids: ReadonlyArray<string>, custom: string): string[] {
  const fromLibrary = DEFAULT_SERVICES.filter(s => ids.includes(s.id)).map(s => s.label);
  const customLines = custom
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  return [...fromLibrary, ...customLines];
}

export function buildPdfHtml(state: FeeReviewState): string {
  const practiceName = state.practiceName.trim() || 'Practice';
  const clientName = state.clientName.trim() || 'Client';
  const referenceDateLong = formatDateLong(state.referenceDate);
  const indexedFee = state.indexationEnabled && state.indexedFeeOverride != null
    ? state.indexedFeeOverride
    : null;

  const e = escapeHtml;
  const vars = {
    CLIENT_NAME: e(clientName),
    PRACTICE_NAME: e(practiceName),
    ADVISER_EMAIL: e(state.adviserEmail.trim()),
    REFERENCE_DATE: e(referenceDateLong),
  };

  const nextServices = buildServicesList(state.selectedServiceIds, state.customServices);
  const retroServices = buildServicesList(state.retrospectiveServiceIds, state.retrospectiveCustomServices);

  const adviserBlock = `
    <p><strong>Adviser:</strong> ${e(state.adviserName)}${state.arNumber.trim() ? ` (Authorised Representative ${e(state.arNumber.trim())})` : ''}</p>
    <p><strong>Licensee:</strong> ${e(state.licenseeName)} (AFSL ${e(state.afslNumber)})</p>
    <p><strong>Practice:</strong> ${e(state.practiceName)}<br/>${e(state.practiceAddress).replace(/\n/g, '<br/>')}</p>
    <p><strong>Contact:</strong> ${e(state.adviserEmail)}${state.adviserPhone.trim() ? ` &middot; ${e(state.adviserPhone)}` : ''}</p>
  `;

  const clientBlock = `
    <p><strong>Client:</strong> ${e(clientName)}</p>
    ${state.clientReference.trim() ? `<p><strong>Reference:</strong> ${e(state.clientReference)}</p>` : ''}
  `;

  const servicesListHtml = nextServices.length > 0
    ? `<ul>${nextServices.map(s => `<li>${e(s)}</li>`).join('')}</ul>`
    : '<p><em>No services specified.</em></p>';

  const feeDescription = describeFee(state, indexedFee);
  const insuranceLine = state.insuranceCommissionsEnabled && state.insuranceCommissionsAmount > 0
    ? `<p>Estimated insurance commissions of ${formatAud(state.insuranceCommissionsAmount)} per year may also be payable to the practice from your insurance providers. These are paid by the insurer and do not directly increase your premiums.</p>`
    : '';

  const accountsRows = state.accounts
    .filter(a => a.provider.trim() && a.reference.trim())
    .map(a => `
      <tr>
        <td>${e(a.provider)}</td>
        <td>${describeAccountType(a.type)}</td>
        <td>${e(a.reference)}</td>
      </tr>
    `).join('');

  const retrospectiveBlock = state.retrospectiveEnabled
    ? `
      <h2>Past 12 months — what you paid and received</h2>
      <p><strong>Total fees paid:</strong> ${formatAud(state.retrospectiveFeesPaid)}</p>
      ${retroServices.length > 0
        ? `<p><strong>Services delivered:</strong></p><ul>${retroServices.map(s => `<li>${e(s)}</li>`).join('')}</ul>`
        : ''}
    `
    : '';

  const signatureBlock = `
    <div class="sig-grid">
      <div class="sig-box">
        <p><strong>Client signature</strong></p>
        <p>Name: ${e(clientName)}</p>
        <p class="line">Signature:</p>
        <p class="line">Date:</p>
      </div>
      <div class="sig-box">
        <p><strong>Adviser signature</strong></p>
        <p>Name: ${e(state.adviserName)}</p>
        <p class="line">Signature:</p>
        <p class="line">Date:</p>
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Annual Fee Consent and Renewal — ${e(clientName)}</title>
  <style>
    @page { margin: 2.5cm; size: A4; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.55; color: #111827; max-width: 100%; }
    .header { margin-bottom: 1.6em; padding-bottom: 1em; border-bottom: 2px solid #0d9488; }
    .header .practice { font-size: 18pt; font-weight: 700; color: #0d9488; margin: 0 0 4px 0; letter-spacing: -0.3px; }
    .header h1 { font-size: 14pt; font-weight: 600; color: #111827; margin: 0 0 6px 0; }
    .header .meta { font-size: 9pt; color: #6b7280; }
    h2 { font-size: 12pt; font-weight: 700; color: #111827; margin: 1.6em 0 0.5em; padding-bottom: 0.25em; border-bottom: 1px solid #e2e8f0; }
    p { margin: 0.5em 0; }
    ul { margin: 0.5em 0 0.5em 1.2em; padding: 0; }
    li { margin: 0.2em 0; }
    table.accounts { width: 100%; border-collapse: collapse; margin: 0.5em 0 1em; font-size: 10.5pt; }
    table.accounts th, table.accounts td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
    table.accounts th { background: #f8fafc; font-weight: 600; color: #374151; }
    .consent-block { background: #f8fafc; border-left: 3px solid #0d9488; padding: 0.8em 1em; margin: 1em 0; font-size: 10.5pt; }
    .sig-grid { display: flex; gap: 24px; margin-top: 2em; page-break-inside: avoid; }
    .sig-box { flex: 1; border: 1px solid #e2e8f0; padding: 14px 16px; }
    .sig-box .line { border-bottom: 1px solid #9ca3af; margin: 1.4em 0 0; padding-bottom: 0.2em; min-height: 1.4em; }
    .footer { margin-top: 2.5em; padding-top: 0.8em; border-top: 1px solid #e2e8f0; font-size: 8.5pt; color: #6b7280; text-align: center; }
    .footer strong { color: #92400e; }
    .whitespace-pre { white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="header">
    <p class="practice">${e(practiceName)}</p>
    <h1>Annual Fee Consent and Renewal</h1>
    <p class="meta">Reference date: <strong>${e(referenceDateLong)}</strong></p>
  </div>

  <h2>Adviser and licensee details</h2>
  ${adviserBlock}

  <h2>Client details</h2>
  ${clientBlock}

  <h2>Why we are seeking your consent</h2>
  <p>${e(CONSENT_INTRO)}</p>

  <h2>Services we will provide over the next 12 months</h2>
  ${servicesListHtml}

  <h2>Fees for the next 12 months</h2>
  <p>${e(feeDescription)}</p>
  ${insuranceLine}

  <h2>How fees will be deducted</h2>
  ${accountsRows
    ? `<table class="accounts"><thead><tr><th>Provider</th><th>Account type</th><th>Reference</th></tr></thead><tbody>${accountsRows}</tbody></table>`
    : '<p><em>No deduction accounts specified.</em></p>'}
  <p>Fees will be deducted in accordance with your provider’s standard processes.</p>

  <h2>How long this consent lasts</h2>
  <p>${e(interpolate(CONSENT_DURATION, vars))}</p>

  <h2>Withdrawing your consent</h2>
  <p>${e(interpolate(WITHDRAWAL_LANGUAGE, vars))}</p>

  ${retrospectiveBlock}

  <h2>Consent — Renewal of ongoing fee arrangement</h2>
  <div class="consent-block">${e(interpolate(OFA_CONSENT, vars))}</div>

  <h2>Consent — Fee deduction</h2>
  <div class="consent-block">
    <p>${e(interpolate(DEDUCTION_CONSENT_INTRO, vars))}</p>
    <p class="whitespace-pre">${e(interpolate(DEDUCTION_CONSENT_OUTRO, vars))}</p>
  </div>

  ${signatureBlock}

  <div class="footer">
    <strong>${e(FOOTER_DISCLAIMER)}</strong>
  </div>
</body>
</html>`;
}

export function triggerPdfDownload(state: FeeReviewState): boolean {
  try {
    const html = buildPdfHtml(state);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) {
      document.body.removeChild(iframe);
      return false;
    }
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1000);
    }, 500);
    return true;
  } catch {
    return false;
  }
}
