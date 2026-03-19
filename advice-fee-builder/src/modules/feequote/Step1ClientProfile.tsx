import Toggle from '../../components/shared/Toggle';

const LIFE_STAGES = [
  { value: 'accumulation', label: 'Accumulation' },
  { value: 'preRetirement', label: 'Pre-Retirement' },
  { value: 'retirement', label: 'Retirement' },
];

export default function Step1ClientProfile({ quote, dispatch, onNext }) {
  const set = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });

  return (
    <div>
      <h2 className="text-xl font-bold font-heading text-dark mb-1" style={{ letterSpacing: '-0.3px' }}>Client Profile</h2>
      <p className="text-sm text-mid mb-6">Basic client details used throughout the quote.</p>

      <div className="bg-white rounded-card border border-light-border p-6 space-y-5">

        {/* Client name */}
        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            Client name or reference <span className="text-mid font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={quote.clientName}
            onChange={e => set('clientName', e.target.value)}
            placeholder="e.g. Smith Family"
            className="block w-full sm:w-80 rounded-input border border-light-border px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Date</label>
          <input
            type="date"
            value={quote.date}
            onChange={e => set('date', e.target.value)}
            className="block w-full sm:w-48 rounded-input border border-light-border px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          />
        </div>

        {/* Single / Couple */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Client type</label>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${!quote.isCouple ? 'font-medium text-dark' : 'text-mid'}`}>Single</span>
            <Toggle
              checked={quote.isCouple}
              onChange={v => set('isCouple', v)}
              label="Couple toggle"
            />
            <span className={`text-sm ${quote.isCouple ? 'font-medium text-dark' : 'text-mid'}`}>Couple</span>
          </div>
        </div>

        {/* Life stage */}
        <div>
          <label className="block text-sm font-medium text-dark mb-1">Life stage</label>
          <select
            value={quote.lifeStage}
            onChange={e => set('lifeStage', e.target.value)}
            className="block w-full sm:w-56 rounded-input border border-light-border px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
          >
            {LIFE_STAGES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Entity count */}
        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            Number of entities in family group
          </label>
          <p className="text-xs text-mid mb-2">
            Count each separate legal entity — individuals, SMSFs, trusts, and companies (e.g. 2 individuals + 1 SMSF = 3)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => set('entityCount', Math.max(0, quote.entityCount - 1))}
              disabled={quote.entityCount <= 0}
              className="w-8 h-8 rounded-input border border-light-border flex items-center justify-center text-dark hover:bg-light-surface disabled:opacity-30 text-lg font-medium leading-none"
            >−</button>
            <span className="w-8 text-center text-sm font-semibold text-dark">{quote.entityCount}</span>
            <button
              type="button"
              onClick={() => set('entityCount', Math.min(10, quote.entityCount + 1))}
              disabled={quote.entityCount >= 10}
              className="w-8 h-8 rounded-input border border-light-border flex items-center justify-center text-dark hover:bg-light-surface disabled:opacity-30 text-lg font-medium leading-none"
            >+</button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="bg-teal hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-opacity text-sm"
        >
          Next: Scope of Advice →
        </button>
      </div>
    </div>
  );
}
