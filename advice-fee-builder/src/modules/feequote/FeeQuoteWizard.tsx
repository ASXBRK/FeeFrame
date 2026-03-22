import { useState } from 'react';
import QuoteSidebar from './QuoteSidebar';
import FooterBar from '../../components/shared/FooterBar';
import Step1ClientProfile from './Step1ClientProfile';
import Step2ScopeOfAdvice from './Step2ScopeOfAdvice';
import Step3OngoingService from './Step3OngoingService';
import Step4Adjustments from './Step4Adjustments';
import Step5Summary from './Step5Summary';
import ConfirmModal from '../../components/shared/ConfirmModal';

const STEP_LABELS = ['', 'Next: Scope of Advice →', 'Next: Ongoing Service →', 'Next: Adjustments →', 'Next: Fee Summary →'];

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
    <div className="flex flex-col md:flex-row h-screen bg-light">
      {/* Sidebar: fixed on desktop (z-40), sticky on mobile (handled inside QuoteSidebar) */}
      <QuoteSidebar
        currentStep={quoteStep}
        maxStep={maxQuoteStep}
        onStepClick={goToStep}
        onGoHome={onGoHome}
      />

      {/* Content column: offset by sidebar width on desktop, fills remaining height */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-56">
        {/* Progress bar — sticky so it stays visible as content scrolls */}
        <div className="bg-white border-b border-light-border px-6 py-3 flex items-center justify-between print:hidden sticky top-0 z-30 flex-shrink-0">
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

        {/* Scrollable step content — pb-24 ensures content clears the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-24 max-w-4xl w-full mx-auto">
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

          {/* Footer inside scrollable area — visible when scrolled to end */}
          <FooterBar
            currentPage="feequote"
            onNavigate={(page) => {
              if (page === 'home') onGoHome();
              else onNavigate(page);
            }}
          />
        </main>

        {/* Bottom navigation bar — sticky so Back/Next are always reachable */}
        <div className="bg-white border-t border-light-border px-6 py-3 print:hidden sticky bottom-0 z-30 flex-shrink-0">
          <div className="max-w-4xl w-full mx-auto flex justify-between items-center">
            {quoteStep > 1 ? (
              <button
                onClick={back}
                className="text-sm text-mid hover:text-dark font-medium py-2.5 px-4 rounded-input border border-light-border hover:border-mid transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
            {quoteStep < 5 && (
              <button
                onClick={next}
                className="bg-teal hover:opacity-90 text-white font-semibold py-2.5 px-6 rounded-input transition-opacity text-sm"
              >
                {STEP_LABELS[quoteStep]}
              </button>
            )}
          </div>
        </div>
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
