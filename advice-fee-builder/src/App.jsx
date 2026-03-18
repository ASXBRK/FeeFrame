import { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { defaultState } from './lib/defaults.js';
import Sidebar from './components/Sidebar.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import StepFeeModel from './components/StepFeeModel.jsx';
import StepClientProfile from './components/StepClientProfile.jsx';
import StepTimeCosts from './components/StepTimeCosts.jsx';
import StepOngoing from './components/StepOngoing.jsx';
import StepResults from './components/StepResults.jsx';

// ── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FEE_MODEL':
      return { ...state, feeModel: action.payload };

    case 'SET_FEE_MODEL_INPUT':
      return {
        ...state,
        feeModelInputs: {
          ...state.feeModelInputs,
          [action.payload.field]: action.payload.value,
        },
      };

    case 'SET_TIERS':
      return {
        ...state,
        feeModelInputs: { ...state.feeModelInputs, tiers: action.payload },
      };

    case 'SET_CLIENT_FIELD':
      return {
        ...state,
        client: { ...state.client, [action.payload.field]: action.payload.value },
      };

    case 'SET_STRATEGY':
      return {
        ...state,
        client: {
          ...state.client,
          strategies: {
            ...state.client.strategies,
            [action.payload.key]: action.payload.value,
          },
        },
      };

    case 'SET_TIME_FIELD':
      return {
        ...state,
        time: { ...state.time, [action.payload.field]: action.payload.value },
      };

    case 'SET_PARAPLANNING_FIELD':
      return {
        ...state,
        time: {
          ...state.time,
          paraplanning: {
            ...state.time.paraplanning,
            [action.payload.field]: action.payload.value,
          },
        },
      };

    case 'SET_RATE_FIELD':
      return {
        ...state,
        rates: { ...state.rates, [action.payload.field]: action.payload.value },
      };

    case 'SET_COST_FIELD':
      return {
        ...state,
        costs: { ...state.costs, [action.payload.field]: action.payload.value },
      };

    case 'SET_ONGOING_FIELD':
      return {
        ...state,
        ongoing: { ...state.ongoing, [action.payload.field]: action.payload.value },
      };

    case 'SET_SETTINGS_FIELD':
      return {
        ...state,
        settings: { ...state.settings, [action.payload.field]: action.payload.value },
      };

    case 'RESET':
      return { ...defaultState };

    default:
      return state;
  }
}

// ── Load saved state ──────────────────────────────────────────────────────────

function loadSavedState() {
  try {
    const raw = localStorage.getItem('advice-fee-builder-state');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── Deep merge helper ────────────────────────────────────────────────────────

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      override[key] !== null &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      base[key] !== null &&
      typeof base[key] === 'object'
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

// ── App ───────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'advice-fee-builder-state';
const STEP_KEY = 'advice-fee-builder-step';

export default function App() {
  const saved = loadSavedState();
  const initialState = saved ? deepMerge(defaultState, saved) : defaultState;

  const [state, dispatch] = useReducer(reducer, initialState);
  const [step, setStep] = useState(() => {
    const s = parseInt(localStorage.getItem(STEP_KEY) || '1', 10);
    return isNaN(s) || s < 1 || s > 5 ? 1 : s;
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const saveTimer = useRef(null);

  // Debounced localStorage save
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch {
        // quota exceeded or private mode — ignore
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  // Save step
  useEffect(() => {
    localStorage.setItem(STEP_KEY, String(step));
  }, [step]);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, 5));
  }, []);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleReset = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const confirmReset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setStep(1);
    setShowResetModal(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_KEY);
  }, []);

  const stepContent = () => {
    switch (step) {
      case 1:
        return <StepFeeModel state={state} dispatch={dispatch} onNext={handleNext} />;
      case 2:
        return <StepClientProfile state={state} dispatch={dispatch} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <StepTimeCosts state={state} dispatch={dispatch} onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <StepOngoing state={state} dispatch={dispatch} onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <StepResults state={state} dispatch={dispatch} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col md:flex-row font-body">
      <Sidebar
        currentStep={step}
        onStepClick={setStep}
        onReset={handleReset}
        draftSaved={draftSaved}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Progress bar */}
        <div className="h-1 bg-slate-100 print:hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-500"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <div className="px-4 py-8 sm:px-8 md:px-10 lg:px-12">
          {stepContent()}
        </div>
      </main>

      <ConfirmModal
        isOpen={showResetModal}
        title="Reset all inputs?"
        message="This will clear all inputs and start fresh. Your saved draft will be deleted. Are you sure?"
        onConfirm={confirmReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
}
