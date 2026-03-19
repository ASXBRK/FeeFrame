import logoLight from '../assets/logos/feeframe-primary-light.svg';

export default function Landing({ onStartQuote, onStartAnalysis }) {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <img src={logoLight} alt="FeeFrame" className="h-7" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-semibold font-heading text-navy-900 mb-2 text-center">
            Advice fee tools
          </h1>
          <p className="text-gray-500 text-center mb-12">
            Built for Australian financial advisers and paraplanners.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* FeeQuote card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex flex-col">
              <div className="mb-1">
                <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">FeeQuote</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">What should I charge?</h2>
              <p className="text-sm text-gray-500 mb-8 flex-1">
                Scope a client engagement and generate a justified fee.
              </p>
              <button
                onClick={onStartQuote}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                Start Quote →
              </button>
            </div>

            {/* FeeAnalysis card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex flex-col">
              <div className="mb-1">
                <span className="text-xs font-medium text-brand-500 uppercase tracking-wide">FeeAnalysis</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Am I making money?</h2>
              <p className="text-sm text-gray-500 mb-8 flex-1">
                Check if you're actually making money on a client.
              </p>
              <button
                onClick={onStartAnalysis}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                Analyse →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
