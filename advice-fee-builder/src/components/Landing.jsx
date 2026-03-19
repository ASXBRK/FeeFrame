import logoLight from '../assets/logos/feeframe-primary-light.svg';
import feequoteLogo from '../assets/logos/feequote-light.svg';
import feeanalysisLogo from '../assets/logos/feeanalysis-light.svg';

export default function Landing({ onStartQuote, onStartAnalysis }) {
  return (
    <div className="min-h-screen bg-light flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-light-border px-6 py-4">
        <img src={logoLight} alt="FeeFrame" className="h-8" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-semibold font-heading text-dark mb-2 text-center">
            Advice fee tools
          </h1>
          <p className="text-mid text-center mb-12">
            Built for Australian financial advisers and paraplanners.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* FeeQuote card */}
            <div className="bg-white rounded-card border border-light-border shadow-card p-8 flex flex-col">
              <div className="mb-4">
                <img src={feequoteLogo} alt="FeeQuote" className="h-8" />
              </div>
              <h2 className="text-lg font-semibold text-dark mb-2">What should I charge?</h2>
              <p className="text-sm text-mid mb-8 flex-1">
                Scope a client engagement and generate a justified fee.
              </p>
              <button
                onClick={onStartQuote}
                className="w-full bg-teal hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-input transition-opacity text-sm"
              >
                Start Quote →
              </button>
            </div>

            {/* FeeAnalysis card */}
            <div className="bg-white rounded-card border border-light-border shadow-card p-8 flex flex-col">
              <div className="mb-4">
                <img src={feeanalysisLogo} alt="FeeAnalysis" className="h-8" />
              </div>
              <h2 className="text-lg font-semibold text-dark mb-2">Am I making money?</h2>
              <p className="text-sm text-mid mb-8 flex-1">
                Check if you're actually making money on a client.
              </p>
              <button
                onClick={onStartAnalysis}
                className="w-full bg-teal hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-input transition-opacity text-sm"
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
