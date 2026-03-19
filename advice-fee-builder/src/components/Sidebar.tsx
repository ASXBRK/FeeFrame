const STEPS = [
  {
    num: 1,
    label: 'Fee Model',
    desc: 'How you charge',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: 2,
    label: 'Client Profile',
    desc: 'Who you\'re advising',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    num: 3,
    label: 'Time & Costs',
    desc: 'Hours and expenses',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: 4,
    label: 'Ongoing Service',
    desc: 'Annual review terms',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    num: 5,
    label: 'Results',
    desc: 'Fee output & export',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function Sidebar({ currentStep, onStepClick, onReset, draftSaved }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-navy-800 text-white print:hidden">
        {/* Logo / App name */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-heading font-700 text-sm text-white leading-tight">Advice Fee</div>
              <div className="font-heading font-700 text-sm text-teal-400 leading-tight">Builder</div>
            </div>
          </div>
          <p className="mt-2 text-xs text-white/40 leading-relaxed">
            Professional fee justification for Australian advisers
          </p>
        </div>

        {/* Steps */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {STEPS.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            const isClickable = step.num <= currentStep;

            return (
              <button
                key={step.num}
                onClick={() => isClickable && onStepClick(step.num)}
                disabled={!isClickable}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
                    : isCompleted
                    ? 'text-white/80 hover:bg-white/10 cursor-pointer'
                    : 'text-white/30 cursor-not-allowed'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-teal-500/30 text-teal-400'
                      : 'bg-white/5 text-white/20'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold font-heading truncate ${
                    isActive ? 'text-white' : isCompleted ? 'text-white/80' : 'text-white/30'
                  }`}>
                    {step.label}
                  </div>
                  <div className={`text-xs truncate ${
                    isActive ? 'text-teal-200' : isCompleted ? 'text-white/40' : 'text-white/20'
                  }`}>
                    {step.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10 space-y-2">
          {draftSaved && (
            <div className="flex items-center gap-1.5 text-xs text-teal-400/70">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400/70" />
              Draft saved
            </div>
          )}
          <button
            onClick={onReset}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset all inputs
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden bg-navy-800 text-white print:hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-heading font-semibold text-sm">Advice Fee Builder</span>
          </div>
          <div className="flex items-center gap-2">
            {draftSaved && (
              <span className="text-xs text-teal-400/70">Saved</span>
            )}
            <button onClick={onReset} className="text-white/40 hover:text-white/70 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile step indicators */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto">
          {STEPS.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                onClick={() => step.num <= currentStep && onStepClick(step.num)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : isCompleted
                    ? 'bg-white/10 text-white/70'
                    : 'bg-white/5 text-white/20'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.num}</span>
                )}
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
