function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-card p-5 ${className}`}>
      {title && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-600 mb-1">
      {children}
    </label>
  );
}

function NumberInput({ id, value, onChange, prefix = '', suffix = '', min = 0, max, step = 0.5 }) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-sm text-slate-400 pointer-events-none select-none">{prefix}</span>
      )}
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className={`w-full py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
          prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-12' : 'px-3'
        }`}
      />
      {suffix && (
        <span className="absolute right-3 text-xs text-slate-400 pointer-events-none select-none">{suffix}</span>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label, id, description }) {
  return (
    <div className="flex items-start gap-3">
      <label htmlFor={id} className="relative flex-shrink-0 mt-0.5 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-teal-500' : 'bg-slate-200'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </label>
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-700 cursor-pointer">{label}</label>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

const ACCESS_LEVELS = [
  {
    key: 'basic',
    label: 'Basic',
    desc: 'Reviews only, no ad-hoc access',
    icon: '📋',
  },
  {
    key: 'standard',
    label: 'Standard',
    desc: 'Phone & email access included',
    icon: '📞',
  },
  {
    key: 'premium',
    label: 'Premium',
    desc: 'Unlimited access, priority response',
    icon: '⭐',
  },
];

export default function StepOngoing({ state, dispatch, onNext, onBack }) {
  const { ongoing, time } = state;

  const setOngoing = (field, value) => {
    const num = parseFloat(value);
    dispatch({
      type: 'SET_ONGOING_FIELD',
      payload: { field, value: isNaN(num) ? value : num },
    });
  };

  // Estimated annual ongoing cost preview
  const estimatedOngoingHours =
    (ongoing.adviserHoursPerReview + ongoing.adviserPrepPerReview) * ongoing.reviewMeetingsPerYear +
    ongoing.ongoingParaplanningHours;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Ongoing Service</h1>
        <p className="mt-1 text-slate-500 text-sm">
          Define the ongoing review and service terms for the client relationship.
        </p>
      </div>

      {/* Review meetings */}
      <Card
        title="Annual review meetings"
        subtitle="How many formal reviews per year?"
        className="mb-5"
      >
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => dispatch({ type: 'SET_ONGOING_FIELD', payload: { field: 'reviewMeetingsPerYear', value: n } })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                ongoing.reviewMeetingsPerYear === n
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-100 text-slate-500 hover:border-slate-200 bg-white'
              }`}
            >
              {n}×
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label htmlFor="adviserHoursPerReview">Adviser time per review</Label>
            <NumberInput
              id="adviserHoursPerReview"
              value={ongoing.adviserHoursPerReview}
              onChange={(v) => setOngoing('adviserHoursPerReview', v)}
              suffix="hrs"
              min={0}
              max={10}
            />
          </div>
          <div>
            <Label htmlFor="adviserPrepPerReview">Preparation per review</Label>
            <NumberInput
              id="adviserPrepPerReview"
              value={ongoing.adviserPrepPerReview}
              onChange={(v) => setOngoing('adviserPrepPerReview', v)}
              suffix="hrs"
              min={0}
              max={10}
            />
          </div>
        </div>
      </Card>

      {/* Paraplanning */}
      <Card title="Ongoing paraplanning" className="mb-5">
        <div className="max-w-xs">
          <Label htmlFor="ongoingParaplanningHours">Annual paraplanning hours</Label>
          <NumberInput
            id="ongoingParaplanningHours"
            value={ongoing.ongoingParaplanningHours}
            onChange={(v) => setOngoing('ongoingParaplanningHours', v)}
            suffix="hrs/yr"
            min={0}
            max={40}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Includes SoA amendments, ROA preparation, and annual compliance work.
        </p>
      </Card>

      {/* Access level */}
      <Card title="Client access level" className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {ACCESS_LEVELS.map((level) => {
            const isStandard = level.key === 'standard';
            const currentAccess = ongoing.phoneEmailAccess;
            const isSelected = (level.key === 'standard' && currentAccess) ||
              (level.key === 'basic' && !currentAccess) ||
              (level.key === 'premium' && currentAccess); // premium also sets phoneEmailAccess

            // Simplified: use toggle for phone/email
            return (
              <button
                key={level.key}
                onClick={() => {
                  dispatch({
                    type: 'SET_ONGOING_FIELD',
                    payload: { field: 'phoneEmailAccess', value: level.key !== 'basic' },
                  });
                }}
                className={`flex flex-col items-start p-3 rounded-lg border-2 text-left transition-all ${
                  (level.key === 'basic' && !currentAccess) ||
                  (level.key !== 'basic' && currentAccess && level.key === 'standard')
                    ? 'border-teal-500 bg-teal-50/50'
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <span className="text-base mb-1">{level.icon}</span>
                <span className="text-sm font-semibold font-heading text-slate-700">{level.label}</span>
                <span className="text-xs text-slate-400 mt-0.5 leading-snug">{level.desc}</span>
              </button>
            );
          })}
        </div>

        <ToggleSwitch
          id="phoneEmailAccess"
          checked={ongoing.phoneEmailAccess}
          onChange={(v) => dispatch({ type: 'SET_ONGOING_FIELD', payload: { field: 'phoneEmailAccess', value: v } })}
          label="Phone & email access between reviews"
          description="Included in the ongoing service fee"
        />
      </Card>

      {/* Summary preview */}
      <div className="bg-navy-800/5 border border-navy-800/10 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Ongoing service preview</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-slate-100">
            <div className="text-xs text-slate-400">Reviews per year</div>
            <div className="text-lg font-bold font-heading text-slate-800">{ongoing.reviewMeetingsPerYear}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-100">
            <div className="text-xs text-slate-400">Total annual hours (est.)</div>
            <div className="text-lg font-bold font-heading text-slate-800">
              {estimatedOngoingHours.toFixed(1)}
              <span className="text-sm font-normal text-slate-400 ml-1">hrs</span>
            </div>
          </div>
        </div>
      </div>

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
          View Results
          <svg className="inline w-4 h-4 ml-2 -mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
