import StrategyCard from './StrategyCard.jsx';
import { STRATEGIES } from '../lib/strategies.js';

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-card p-5 ${className}`}>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label, id }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-teal-500' : 'bg-slate-200'
        }`} />
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`} />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

const LIFE_STAGES = [
  { key: 'Accumulation', label: 'Accumulation', desc: 'Building wealth, pre-retirement' },
  { key: 'Pre-Retirement', label: 'Pre-Retirement', desc: 'Planning transition, 5–10 yrs out' },
  { key: 'Retirement', label: 'Retirement', desc: 'Drawing down, pension phase' },
];

export default function StepClientProfile({ state, dispatch, onNext, onBack }) {
  const { client } = state;

  const setClientField = (field, value) => {
    dispatch({ type: 'SET_CLIENT_FIELD', payload: { field, value } });
  };

  const setStrategy = (key, value) => {
    dispatch({ type: 'SET_STRATEGY', payload: { key, value } });
  };

  const enabledCount = STRATEGIES.filter(s => client.strategies[s.key]?.enabled).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Client Profile</h1>
        <p className="mt-1 text-slate-500 text-sm">
          Tell us about the client to calibrate scope and complexity.
        </p>
      </div>

      {/* Demographics */}
      <Card className="mb-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Demographics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1.5">
              Client age
            </label>
            <div className="relative max-w-[120px]">
              <input
                id="age"
                type="number"
                value={client.age}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) setClientField('age', Math.max(18, Math.min(100, v)));
                }}
                min={18}
                max={100}
                className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">yrs</span>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <ToggleSwitch
              id="isCouple"
              checked={client.isCouple}
              onChange={(v) => setClientField('isCouple', v)}
              label="Couple / joint advice"
            />
            {client.isCouple && (
              <p className="mt-1.5 text-xs text-amber-600">
                Couple advice typically adds 20–30% to complexity
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Life stage */}
      <Card className="mb-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Life stage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LIFE_STAGES.map((stage) => (
            <button
              key={stage.key}
              onClick={() => setClientField('lifeStage', stage.key)}
              className={`flex flex-col items-start p-3 rounded-lg border-2 text-left transition-all ${
                client.lifeStage === stage.key
                  ? 'border-teal-500 bg-teal-50/50'
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <span className={`text-sm font-semibold font-heading ${
                client.lifeStage === stage.key ? 'text-teal-700' : 'text-slate-700'
              }`}>
                {stage.label}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 leading-snug">{stage.desc}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Strategies */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Advice strategies</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select all strategies included in the SOA. Hours can be adjusted inline.
            </p>
          </div>
          <span className="text-xs bg-teal-100 text-teal-700 font-medium px-2.5 py-1 rounded-full">
            {enabledCount} selected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STRATEGIES.map((strategy) => (
            <StrategyCard
              key={strategy.key}
              strategy={strategy}
              value={client.strategies[strategy.key]}
              onChange={setStrategy}
            />
          ))}
        </div>

        {enabledCount === 0 && (
          <p className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Select at least one strategy to generate a meaningful fee recommendation.
          </p>
        )}
      </Card>

      {/* Nav */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
        >
          <svg className="inline w-4 h-4 mr-1.5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors shadow-sm"
        >
          Continue to Time & Costs
          <svg className="inline w-4 h-4 ml-2 -mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
