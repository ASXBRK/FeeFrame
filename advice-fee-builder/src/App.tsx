import { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import Landing from './components/Landing';
import Nav from './components/Nav';
import About from './components/About';
import Contact from './components/Contact';
import FeeQuoteWizard from './modules/feequote/FeeQuoteWizard';
import FeeAnalysis from './modules/feeanalysis/FeeAnalysis';
import { defaultQuoteState } from './lib/quoteDefaults';
import { defaultAnalysisState } from './lib/analysisDefaults';
// ── Types ──────────────────────────────────────────────────────────────────────
type NavPage = 'landing' | 'about' | 'contact';
type Page = NavPage | 'quote' | 'analysis';

// ── State ──────────────────────────────────────────────────────────────────────
const STATE_VERSION = 4; // bumped: external paraplanner core task fix

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

    case 'SET_QUOTE_FIELD': {
      if (action.field === 'hasOngoing' && !action.value) {
        return { ...state, quote: { ...state.quote, hasOngoing: false, soaDiscountPercent: 0, waiveImplementation: false } };
      }
      if (action.field === 'paraplanner') {
        const coreTaskIds = ['discovery', 'engagementLetter', 'dataCollection', 'scenarioModelling'];
        const cleanedOverrides = { ...state.quote.hourOverrides };
        for (const id of coreTaskIds) {
          delete cleanedOverrides[`${id}.adviser`];
          delete cleanedOverrides[`${id}.paraplanner`];
          delete cleanedOverrides[`${id}.admin`];
        }
        // Switching to external: turn core tasks off (external fee covers the engagement).
        // Switching back to internal: restore defaultOn values.
        const isExternal = action.value === 'external';
        const coreTasks = { ...state.quote.coreTasks };
        for (const id of coreTaskIds) {
          coreTasks[id] = isExternal ? false : (defaultQuoteState.coreTasks as Record<string, boolean>)[id] ?? false;
        }
        return { ...state, quote: { ...state.quote, [action.field]: action.value, hourOverrides: cleanedOverrides, coreTasks } };
      }
      return { ...state, quote: { ...state.quote, [action.field]: action.value } };
    }

    case 'SET_STRATEGY': {
      const strategies = { ...state.quote.strategies, [action.id]: action.enabled };
      const strategyQuantities = { ...(state.quote.strategyQuantities || {}) };
      if (!action.enabled) delete strategyQuantities[action.id];
      return { ...state, quote: { ...state.quote, strategies, strategyQuantities } };
    }

    case 'SET_ADDON': {
      const addOns = { ...state.quote.addOns, [action.id]: action.enabled };
      const addOnQuantities = { ...(state.quote.addOnQuantities || {}) };
      if (!action.enabled) delete addOnQuantities[action.id];
      return { ...state, quote: { ...state.quote, addOns, addOnQuantities } };
    }

    case 'SET_STRATEGY_QUANTITY': {
      const strategyQuantities = { ...(state.quote.strategyQuantities || {}), [action.id]: Math.min(10, Math.max(1, action.quantity)) };
      return { ...state, quote: { ...state.quote, strategyQuantities } };
    }

    case 'SET_ADDON_QUANTITY': {
      const addOnQuantities = { ...(state.quote.addOnQuantities || {}), [action.id]: Math.min(10, Math.max(1, action.quantity)) };
      return { ...state, quote: { ...state.quote, addOnQuantities } };
    }

    case 'SET_CORE_TASK': {
      const coreTasks = { ...state.quote.coreTasks, [action.id]: action.enabled };
      return { ...state, quote: { ...state.quote, coreTasks } };
    }

    case 'SET_HOUR_OVERRIDE': {
      const hourOverrides = { ...state.quote.hourOverrides, [action.key]: action.value };
      return { ...state, quote: { ...state.quote, hourOverrides } };
    }

    case 'SET_REVIEW_HOUR_OVERRIDE': {
      const reviewHourOverrides = { ...state.quote.reviewHourOverrides, [action.key]: action.value };
      return { ...state, quote: { ...state.quote, reviewHourOverrides } };
    }

    case 'SET_ANNUAL_TASK_HOUR_OVERRIDE': {
      const annualTaskHourOverrides = { ...state.quote.annualTaskHourOverrides, [action.key]: action.value };
      return { ...state, quote: { ...state.quote, annualTaskHourOverrides } };
    }

    case 'SET_PREMIUM_FACTOR': {
      const premiumFactors = { ...state.quote.premiumFactors, [action.index]: action.value };
      return { ...state, quote: { ...state.quote, premiumFactors } };
    }

    case 'SET_DISCOUNT_FACTOR': {
      const discountFactors = { ...state.quote.discountFactors, [action.index]: action.value };
      return { ...state, quote: { ...state.quote, discountFactors } };
    }

    // Legacy aliases kept for any surviving references
    case 'SET_SERVICE_LINE':
      return state;
    case 'SET_COMPLEXITY_FACTOR': {
      const premiumFactors = { ...state.quote.premiumFactors, [action.index]: action.value };
      return { ...state, quote: { ...state.quote, premiumFactors } };
    }
    case 'SET_EASE_FACTOR': {
      const discountFactors = { ...state.quote.discountFactors, [action.index]: action.value };
      return { ...state, quote: { ...state.quote, discountFactors } };
    }
    case 'SET_REVIEW_HOUR': {
      const reviewHourOverrides = { ...state.quote.reviewHourOverrides, [action.key]: action.value };
      return { ...state, quote: { ...state.quote, reviewHourOverrides } };
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

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem('feeframe-state', JSON.stringify({ ...state, _v: STATE_VERSION })); } catch (_) { /* ignore */ }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const [page, setPage] = useState<Page>('landing');

  const goTo = useCallback((view) => dispatch({ type: 'SET_VIEW', view }), []);

  const handleNavigate = useCallback((p: string) => {
    if (p === 'feequote') { goTo('quote'); setPage('quote'); }
    else if (p === 'feeanalysis') { goTo('analysis'); setPage('analysis'); }
    else { goTo('landing'); setPage(p as NavPage); }
  }, [goTo]);

  if (state.view === 'quote') {
    return (
      <FeeQuoteWizard
        state={state}
        dispatch={dispatch}
        onGoHome={() => { goTo('landing'); setPage('landing'); }}
        onGoAnalysis={(fees) => dispatch({ type: 'HANDOFF_TO_ANALYSIS', ...fees })}
        onNavigate={handleNavigate}
      />
    );
  }

  if (state.view === 'analysis') {
    return (
      <FeeAnalysis
        state={state}
        dispatch={dispatch}
        onGoHome={() => { goTo('landing'); setPage('landing'); }}
        onGoQuote={() => goTo('quote')}
        onNavigate={handleNavigate}
      />
    );
  }

  const navPage = (page === 'quote' || page === 'analysis' ? 'landing' : page) as NavPage;

  return (
    <>
      <Nav current={navPage} onNavigate={handleNavigate} />
      {page === 'about' && <About />}
      {page === 'contact' && <Contact />}
      {navPage === 'landing' && (
        <Landing
          onStartQuote={() => { goTo('quote'); setPage('quote'); }}
          onStartAnalysis={() => { goTo('analysis'); setPage('analysis'); }}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}
