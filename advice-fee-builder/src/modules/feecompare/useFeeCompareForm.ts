import { useReducer } from 'react';
import type { FeeCompareState, FeeCompareStructure, AdviceComplexity } from './types';

const initialState: FeeCompareState = {
  fee: null,
  feeStructure: 'fixed',
  feePercent: null,
  feeMonthly: null,
  clientFUA: null,
  adviceComplexity: 'simple',
};

type Action =
  | { type: 'SET_FEE'; value: number | null }
  | { type: 'SET_STRUCTURE'; value: FeeCompareStructure }
  | { type: 'SET_FEE_PERCENT'; value: number | null }
  | { type: 'SET_FEE_MONTHLY'; value: number | null }
  | { type: 'SET_CLIENT_FUA'; value: number | null }
  | { type: 'SET_COMPLEXITY'; value: AdviceComplexity }
  | { type: 'RESET' };

function reducer(state: FeeCompareState, action: Action): FeeCompareState {
  switch (action.type) {
    case 'SET_FEE':        return { ...state, fee: action.value };
    case 'SET_STRUCTURE':  return { ...state, feeStructure: action.value };
    case 'SET_FEE_PERCENT':return { ...state, feePercent: action.value };
    case 'SET_FEE_MONTHLY':return { ...state, feeMonthly: action.value };
    case 'SET_CLIENT_FUA': return { ...state, clientFUA: action.value };
    case 'SET_COMPLEXITY': return { ...state, adviceComplexity: action.value };
    case 'RESET':          return initialState;
  }
}

export function useFeeCompareForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    state,
    setFee:        (v: number | null)          => dispatch({ type: 'SET_FEE', value: v }),
    setStructure:  (v: FeeCompareStructure)    => dispatch({ type: 'SET_STRUCTURE', value: v }),
    setFeePercent: (v: number | null)          => dispatch({ type: 'SET_FEE_PERCENT', value: v }),
    setFeeMonthly: (v: number | null)          => dispatch({ type: 'SET_FEE_MONTHLY', value: v }),
    setClientFUA:  (v: number | null)          => dispatch({ type: 'SET_CLIENT_FUA', value: v }),
    setComplexity: (v: AdviceComplexity)       => dispatch({ type: 'SET_COMPLEXITY', value: v }),
    reset:         ()                          => dispatch({ type: 'RESET' }),
  };
}
