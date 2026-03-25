import Toggle from '../../components/shared/Toggle';
import Tooltip from '../../components/shared/Tooltip';

const LIFE_STAGES = [
  { value: 'accumulation', label: 'Accumulation' },
  { value: 'preRetirement', label: 'Pre-Retirement' },
  { value: 'retirement', label: 'Retirement' },
];

export default function Step1ClientProfile({ quote, dispatch }) {
  const set = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });

  return (
    <div>
      <h2 className="text-xl font-bold font-heading text-dark mb-1" style={{ letterSpacing: '-0.3px' }}>Client Profile</h2>
      <p className="text-sm text-mid mb-6">Basic client details used throughout the quote.</p>

      <div className="bg-white rounded-card border border-light-border p-6 space-y-5">

        {/* Client name */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <label className="text-sm font-medium text-dark">Client name or reference</label>
            <span className="text-mid font-normal text-sm">(optional)</span>
            <Tooltip text="This isn't stored anywhere — it's only used to personalise the client letter output. Use first names, e.g. John or John and Sally." />
          </div>
          <input
            type="text"
            value={quote.clientName}
            onChange={e => set('clientName', e.target.value)}
            placeholder="e.g. John and Sally"
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

        {/* Client status */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Client status</label>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${(quote.clientStatus ?? 'new') === 'new' ? 'font-medium text-dark' : 'text-mid'}`}>New Client</span>
            <Toggle
              checked={(quote.clientStatus ?? 'new') === 'existing'}
              onChange={v => set('clientStatus', v ? 'existing' : 'new')}
              label="Client status toggle"
            />
            <span className={`text-sm ${(quote.clientStatus ?? 'new') === 'existing' ? 'font-medium text-dark' : 'text-mid'}`}>Existing Client</span>
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
          <div className="flex items-center gap-1.5 mb-1">
            <label className="text-sm font-medium text-dark">Other entities</label>
            <Tooltip text="Count any additional legal entities beyond the individual client or couple — e.g. family trust, SMSF, company." />
          </div>
          <p className="text-xs text-mid mb-2">e.g. 1 family trust + 1 SMSF = 2</p>
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
          {quote.entityCount > 3 && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800 mt-3">
              <span className="font-medium">ⓘ</span> {quote.entityCount + (quote.isCouple ? 2 : 1)} total entities will increase data collection time in your SOA fee. Each entity requires separate analysis and documentation.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
