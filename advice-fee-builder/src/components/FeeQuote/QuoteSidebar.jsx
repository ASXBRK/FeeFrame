import logoLight from '../../assets/logos/feeframe-primary-light.svg';

const STEPS = [
  { number: 1, label: 'Client Profile' },
  { number: 2, label: 'Scope of Advice' },
  { number: 3, label: 'Adjustments' },
  { number: 4, label: 'Ongoing Service' },
  { number: 5, label: 'Fee Summary' },
];

export default function QuoteSidebar({ currentStep, maxStep, onStepClick, onGoHome }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-navy-900 text-white min-h-screen flex-shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <button
            onClick={onGoHome}
            className="block hover:opacity-80 transition-opacity"
          >
            {/* brightness(0) invert(1) renders the dark logo as white on navy */}
            <img src={logoLight} alt="FeeFrame" className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
          </button>
          <div className="text-xs text-teal-400 mt-1.5 font-medium">FeeQuote</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {STEPS.map((step) => {
            const done = step.number < currentStep;
            const active = step.number === currentStep;
            const locked = step.number > maxStep;
            return (
              <button
                key={step.number}
                onClick={() => !locked && onStepClick(step.number)}
                disabled={locked}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-teal-600 text-white font-medium'
                    : locked
                    ? 'text-gray-600 cursor-not-allowed'
                    : done
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  active ? 'bg-white text-teal-600' : done ? 'bg-teal-600 text-white' : locked ? 'bg-gray-800 text-gray-600' : 'bg-gray-700 text-gray-400'
                }`}>
                  {done ? '✓' : step.number}
                </span>
                {step.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden bg-navy-900 text-white px-4 py-3 flex items-center justify-between">
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logoLight} alt="FeeFrame" className="h-5" style={{ filter: 'brightness(0) invert(1)' }} />
          <span className="text-teal-400 text-xs font-medium">/ FeeQuote</span>
        </button>
        <div className="flex gap-1">
          {STEPS.map((step) => {
            const locked = step.number > maxStep;
            return (
              <button
                key={step.number}
                onClick={() => !locked && onStepClick(step.number)}
                disabled={locked}
                className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                  step.number === currentStep
                    ? 'bg-teal-600 text-white'
                    : step.number < currentStep
                    ? 'bg-teal-800 text-teal-300'
                    : locked
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-700 text-gray-500'
                }`}
              >
                {step.number < currentStep ? '✓' : step.number}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
