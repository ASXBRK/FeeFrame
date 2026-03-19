export default function Landing({ onStartQuote, onStartAnalysis }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* ── Hero — dark, big logo ───────────────────────────── */}
      <section className="bg-dark flex flex-col items-center justify-center flex-shrink-0 h-2/5 px-8">
        {/* Inline logo — brackets + wordmark in real DM Sans at display scale */}
        <div className="flex items-center gap-3 mb-5">
          <svg width="28" height="72" viewBox="0 0 28 72" fill="none">
            <path d="M20 2 L4 2 L4 70 L20 70" stroke="#5eead4" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter"/>
          </svg>
          <span className="font-heading font-semibold text-white leading-none"
                style={{ fontSize: '72px', letterSpacing: '-2px' }}>
            FeeFrame
          </span>
          <svg width="28" height="72" viewBox="0 0 28 72" fill="none">
            <path d="M8 2 L24 2 L24 70 L8 70" stroke="#5eead4" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter"/>
          </svg>
        </div>
        <p className="font-body text-dark-border text-base tracking-wide text-center">
          Advice fee tools for Australian financial advisers and paraplanners
        </p>
      </section>

      {/* ── Module panels — fill remaining height ──────────── */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">

        {/* FeeQuote */}
        <div className="flex flex-col justify-between p-10 lg:p-14 bg-white border-r border-light-border overflow-y-auto">
          <div>
            <p className="font-heading text-label uppercase tracking-widest text-mid mb-5">
              Fee calculator
            </p>
            <div className="font-heading font-bold text-teal text-display leading-none mb-6">
              [ FeeQuote ]
            </div>
            <h2 className="font-heading text-h1 text-dark mb-3">
              What should I charge?
            </h2>
            <p className="font-body text-body-lg text-mid max-w-sm">
              Scope a client engagement service by service, estimate time, and
              arrive at a fee you can justify.
            </p>
          </div>
          <div className="mt-10">
            <button
              onClick={onStartQuote}
              className="bg-teal hover:opacity-90 text-white font-heading font-semibold py-3.5 px-8 rounded-input transition-opacity text-base"
            >
              Start Quote →
            </button>
          </div>
        </div>

        {/* FeeAnalysis */}
        <div className="flex flex-col justify-between p-10 lg:p-14 bg-light overflow-y-auto">
          <div>
            <p className="font-heading text-label uppercase tracking-widest text-mid mb-5">
              Profitability check
            </p>
            <div className="font-heading font-bold text-teal text-display leading-none mb-6">
              [ FeeAnalysis ]
            </div>
            <h2 className="font-heading text-h1 text-dark mb-3">
              Am I making money?
            </h2>
            <p className="font-body text-body-lg text-mid max-w-sm">
              Enter a client's fee and the time you actually spend. See whether
              the implied hourly rate holds up.
            </p>
          </div>
          <div className="mt-10">
            <button
              onClick={onStartAnalysis}
              className="bg-teal hover:opacity-90 text-white font-heading font-semibold py-3.5 px-8 rounded-input transition-opacity text-base"
            >
              Analyse →
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
