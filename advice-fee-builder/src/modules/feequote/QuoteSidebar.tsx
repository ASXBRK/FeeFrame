import feeframeLogo from '../../assets/logos/feeframe-light.svg';
import feequoteLogo from '../../assets/logos/feequote-light.svg';

const STEPS = [
  { number: 1, label: 'Client Profile' },
  { number: 2, label: 'Scope of Advice' },
  { number: 3, label: 'Ongoing Service' },
  { number: 4, label: 'Adjustments' },
  { number: 5, label: 'Fee Summary' },
];

export default function QuoteSidebar({ currentStep, maxStep, onStepClick, onGoHome }: { currentStep: number; maxStep: number; onStepClick: (n: number) => void; onGoHome: () => void }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-dark text-white min-h-screen flex-shrink-0">
        <div className="px-5 py-6 border-b border-dark-border">
          <button
            onClick={onGoHome}
            className="block hover:opacity-75 transition-opacity mb-4"
          >
            <img src={feeframeLogo} alt="FeeFrame" style={{ height: '20px' }} />
          </button>
          <img src={feequoteLogo} alt="FeeQuote" style={{ height: '44px' }} />
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
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-input text-sm transition-colors ${
                  active
                    ? 'bg-teal text-white font-medium'
                    : locked
                    ? 'text-dark-border cursor-not-allowed'
                    : done
                    ? 'text-light-border hover:bg-dark-surface'
                    : 'text-light-border hover:bg-dark-surface'
                }`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  active ? 'bg-white text-teal' : done ? 'bg-teal text-white' : locked ? 'bg-dark-surface text-dark-border' : 'bg-dark-border text-mid'
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
      <div className="md:hidden bg-dark text-white px-4 py-3 flex items-center justify-between">
        <button onClick={onGoHome} className="flex items-center gap-3 hover:opacity-75 transition-opacity">
          <img src={feeframeLogo} alt="FeeFrame" style={{ height: '18px' }} />
          <span className="text-dark-border text-xs">|</span>
          <img src={feequoteLogo} alt="FeeQuote" style={{ height: '22px' }} />
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
                    ? 'bg-teal text-white'
                    : step.number < currentStep
                    ? 'bg-teal-light text-teal'
                    : locked
                    ? 'bg-dark-surface text-dark-border cursor-not-allowed'
                    : 'bg-dark-border text-mid'
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
