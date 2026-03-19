export default function Landing({ onStartQuote, onStartAnalysis }) {
  return (
    <div className="min-h-screen bg-light flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-light-border px-10 py-6 flex-shrink-0">
        <span className="font-heading font-bold text-teal tracking-tight" style={{ fontSize: '28px' }}>
          [ FeeFrame ]
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16">

        <div className="text-center mb-14">
          <h1 className="font-heading font-bold text-dark mb-4" style={{ fontSize: '42px', letterSpacing: '-0.5px' }}>
            Advice fee tools
          </h1>
          <p className="text-mid" style={{ fontSize: '18px' }}>
            Built for Australian financial advisers and paraplanners.&nbsp;
            <span className="text-dark font-medium">No login. No cost.</span>
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full" style={{ maxWidth: '860px' }}>

          {/* FeeQuote */}
          <div className="bg-white rounded-card border border-light-border shadow-card flex flex-col" style={{ padding: '48px' }}>
            <div className="mb-8">
              <span className="font-heading font-bold text-teal" style={{ fontSize: '32px', letterSpacing: '-0.5px' }}>
                [ FeeQuote
              </span>
            </div>
            <h2 className="font-heading font-semibold text-dark mb-4" style={{ fontSize: '26px' }}>
              What should I charge?
            </h2>
            <p className="text-mid flex-1 mb-10" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Scope a client engagement and generate a justified fee.
            </p>
            <button
              onClick={onStartQuote}
              className="w-full bg-teal text-white font-heading font-semibold rounded-input hover:opacity-90 transition-opacity"
              style={{ padding: '18px 24px', fontSize: '17px' }}
            >
              Start Quote →
            </button>
          </div>

          {/* FeeAnalysis */}
          <div className="bg-white rounded-card border border-light-border shadow-card flex flex-col" style={{ padding: '48px' }}>
            <div className="mb-8">
              <span className="font-heading font-bold text-teal" style={{ fontSize: '32px', letterSpacing: '-0.5px' }}>
                FeeAnalysis ]
              </span>
            </div>
            <h2 className="font-heading font-semibold text-dark mb-4" style={{ fontSize: '26px' }}>
              Am I making money?
            </h2>
            <p className="text-mid flex-1 mb-10" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Check if you're actually making money on a client.
            </p>
            <button
              onClick={onStartAnalysis}
              className="w-full bg-teal text-white font-heading font-semibold rounded-input hover:opacity-90 transition-opacity"
              style={{ padding: '18px 24px', fontSize: '17px' }}
            >
              Analyse →
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-light-border">
        <span className="text-mid" style={{ fontSize: '13px' }}>
          For Australian financial advice practices · Free to use · No data stored
        </span>
      </footer>

    </div>
  );
}
