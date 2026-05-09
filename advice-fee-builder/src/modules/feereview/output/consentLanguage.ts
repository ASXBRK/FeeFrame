// Standard consent text templates for the FeeReview document.
// Placeholders use [SQUARE_BRACKET] form and are replaced via interpolate().

export const CONSENT_INTRO =
  'Under the Corporations Act 2001 (as amended by the Treasury Laws Amendment (Delivering Better Financial Outcomes and Other Measures) Act 2024), we are required to obtain your written consent annually to renew our ongoing fee arrangement and to deduct fees from your account. This document sets out the services we will provide, the fees we will charge, and how those fees will be deducted over the next 12 months.';

export const OFA_CONSENT =
  'I/We consent to: a) the renewal of the ongoing fee arrangement between [CLIENT_NAME] and [PRACTICE_NAME] for a further 12 months from the date of this consent; and b) the fees set out in this document being charged for the services described.';

export const DEDUCTION_CONSENT_INTRO =
  'I/We consent to [PRACTICE_NAME] arranging the deduction of the fees set out in this document from the following account(s):';

export const DEDUCTION_CONSENT_OUTRO =
  'I/We understand that:\n\n- I/We may withdraw this consent at any time by writing to [PRACTICE_NAME].\n- This consent expires 150 days after the reference date specified above unless renewed.';

export const WITHDRAWAL_LANGUAGE =
  'You may withdraw this consent at any time by contacting us in writing at [ADVISER_EMAIL]. If you withdraw consent, the ongoing fee arrangement will terminate, and no further fees will be charged or deducted.';

export const CONSENT_DURATION =
  'This consent applies for the period ending [REFERENCE_DATE]. It expires 150 days after this date if not renewed.';

export const FOOTER_DISCLAIMER =
  'Draft document — verify against your licensee’s requirements before issuing to client. FeeFrame does not provide legal or compliance advice.';

export type ConsentVars = {
  CLIENT_NAME?: string;
  PRACTICE_NAME?: string;
  ADVISER_EMAIL?: string;
  REFERENCE_DATE?: string;
};

export function interpolate(template: string, vars: ConsentVars): string {
  return template.replace(/\[([A-Z_]+)\]/g, (match, key: string) => {
    const v = (vars as Record<string, string | undefined>)[key];
    return v != null && v !== '' ? v : match;
  });
}
