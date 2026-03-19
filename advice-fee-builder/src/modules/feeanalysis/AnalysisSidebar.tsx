import feeframeLogo from '../../assets/logos/feeframe-primary-light.svg';
import feeanalysisLogo from '../../assets/logos/feeanalysis-light.svg';

const SECTIONS = [
  { id: 'fee-inputs',    label: 'Fee Inputs' },
  { id: 'cost-inputs',   label: 'Cost Inputs' },
  { id: 'profitability', label: 'Profitability' },
];

export default function AnalysisSidebar({ onGoHome, onGoQuote, onReset }: { onGoHome: () => void; onGoQuote: () => void; onReset: () => void }) {
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
          <img src={feeanalysisLogo} alt="FeeAnalysis" style={{ height: '44px' }} />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-input text-sm text-light-border hover:bg-dark-surface transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-dark-border space-y-1">
          <button
            onClick={onGoQuote}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium text-teal-light hover:bg-dark-surface transition-colors"
          >
            ← Back to FeeQuote
          </button>
          <button
            onClick={onReset}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-input text-sm text-dark-border hover:text-risk transition-colors"
          >
            Reset
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden bg-dark text-white px-4 py-3 flex items-center justify-between">
        <button onClick={onGoHome} className="flex items-center gap-3 hover:opacity-75 transition-opacity">
          <img src={feeframeLogo} alt="FeeFrame" style={{ height: '18px' }} />
          <span className="text-dark-border text-xs">|</span>
          <img src={feeanalysisLogo} alt="FeeAnalysis" style={{ height: '22px' }} />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onGoQuote}
            className="text-xs font-medium text-teal-light hover:opacity-75 transition-opacity"
          >
            ← FeeQuote
          </button>
          <button
            onClick={onReset}
            className="text-xs text-dark-border hover:text-risk transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}
