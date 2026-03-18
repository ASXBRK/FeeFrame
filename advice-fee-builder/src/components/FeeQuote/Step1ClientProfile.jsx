import Toggle from '../shared/Toggle.jsx';

const LIFE_STAGES = [
  { value: 'accumulation', label: 'Accumulation' },
  { value: 'preRetirement', label: 'Pre-Retirement' },
  { value: 'retirement', label: 'Retirement' },
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

        {/* Entity count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of entities in family group
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Count each separate legal entity — individuals, SMSFs, trusts, and companies (e.g. 2 individuals + 1 SMSF = 3)
          </p>
          <input
            type="number"
            min={0}
            max={10}
            value={quote.entityCount}
            onChange={e => {
              const v = parseInt(e.target.value);
              if (!isNaN(v)) set('entityCount', Math.max(0, Math.min(10, v)));
            }}
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
