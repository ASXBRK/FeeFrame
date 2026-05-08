import { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import Landing from './components/Landing';
import Nav from './components/Nav';
import About from './components/About';
import Contact from './components/Contact';
import FeeQuoteWizard from './modules/feequote/FeeQuoteWizard';
import FeeReview from './modules/feereview/FeeReview';
import { defaultQuoteState } from './lib/quoteDefaults';
// ── Types ──────────────────────────────────────────────────────────────────────
type NavPage = 'landing' | 'about' | 'contact';
type Page = NavPage | 'quote' | 'review';

// ── URL routing helpers ────────────────────────────────────────────────────────
function getViewFromPath(pathname: string): { view: string; page: Page } {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/feequote') return { view: 'quote', page: 'quote' };
  if (p === '/feereview') return { view: 'review', page: 'review' };
  if (p === '/about') return { view: 'landing', page: 'about' };
  if (p === '/contact') return { view: 'landing', page: 'contact' };
  return { view: 'landing', page: 'landing' };
}

function pathForView(p: string): string {
  if (p === 'feequote') return '/feequote';
  if (p === 'feereview') return '/feereview';
  if (p === 'about') return '/about';
  if (p === 'contact') return '/contact';
  return '/';
}

// ── State ──────────────────────────────────────────────────────────────────────
const STATE_VERSION = 7; // bumped: removed analysis state slice

const initialState = {
  view: getViewFromPath(window.location.pathname).view,
  quoteStep: 1,
  maxQuoteStep: 1,
  quote: defaultQuoteState,
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
        return { ...state, quote: { ...state.quote, hasOngoing: false, soaDiscountPercent: 0, implDiscountPercent: 0 } };
      }
      if (action.field === 'paraplanner') {
        // Bug fix: 'soaReviewPresentation' was missing from this list; it was added as a 5th core task
        // after this reducer was written, so its hour overrides were never cleared on paraplanner switch,
        // leaving internal-mode hour overrides active when external defaults should apply (and vice versa).
        const coreTaskIds = ['discovery', 'engagementLetter', 'dataCollection', 'scenarioModelling', 'soaReviewPresentation'];
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
      return { ...state, quote: { ...state.quote, premiumFactors, premiumSoaOverride: null, premiumOngoingOverride: null } };
    }

    case 'SET_DISCOUNT_FACTOR': {
      const discountFactors = { ...state.quote.discountFactors, [action.index]: action.value };
      return { ...state, quote: { ...state.quote, discountFactors, discountSoaOverride: null, discountOngoingOverride: null } };
    }

    case 'SET_RELATIONSHIP_DISCOUNT': {
      return { ...state, quote: { ...state.quote, ...action.fields, discountSoaOverride: null, discountOngoingOverride: null } };
    }

    // Legacy aliases kept for any surviving references
    case 'SET_SERVICE_LINE':
      return state;
    case 'SET_COMPLEXITY_FACTOR': {
      const premiumFactors = { ...state.quote.premiumFactors, [action.index]: action.value };
      return { ...state, quote: { ...state.quote, premiumFactors, premiumSoaOverride: null, premiumOngoingOverride: null } };
    }
    case 'SET_EASE_FACTOR': {
      const discountFactors = { ...state.quote.discountFactors, [action.index]: action.value };
      return { ...state, quote: { ...state.quote, discountFactors, discountSoaOverride: null, discountOngoingOverride: null } };
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

    default:
      return state;
  }
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    let merged = init;
    try {
      const saved = localStorage.getItem('feeframe-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed._v === STATE_VERSION) merged = deepMerge(init, parsed);
      }
    } catch (_) { /* ignore */ }
    // URL always wins over saved view on page load
    const { view } = getViewFromPath(window.location.pathname);
    return { ...merged, view };
  });

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem('feeframe-state', JSON.stringify({ ...state, _v: STATE_VERSION })); } catch (_) { /* ignore */ }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const [page, setPage] = useState<Page>(() => getViewFromPath(window.location.pathname).page);

  const goTo = useCallback((view) => dispatch({ type: 'SET_VIEW', view }), []);

  // Browser back/forward support
  useEffect(() => {
    const onPopState = () => {
      const { view, page: p } = getViewFromPath(window.location.pathname);
      dispatch({ type: 'SET_VIEW', view });
      setPage(p);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = useCallback((p: string) => {
    history.pushState(null, '', pathForView(p));
    if (p === 'feequote') { goTo('quote'); setPage('quote'); }
    else if (p === 'feereview') { goTo('review'); setPage('review'); }
    else if (p === 'about') { goTo('landing'); setPage('about'); }
    else if (p === 'contact') { goTo('landing'); setPage('contact'); }
    else { goTo('landing'); setPage('landing'); }
  }, [goTo]);

  if (state.view === 'quote') {
    return (
      <FeeQuoteWizard
        state={state}
        dispatch={dispatch}
        onGoHome={() => { history.pushState(null, '', '/'); goTo('landing'); setPage('landing'); }}
        onNavigate={handleNavigate}
      />
    );
  }

  if (state.view === 'review') {
    const goHome = () => { history.pushState(null, '', '/'); goTo('landing'); setPage('landing'); };
    return (
      <FeeReview
        onGoHome={goHome}
        onNavigate={handleNavigate}
      />
    );
  }

  const navPage = (page === 'quote' || page === 'review' ? 'landing' : page) as NavPage;

  return (
    <>
      <Nav current={navPage} onNavigate={handleNavigate} />
      {page === 'about' && <About />}
      {page === 'contact' && <Contact />}
      {navPage === 'landing' && (
        <Landing
          onStartQuote={() => { history.pushState(null, '', '/feequote'); goTo('quote'); setPage('quote'); }}
          onStartReview={() => { history.pushState(null, '', '/feereview'); goTo('review'); setPage('review'); }}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}
