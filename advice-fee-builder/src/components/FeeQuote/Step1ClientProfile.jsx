import Toggle from '../shared/Toggle.jsx';

const LIFE_STAGES = [
  { value: 'accumulation', label: 'Accumulation' },
  { value: 'preRetirement', label: 'Pre-Retirement' },
  { value: 'retirement', label: 'Retirement' },
];

const AGE_BRACKETS = [
  { value: 'under40', label: 'Under 40' },
  { value: '40-54', label: '40–54' },
  { value: '55-64', label: '55–64' },
  { value: '65-74', label: '65–74' },
  { value: '75plus', label: '75+' },
];

export default function Step1ClientProfile({ quote, dispatch, onNext }) {
  const set = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Client Profile</h2>
      <p className="text-sm text-gray-500 mb-6">Basic client details used throughout the quote.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        {/* Client name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client name or reference <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={quote.clientName}
            onChange={e => set('clientName', e.target.value)}
            placeholder="e.g. Smith Family"
            className="block w-full sm:w-80 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={quote.date}
            onChange={e => set('date', e.target.value)}
            className="block w-full sm:w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Single / Couple */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Client type</label>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${!quote.isCouple ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Single</span>
            <Toggle
              checked={quote.isCouple}
              onChange={v => set('isCouple', v)}
              label="Couple toggle"
            />
            <span className={`text-sm ${quote.isCouple ? 'font-medium text-gray-900' : 'text-gray-400'}`}>Couple</span>
          </div>
        </div>

        {/* Life stage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Life stage</label>
          <select
            value={quote.lifeStage}
            onChange={e => set('lifeStage', e.target.value)}
            className="block w-full sm:w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {LIFE_STAGES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Age bracket */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age bracket</label>
          <select
            value={quote.ageBracket}
            onChange={e => set('ageBracket', e.target.value)}
            className="block w-full sm:w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {AGE_BRACKETS.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        {/* Entity count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of entities in family group
          </label>
          <p className="text-xs text-gray-400 mb-2">Drives the data collection cost in Step 2</p>
          <input
            type="number"
            min={1}
            max={10}
            value={quote.entityCount}
            onChange={e => set('entityCount', Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            className="block w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
        >
          Next: Scope of Advice →
        </button>
      </div>
    </div>
  );
}
