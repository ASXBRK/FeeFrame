export default function StrategyCard({ strategy, value, onChange }) {
  const { key, label, description, defaultHours } = strategy;
  const isEnabled = value?.enabled ?? false;
  const hours = value?.hours ?? defaultHours;

  const toggle = () => {
    onChange(key, { enabled: !isEnabled, hours: isEnabled ? defaultHours : hours });
  };

  const setHours = (newHours) => {
    const parsed = parseFloat(newHours);
    onChange(key, { enabled: true, hours: isNaN(parsed) ? hours : Math.max(0, Math.min(50, parsed)) });
  };

  return (
    <div
      className={`relative flex flex-col gap-2 p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer ${
        isEnabled
          ? 'border-teal-400 bg-teal-50/40 shadow-sm'
          : 'border-slate-100 bg-white hover:border-slate-200'
      }`}
      onClick={toggle}
    >
      {/* Checkbox + label row */}
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            isEnabled
              ? 'bg-teal-500 border-teal-500'
              : 'bg-white border-slate-300'
          }`}
        >
          {isEnabled && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-semibold font-heading leading-snug ${isEnabled ? 'text-teal-800' : 'text-slate-700'}`}>
            {label}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 leading-snug">{description}</div>
        </div>
      </div>

      {/* Hours input — only visible when enabled */}
      {isEnabled && (
        <div
          className="flex items-center gap-2 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="text-xs text-teal-600 font-medium whitespace-nowrap">
            Estimated hours:
          </label>
          <div className="relative w-24">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              min={0}
              max={50}
              step={0.5}
              placeholder={String(defaultHours)}
              className="w-full px-2.5 py-1.5 pr-8 text-xs rounded-md border border-teal-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
              hrs
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
