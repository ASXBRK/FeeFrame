import feeanalysisLogo from '../../assets/logos/feeanalysis-light.svg';

export default function FeeAnalysisComingSoon({ onGoHome, onNavigate }: {
  onGoHome: () => void;
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="min-h-screen bg-light flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">

        <img
          src={feeanalysisLogo}
          alt="FeeAnalysis"
          className="h-12 mx-auto"
        />

        <div className="space-y-3">
          <h1 className="text-3xl font-bold font-heading text-dark" style={{ letterSpacing: '-0.5px' }}>
            Coming Soon
          </h1>
          <p className="text-mid text-base leading-relaxed">
            FeeAnalysis — profitability checking for existing clients — is in development. Check back soon.
          </p>
        </div>

        <div className="border-t border-light-border pt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigate('feequote')}
            className="px-5 py-2.5 bg-teal text-white text-sm font-semibold font-heading rounded-input hover:opacity-90 transition-opacity"
          >
            Open FeeQuote
          </button>
          <button
            onClick={onGoHome}
            className="px-5 py-2.5 bg-white border border-light-border text-dark text-sm font-semibold font-heading rounded-input hover:bg-light-surface transition-colors"
          >
            Back to home
          </button>
        </div>

      </div>
    </div>
  );
}
