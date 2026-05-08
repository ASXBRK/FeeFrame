export type FeeStructure = 'fixed' | 'percentage' | 'subscription';

export type Frequency = 'annual' | 'quarterly' | 'monthly';

export type AccountType = 'superannuation' | 'investment' | 'cash' | 'other';

export interface AccountEntry {
  id: string;
  provider: string;
  type: AccountType;
  reference: string;
}

export interface FeeReviewState {
  // Adviser / practice
  adviserName: string;
  arNumber: string;
  licenseeName: string;
  afslNumber: string;
  practiceName: string;
  practiceAddress: string;
  adviserEmail: string;
  adviserPhone: string;

  // Client
  clientName: string;
  clientReference: string;

  // Reference date (ISO yyyy-mm-dd)
  referenceDate: string;

  // Fees next 12 months
  feeStructure: FeeStructure;
  fixedAmount: number;
  fixedFrequency: Frequency;
  percentageRate: number;
  fuaBalance: number;
  percentageFrequency: Frequency;
  subscriptionMonthly: number;
  insuranceCommissionsEnabled: boolean;
  insuranceCommissionsAmount: number;

  // Services
  selectedServiceIds: string[];
  customServices: string;

  // Deduction accounts
  accounts: AccountEntry[];

  // Past 12 months (collapsible)
  retrospectiveEnabled: boolean;
  retrospectiveFeesPaid: number;
  retrospectiveServiceIds: string[];
  retrospectiveCustomServices: string;

  // Indexation (collapsible)
  indexationEnabled: boolean;
  indexedFeeOverride: number | null;
}

export interface FeeReviewErrors {
  adviserName?: string;
  licenseeName?: string;
  afslNumber?: string;
  practiceName?: string;
  practiceAddress?: string;
  adviserEmail?: string;
  clientName?: string;
  referenceDate?: string;
  feeAmount?: string;
  services?: string;
  accounts?: string;
}

export interface FeeReviewWarnings {
  referenceDate?: string;
}
