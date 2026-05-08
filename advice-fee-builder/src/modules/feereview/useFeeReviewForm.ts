import { useCallback, useMemo, useReducer } from 'react';
import type {
  AccountEntry,
  AccountType,
  FeeReviewErrors,
  FeeReviewState,
  FeeReviewWarnings,
} from './types';

function defaultReferenceDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

function makeInitialState(): FeeReviewState {
  return {
    adviserName: '',
    arNumber: '',
    licenseeName: '',
    afslNumber: '',
    practiceName: '',
    practiceAddress: '',
    adviserEmail: '',
    adviserPhone: '',

    clientName: '',
    clientReference: '',

    referenceDate: defaultReferenceDate(),

    feeStructure: 'fixed',
    fixedAmount: 0,
    fixedFrequency: 'annual',
    percentageRate: 0,
    fuaBalance: 0,
    percentageFrequency: 'quarterly',
    subscriptionMonthly: 0,
    insuranceCommissionsEnabled: false,
    insuranceCommissionsAmount: 0,

    selectedServiceIds: [],
    customServices: '',

    accounts: [{ id: makeAccountId(), provider: '', type: 'superannuation', reference: '' }],

    retrospectiveEnabled: false,
    retrospectiveFeesPaid: 0,
    retrospectiveServiceIds: [],
    retrospectiveCustomServices: '',

    indexationEnabled: false,
    indexedFeeOverride: null,
  };
}

function makeAccountId(): string {
  return Math.random().toString(36).slice(2, 10);
}

type Action =
  | { type: 'SET_FIELD'; field: keyof FeeReviewState; value: FeeReviewState[keyof FeeReviewState] }
  | { type: 'TOGGLE_SERVICE'; bucket: 'next' | 'retrospective'; serviceId: string }
  | { type: 'ADD_ACCOUNT' }
  | { type: 'UPDATE_ACCOUNT'; id: string; field: keyof Omit<AccountEntry, 'id'>; value: string }
  | { type: 'REMOVE_ACCOUNT'; id: string }
  | { type: 'RESET' };

function reducer(state: FeeReviewState, action: Action): FeeReviewState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'TOGGLE_SERVICE': {
      const key = action.bucket === 'next' ? 'selectedServiceIds' : 'retrospectiveServiceIds';
      const current = state[key];
      const next = current.includes(action.serviceId)
        ? current.filter(id => id !== action.serviceId)
        : [...current, action.serviceId];
      return { ...state, [key]: next };
    }
    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [...state.accounts, { id: makeAccountId(), provider: '', type: 'superannuation', reference: '' }],
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(a => (a.id === action.id ? { ...a, [action.field]: action.value } : a)),
      };
    case 'REMOVE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(a => a.id !== action.id),
      };
    case 'RESET':
      return makeInitialState();
    default:
      return state;
  }
}

export function validateFeeReview(state: FeeReviewState): { errors: FeeReviewErrors; warnings: FeeReviewWarnings } {
  const errors: FeeReviewErrors = {};
  const warnings: FeeReviewWarnings = {};

  if (!state.adviserName.trim()) errors.adviserName = 'Adviser name is required';
  if (!state.licenseeName.trim()) errors.licenseeName = 'Licensee name is required';
  const afslDigits = state.afslNumber.replace(/[\s-]/g, '');
  if (!afslDigits) errors.afslNumber = 'AFSL number is required';
  else if (!/^\d{6,}$/.test(afslDigits)) errors.afslNumber = 'AFSL number must be at least 6 digits';
  if (!state.practiceName.trim()) errors.practiceName = 'Practice name is required';
  if (!state.practiceAddress.trim()) errors.practiceAddress = 'Practice address is required';
  if (!state.adviserEmail.trim()) errors.adviserEmail = 'Adviser email is required';
  else if (!/^\S+@\S+\.\S+$/.test(state.adviserEmail.trim())) errors.adviserEmail = 'Enter a valid email address';

  if (!state.clientName.trim()) errors.clientName = 'Client name is required';

  if (!state.referenceDate) {
    errors.referenceDate = 'Reference date is required';
  } else {
    const ref = new Date(state.referenceDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(ref.getTime())) {
      errors.referenceDate = 'Enter a valid date';
    } else if (ref <= today) {
      errors.referenceDate = 'Reference date must be in the future';
    } else {
      const oneYearOut = new Date(today);
      oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);
      oneYearOut.setDate(oneYearOut.getDate() + 30); // 30-day grace
      if (ref > oneYearOut) {
        warnings.referenceDate = 'Reference date is more than 12 months from today. Consents typically apply for a 12-month period.';
      }
    }
  }

  // Fee amount check based on structure
  if (state.feeStructure === 'fixed' && (!state.fixedAmount || state.fixedAmount <= 0)) {
    errors.feeAmount = 'Enter a fee amount greater than zero';
  } else if (state.feeStructure === 'percentage' && (!state.percentageRate || state.percentageRate <= 0)) {
    errors.feeAmount = 'Enter a percentage greater than zero';
  } else if (state.feeStructure === 'subscription' && (!state.subscriptionMonthly || state.subscriptionMonthly <= 0)) {
    errors.feeAmount = 'Enter a monthly subscription amount greater than zero';
  }

  if (state.selectedServiceIds.length === 0 && !state.customServices.trim()) {
    errors.services = 'Select at least one service or describe a custom service';
  }

  const validAccounts = state.accounts.filter(a => a.provider.trim() && a.reference.trim());
  if (validAccounts.length === 0) {
    errors.accounts = 'Add at least one deduction account with provider and reference';
  }

  return { errors, warnings };
}

export function useFeeReviewForm() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  const set = useCallback(
    <K extends keyof FeeReviewState>(field: K, value: FeeReviewState[K]) => {
      dispatch({ type: 'SET_FIELD', field, value: value as FeeReviewState[keyof FeeReviewState] });
    },
    [],
  );

  const toggleService = useCallback((bucket: 'next' | 'retrospective', serviceId: string) => {
    dispatch({ type: 'TOGGLE_SERVICE', bucket, serviceId });
  }, []);

  const addAccount = useCallback(() => dispatch({ type: 'ADD_ACCOUNT' }), []);

  const updateAccount = useCallback(
    (id: string, field: 'provider' | 'reference' | 'type', value: string) => {
      dispatch({ type: 'UPDATE_ACCOUNT', id, field, value });
    },
    [],
  );

  const removeAccount = useCallback((id: string) => dispatch({ type: 'REMOVE_ACCOUNT', id }), []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const validation = useMemo(() => validateFeeReview(state), [state]);

  return {
    state,
    set,
    toggleService,
    addAccount,
    updateAccount,
    removeAccount,
    reset,
    errors: validation.errors,
    warnings: validation.warnings,
    isValid: Object.keys(validation.errors).length === 0,
  };
}

export type AccountTypeOption = AccountType;
