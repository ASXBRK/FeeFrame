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

function NumberInput({ id, value, onChange, prefix = '', suffix = '', min = 0, max, step = 0.5, disabled = false }) {
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
        disabled={disabled}
        className={`w-full py-2 text-sm rounded-lg border text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
          disabled
            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
            : 'bg-white border-slate-200'
        } ${prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-10' : 'px-3'}`}
      />
      {suffix && (
        <span className={`absolute right-3 text-xs pointer-events-none select-none ${disabled ? 'text-slate-300' : 'text-slate-400'}`}>
          {suffix}
        </span>
      )}
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
          className="sr-only"
        />
        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-teal-500' : 'bg-slate-200'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

export default function StepTimeCosts({ state, dispatch, onNext, onBack }) {
  const { time, rates, costs } = state;

  const setTime = (field, value) => {
    const num = parseFloat(value);
    dispatch({
      type: 'SET_TIME_FIELD',
      payload: { field, value: isNaN(num) ? value : num },
    });
  };

  const setParaplanning = (field, value) => {
    const num = parseFloat(value);
    dispatch({
      type: 'SET_PARAPLANNING_FIELD',
      payload: { field, value: isNaN(num) ? value : num },
    });
  };

  const setRate = (field, value) => {
    const num = parseFloat(value);
    dispatch({
      type: 'SET_RATE_FIELD',
      payload: { field, value: isNaN(num) ? value : num },
    });
  };

  const setCost = (field, value) => {
    const num = parseFloat(value);
    dispatch({
      type: 'SET_COST_FIELD',
      payload: { field, value: isNaN(num) ? value : num },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Time & Costs</h1>
        <p className="mt-1 text-slate-500 text-sm">
          Enter hours for each activity and any fixed costs to calculate your cost recovery baseline.
        </p>
      </div>

      {/* Initial meeting activities */}
      <Card
        title="Initial SOA activities"
        subtitle="Adviser time allocated to the initial advice engagement"
        className="mb-5"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="initialMeeting">Discovery meeting</Label>
            <NumberInput
              id="initialMeeting"
              value={time.initialMeeting}
              onChange={(v) => setTime('initialMeeting', v)}
              suffix="hrs"
              min={0}
              max={8}
            />
          </div>
          <div>
            <Label htmlFor="adviserPrep">Adviser preparation</Label>
            <NumberInput
              id="adviserPrep"
              value={time.adviserPrep}
              onChange={(v) => setTime('adviserPrep', v)}
              suffix="hrs"
              min={0}
              max={20}
            />
          </div>
          <div>
            <Label htmlFor="reportReview">Report review</Label>
            <NumberInput
              id="reportReview"
              value={time.reportReview}
              onChange={(v) => setTime('reportReview', v)}
              suffix="hrs"
              min={0}
              max={10}
            />
          </div>
          <div>
            <Label htmlFor="presentationMeeting">Presentation meeting</Label>
            <NumberInput
              id="presentationMeeting"
              value={time.presentationMeeting}
              onChange={(v) => setTime('presentationMeeting', v)}
              suffix="hrs"
              min={0}
              max={8}
            />
          </div>
          <div>
            <Label htmlFor="followUpContacts">Follow-up contacts</Label>
            <NumberInput
              id="followUpContacts"
              value={time.followUpContacts}
              onChange={(v) => setTime('followUpContacts', v)}
              suffix="count"
              min={0}
              max={20}
              step={1}
            />
          </div>
          <div>
            <Label htmlFor="followUpTimeEach">Time per follow-up</Label>
            <NumberInput
              id="followUpTimeEach"
              value={time.followUpTimeEach}
              onChange={(v) => setTime('followUpTimeEach', v)}
              suffix="hrs"
              min={0}
              max={2}
              step={0.25}
            />
          </div>
        </div>
      </Card>

      {/* Travel */}
      <Card title="Travel" className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <ToggleSwitch
              id="isVirtual"
              checked={time.isVirtual}
              onChange={(v) => dispatch({ type: 'SET_TIME_FIELD', payload: { field: 'isVirtual', value: v } })}
              label="Virtual meetings (no travel)"
            />
            {time.isVirtual && (
              <p className="mt-1.5 text-xs text-slate-400">Travel time is zeroed out for virtual engagements.</p>
            )}
          </div>
          <div className="w-full sm:w-36">
            <Label htmlFor="travelTime">Travel time</Label>
            <NumberInput
              id="travelTime"
              value={time.isVirtual ? 0 : time.travelTime}
              onChange={(v) => setTime('travelTime', v)}
              suffix="hrs"
              min={0}
              max={10}
              disabled={time.isVirtual}
            />
          </div>
        </div>
      </Card>

      {/* Paraplanning */}
      <Card title="Paraplanning" subtitle="How paraplanning services are sourced" className="mb-5">
        {/* Type toggle */}
        <div className="flex gap-2 mb-4">
          {['internal', 'external'].map((type) => (
            <button
              key={type}
              onClick={() => setParaplanning('type', type)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                time.paraplanning.type === type
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-100 text-slate-500 hover:border-slate-200 bg-white'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Internal inputs */}
        {time.paraplanning.type === 'internal' && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div>
              <Label htmlFor="ppHoursInternal">Paraplanning hours</Label>
              <NumberInput
                id="ppHoursInternal"
                value={time.paraplanning.hoursInternal}
                onChange={(v) => setParaplanning('hoursInternal', v)}
                suffix="hrs"
                min={0}
                max={40}
              />
            </div>
            <div>
              <Label htmlFor="ppRateInternal">Hourly rate</Label>
              <NumberInput
                id="ppRateInternal"
                value={time.paraplanning.hourlyRateInternal}
                onChange={(v) => setParaplanning('hourlyRateInternal', v)}
                prefix="$"
                min={0}
                max={500}
                step={5}
              />
            </div>
          </div>
        )}

        {/* External inputs */}
        {time.paraplanning.type === 'external' && (
          <div className="animate-in fade-in duration-200">
            <Label htmlFor="ppFeeExternal">External paraplanning flat fee</Label>
            <div className="max-w-xs">
              <NumberInput
                id="ppFeeExternal"
                value={time.paraplanning.flatFeeExternal}
                onChange={(v) => setParaplanning('flatFeeExternal', v)}
                prefix="$"
                min={0}
                max={10000}
                step={100}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Hourly rates */}
      <Card title="Hourly rates & margin" className="mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="adviserHourly">Adviser rate</Label>
            <NumberInput
              id="adviserHourly"
              value={rates.adviserHourly}
              onChange={(v) => setRate('adviserHourly', v)}
              prefix="$"
              min={0}
              max={1000}
              step={10}
            />
          </div>
          <div>
            <Label htmlFor="adminHourly">Admin / support rate</Label>
            <NumberInput
              id="adminHourly"
              value={rates.adminHourly}
              onChange={(v) => setRate('adminHourly', v)}
              prefix="$"
              min={0}
              max={300}
              step={5}
            />
          </div>
          <div>
            <Label htmlFor="marginPercent">Business margin</Label>
            <NumberInput
              id="marginPercent"
              value={rates.marginPercent}
              onChange={(v) => setRate('marginPercent', v)}
              suffix="%"
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>
      </Card>

      {/* Fixed costs */}
      <Card title="Fixed costs & disbursements">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="initialMeetingCost">Meeting room hire</Label>
            <NumberInput
              id="initialMeetingCost"
              value={costs.initialMeetingCost}
              onChange={(v) => setCost('initialMeetingCost', v)}
              prefix="$"
              min={0}
              step={10}
            />
          </div>
          <div>
            <Label htmlFor="disbursements">Disbursements</Label>
            <NumberInput
              id="disbursements"
              value={costs.disbursements}
              onChange={(v) => setCost('disbursements', v)}
              prefix="$"
              min={0}
              step={50}
            />
            <p className="text-xs text-slate-400 mt-1">Research tools, file fees</p>
          </div>
          <div>
            <Label htmlFor="licenseeCost">Licensee / AFSL cost</Label>
            <NumberInput
              id="licenseeCost"
              value={costs.licenseeCost}
              onChange={(v) => setCost('licenseeCost', v)}
              prefix="$"
              min={0}
              step={50}
            />
          </div>
        </div>
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
          Continue to Ongoing Service
          <svg className="inline w-4 h-4 ml-2 -mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
