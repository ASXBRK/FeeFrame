import logoLight from '../assets/logos/feeframe-primary-light.svg';

export default function Landing({ onStartQuote, onStartAnalysis }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">

      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-light-border px-8 py-4">
        <img src={logoLight} alt="FeeFrame" className="h-10" />
      </header>

      {/* Split panels — fill all remaining height */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">

        {/* ── FeeQuote panel ─────────────────────────────── */}
        <div className="flex flex-col justify-between p-12 lg:p-16 bg-white border-r border-light-border overflow-y-auto">
          <div>
            <p className="text-label font-heading uppercase tracking-widest text-mid mb-6">
              Fee calculator
            </p>
            <div className="text-display-lg font-heading font-bold text-teal leading-none mb-8">
              [ FeeQuote ]
            </div>
            <h2 className="text-h1 font-heading text-dark mb-4">
              What should I charge?
            </h2>
            <p className="text-body-lg text-mid max-w-sm">
              Scope a client engagement service by service, estimate time, and
              arrive at a fee you can justify.
            </p>
          </div>
          <div className="mt-12">
            <button
              onClick={onStartQuote}
              className="bg-teal hover:opacity-90 text-white font-heading font-semibold py-4 px-8 rounded-input transition-opacity text-base"
            >
              Start Quote →
            </button>
          </div>
        </div>

        {/* ── FeeAnalysis panel ──────────────────────────── */}
        <div className="flex flex-col justify-between p-12 lg:p-16 bg-light overflow-y-auto">
          <div>
            <p className="text-label font-heading uppercase tracking-widest text-mid mb-6">
              Profitability check
            </p>
            <div className="text-display-lg font-heading font-bold text-teal leading-none mb-8">
              [ FeeAnalysis ]
            </div>
            <h2 className="text-h1 font-heading text-dark mb-4">
              Am I making money?
            </h2>
            <p className="text-body-lg text-mid max-w-sm">
              Enter a client's fee and the time you actually spend. See whether
              the implied hourly rate holds up.
            </p>
          </div>
          <div className="mt-12">
            <button
              onClick={onStartAnalysis}
              className="bg-teal hover:opacity-90 text-white font-heading font-semibold py-4 px-8 rounded-input transition-opacity text-base"
            >
              Analyse →
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
