import { useReducer, useEffect, useCallback, useRef } from 'react';
import Landing from './components/Landing';
import FeeQuoteWizard from './components/FeeQuote/FeeQuoteWizard.jsx';
import FeeAnalysis from './components/FeeAnalysis/FeeAnalysis.jsx';
import { defaultQuoteState } from './lib/quoteDefaults.js';
import { defaultAnalysisState } from './lib/analysisDefaults.js';
import { STRATEGIES } from './lib/serviceLines.js';

// ── State ──────────────────────────────────────────────────────────────────────
const STATE_VERSION = 2; // bump to clear stale localStorage

const initialState = {
  view: 'landing', // 'landing' | 'quote' | 'analysis'
  quoteStep: 1,
  maxQuoteStep: 1,
  quote: defaultQuoteState,
  analysis: defaultAnalysisState,
};

function deepMerge(defaults, saved) {
  if (!saved || typeof saved !== 'object') return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(saved)) {
    if (key in defaults && typeof defaults[key] === 'object' && !Array.isArray(defaults[key]) && defaults[key] !== null) {
      result[key] = deepMerge(defaults[key], saved[key]);
    } else if (key in defaults) {
      result[key] = saved[key];
    }
  }
  return result;
}

// ── Reducer ────────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'SET_QUOTE_STEP':
      return {
        ...state,
        quoteStep: action.step,
        maxQuoteStep: Math.max(state.maxQuoteStep, action.step),
      };

    case 'SET_QUOTE_FIELD':
      return { ...state, quote: { ...state.quote, [action.field]: action.value } };

    case 'SET_SERVICE_LINE': {
      const serviceLines = { ...state.quote.serviceLines, [action.id]: action.value };
      return { ...state, quote: { ...state.quote, serviceLines } };
    }

    case 'SET_STRATEGY': {
      const strategies = { ...state.quote.strategies, [action.id]: action.enabled };
      const stratDef = STRATEGIES.find(s => s.id === action.id);
      let serviceLines = { ...state.quote.serviceLines };
      if (stratDef?.linkedServiceLine) {
        serviceLines = { ...serviceLines, [stratDef.linkedServiceLine]: action.enabled };
      }
      return { ...state, quote: { ...state.quote, strategies, serviceLines } };
    }

    case 'SET_COMPLEXITY_FACTOR': {
      const complexityFactors = { ...state.quote.complexityFactors, [action.index]: action.value };
      return { ...state, quote: { ...state.quote, complexityFactors } };
    }

    case 'SET_EASE_FACTOR': {
      const easeFactors = { ...state.quote.easeFactors, [action.index]: action.value };
      return { ...state, quote: { ...state.quote, easeFactors } };
    }

    case 'SET_REVIEW_HOUR': {
      const reviewHours = { ...state.quote.reviewHours, [action.key]: action.value };
      return { ...state, quote: { ...state.quote, reviewHours } };
    }

    case 'SET_ENTITY': {
      const entities = [...state.quote.entities];
      entities[action.index] = { ...entities[action.index], [action.field]: action.value };
      return { ...state, quote: { ...state.quote, entities } };
    }

    case 'ADD_ENTITY': {
      const entities = [...state.quote.entities, { name: '', balance: 0, onPlatform: true }];
      return { ...state, quote: { ...state.quote, entities } };
    }

    case 'REMOVE_ENTITY': {
      const entities = state.quote.entities.filter((_, i) => i !== action.index);
      return { ...state, quote: { ...state.quote, entities } };
    }

    case 'SET_TIER': {
      const tiers = state.quote.tiers.map((t, i) =>
        i === action.index ? { ...t, [action.field]: action.value } : t
      );
      return { ...state, quote: { ...state.quote, tiers } };
    }

    case 'ADD_TIER': {
      const tiers = [...state.quote.tiers];
      const last = tiers[tiers.length - 1];
      const newFrom = last ? (last.to !== null ? last.to + 1 : last.from + 1000000) : 0;
      const updatedTiers = tiers.map((t, i) =>
        i === tiers.length - 1 && t.to === null ? { ...t, to: newFrom - 1 } : t
      );
      return { ...state, quote: { ...state.quote, tiers: [...updatedTiers, { from: newFrom, to: null, rate: 0 }] } };
    }

    case 'REMOVE_TIER': {
      const tiers = state.quote.tiers.filter((_, i) => i !== action.index);
      return { ...state, quote: { ...state.quote, tiers } };
    }

    case 'RESET_QUOTE':
      return {
        ...state,
        quote: { ...defaultQuoteState, date: new Date().toISOString().split('T')[0] },
        quoteStep: 1,
        maxQuoteStep: 1,
      };

    case 'SET_ANALYSIS_FIELD':
      return { ...state, analysis: { ...state.analysis, [action.field]: action.value } };

    case 'SET_SOA_TASK': {
      const soaTasks = state.analysis.soaTasks.map((t, i) =>
        i === action.index ? { ...t, [action.field]: action.value } : t
      );
      return { ...state, analysis: { ...state.analysis, soaTasks } };
    }

    case 'SET_ONGOING_TASK': {
      const ongoingTasks = state.analysis.ongoingTasks.map((t, i) =>
        i === action.index ? { ...t, [action.field]: action.value } : t
      );
      return { ...state, analysis: { ...state.analysis, ongoingTasks } };
    }

    case 'RESET_ANALYSIS':
      return { ...state, analysis: defaultAnalysisState };

    case 'HANDOFF_TO_ANALYSIS':
      return {
        ...state,
        view: 'analysis',
        analysis: {
          ...state.analysis,
          soaFeeExGst: action.soaFeeExGst,
          implFeeExGst: action.implFeeExGst,
          ongoingFeeExGst: action.ongoingFeeExGst,
        },
      };

    default:
      return state;
  }
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('feeframe-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed._v === STATE_VERSION) return deepMerge(init, parsed);
      }
    } catch (_) { /* ignore */ }
    return init;
  });

  const saveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem('feeframe-state', JSON.stringify({ ...state, _v: STATE_VERSION })); } catch (_) { /* ignore */ }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const goTo = useCallback((view) => dispatch({ type: 'SET_VIEW', view }), []);

  if (state.view === 'quote') {
    return (
      <FeeQuoteWizard
        state={state}
        dispatch={dispatch}
        onGoHome={() => goTo('landing')}
        onGoAnalysis={(fees) => dispatch({ type: 'HANDOFF_TO_ANALYSIS', ...fees })}
      />
    );
  }

  if (state.view === 'analysis') {
    return (
      <FeeAnalysis
        state={state}
        dispatch={dispatch}
        onGoHome={() => goTo('landing')}
        onGoQuote={() => goTo('quote')}
      />
    );
  }

  return <Landing onStartQuote={() => goTo('quote')} onStartAnalysis={() => goTo('analysis')} />;
}
