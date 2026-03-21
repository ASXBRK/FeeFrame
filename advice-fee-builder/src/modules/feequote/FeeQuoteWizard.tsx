import { useState } from 'react';
import QuoteSidebar from './QuoteSidebar';
import FooterBar from '../../components/shared/FooterBar';
import Step1ClientProfile from './Step1ClientProfile';
import Step2ScopeOfAdvice from './Step2ScopeOfAdvice';
import Step3OngoingService from './Step3OngoingService';
import Step4Adjustments from './Step4Adjustments';
import Step5Summary from './Step5Summary';
import ConfirmModal from '../../components/shared/ConfirmModal';

export default function FeeQuoteWizard({ state, dispatch, onGoHome, onGoAnalysis, onNavigate }: { state: any; dispatch: any; onGoHome: () => void; onGoAnalysis: (fees: any) => void; onNavigate: (page: string) => void }) {
  const [showReset, setShowReset] = useState(false);

  const { quoteStep, maxQuoteStep, quote } = state;

  const goToStep = (step) => dispatch({ type: 'SET_QUOTE_STEP', step });
  const next = () => goToStep(Math.min(quoteStep + 1, 5));
  const back = () => goToStep(Math.max(quoteStep - 1, 1));

  function handleReset() {
    dispatch({ type: 'RESET_QUOTE' });
    setShowReset(false);
  }

  const sharedProps = { quote, dispatch, onNext: next, onBack: back };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      <QuoteSidebar
        currentStep={quoteStep}
        maxStep={maxQuoteStep}
        onStepClick={goToStep}
        onGoHome={onGoHome}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-light-border px-6 py-3 flex items-center justify-between print:hidden">
          <div>
            <span className="text-sm font-medium text-dark">
              Step {quoteStep} of 5
            </span>
            <div className="w-48 h-1.5 bg-light-border rounded-full mt-1.5">
              <div
                className="h-1.5 bg-teal rounded-full transition-all duration-300"
                style={{ width: `${(quoteStep / 5) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setShowReset(true)}
            className="text-xs text-mid hover:text-risk transition-colors"
          >
            Reset quote
          </button>
        </div>

        {/* Step content */}
        <main className="flex-1 overflow-auto px-4 sm:px-6 py-6 max-w-4xl w-full mx-auto">
          {quoteStep === 1 && <Step1ClientProfile {...sharedProps} />}
          {quoteStep === 2 && <Step2ScopeOfAdvice {...sharedProps} />}
          {quoteStep === 3 && <Step3OngoingService {...sharedProps} />}
          {quoteStep === 4 && <Step4Adjustments {...sharedProps} />}
          {quoteStep === 5 && (
            <Step5Summary
              {...sharedProps}
              onGoAnalysis={onGoAnalysis}
              onReset={() => setShowReset(true)}
              onNavigate={onNavigate}
            />
          )}
        </main>

        <FooterBar
          currentPage="feequote"
          onNavigate={(page) => {
            if (page === 'home') onGoHome();
            else onNavigate(page);
          }}
        />
      </div>

      <ConfirmModal
        isOpen={showReset}
        title="Reset quote?"
        message="This will clear all inputs and return to defaults. This cannot be undone."
        confirmLabel="Reset"
        onConfirm={handleReset}
        onCancel={() => setShowReset(false)}
      />
    </div>
  );
}
