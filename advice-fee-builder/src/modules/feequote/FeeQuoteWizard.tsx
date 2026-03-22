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

  function handleNavigate(page) {
    if (page === 'home') onGoHome();
    else onNavigate(page);
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

      {/* Content column: overflow-auto here so scrollbar sits at the browser edge */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-56 h-screen overflow-y-auto">
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

        {/* Step content — pb-12 clears floating nav; footer below provides additional bottom space */}
        <main className="flex-1 px-4 sm:px-6 py-6 pb-12 max-w-4xl w-full mx-auto">
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

        {/* Footer — full width (outside max-w-4xl), pushed to bottom on short pages */}
        <div className="mt-auto print:hidden">
          <FooterBar currentPage="feequote" onNavigate={handleNavigate} />
        </div>
      </div>

      {/* Floating navigation buttons — fixed to viewport, never hidden behind content.
          Mobile: full-width bottom bar. Desktop: floating bottom-right. */}
      <div className="fixed bottom-0 left-0 right-0 md:bottom-8 md:right-8 md:left-auto flex items-center gap-3 z-30 print:hidden bg-white border-t border-light-border px-4 py-3 md:bg-transparent md:border-0 md:p-0 justify-between md:justify-end">
        {quoteStep > 1 ? (
          <button
            onClick={back}
            className="bg-white text-mid hover:text-dark font-medium py-2.5 px-5 rounded-input border border-light-border hover:border-mid shadow-card hover:shadow-card-hover transition-all text-sm"
          >
            ← Back
          </button>
        ) : (
          <div className="md:hidden" />
        )}
        {quoteStep < 5 && (
          <button
            onClick={next}
            className="bg-teal hover:opacity-90 text-white font-medium py-2.5 px-6 rounded-input shadow-card hover:shadow-card-hover transition-all text-sm"
          >
            {STEP_LABELS[quoteStep]}
          </button>
        )}
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
