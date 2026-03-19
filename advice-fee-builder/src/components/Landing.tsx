import logoLight from '../assets/logos/feeframe-primary-light.svg';
import feequoteLogo from '../assets/logos/feequote-light.svg';
import feeanalysisLogo from '../assets/logos/feeanalysis-light.svg';

export default function Landing({ onStartQuote, onStartAnalysis }) {
  return (
    <div className="min-h-screen bg-light flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-light-border px-8 py-5">
        <img src={logoLight} alt="FeeFrame" className="h-12" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-semibold font-heading text-dark mb-3 text-center">
            Advice fee tools
          </h1>
          <p className="text-lg text-mid text-center mb-10">
            Built for Australian financial advisers and paraplanners. No login. No cost.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* FeeQuote card */}
            <div className="bg-white rounded-card border border-light-border shadow-card p-12 flex flex-col min-w-[320px]">
              <div className="mb-8">
                <img src={feequoteLogo} alt="FeeQuote" className="h-14" />
              </div>
              <h2 className="text-2xl font-semibold font-heading text-dark mb-3">What should I charge?</h2>
              <p className="text-base text-mid mb-10 flex-1">
                Scope a client engagement and generate a justified fee.
              </p>
              <button
                onClick={onStartQuote}
                className="w-full bg-teal hover:opacity-90 text-white font-semibold py-4 px-4 rounded-input transition-opacity text-base"
              >
                Start Quote →
              </button>
            </div>

            {/* FeeAnalysis card */}
            <div className="bg-white rounded-card border border-light-border shadow-card p-12 flex flex-col min-w-[320px]">
              <div className="mb-8">
                <img src={feeanalysisLogo} alt="FeeAnalysis" className="h-14" />
              </div>
              <h2 className="text-2xl font-semibold font-heading text-dark mb-3">Am I making money?</h2>
              <p className="text-base text-mid mb-10 flex-1">
                Check if you're actually making money on a client.
              </p>
              <button
                onClick={onStartAnalysis}
                className="w-full bg-teal hover:opacity-90 text-white font-semibold py-4 px-4 rounded-input transition-opacity text-base"
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
