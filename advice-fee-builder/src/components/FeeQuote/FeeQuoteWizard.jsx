import { useState } from 'react';
import QuoteSidebar from './QuoteSidebar.jsx';
import Step1ClientProfile from './Step1ClientProfile.jsx';
import Step2ScopeOfAdvice from './Step2ScopeOfAdvice.jsx';
import Step3Adjustments from './Step3Adjustments.jsx';
import Step4OngoingService from './Step4OngoingService.jsx';
import Step5Summary from './Step5Summary.jsx';
import ConfirmModal from '../shared/ConfirmModal.jsx';

export default function FeeQuoteWizard({ state, dispatch, onGoHome, onGoAnalysis }) {
  const [showReset, setShowReset] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const { quoteStep, quote } = state;

  const goToStep = (step) => dispatch({ type: 'SET_QUOTE_STEP', step });
  const next = () => goToStep(Math.min(quoteStep + 1, 5));
  const back = () => goToStep(Math.max(quoteStep - 1, 1));

  function handleReset() {
    dispatch({ type: 'RESET_QUOTE' });
    setShowReset(false);
  }

  const sharedProps = { quote, dispatch, onNext: next, onBack: back };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <QuoteSidebar
        currentStep={quoteStep}
        onStepClick={goToStep}
        onGoHome={onGoHome}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between print:hidden">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Step {quoteStep} of 5
            </span>
            <div className="w-48 h-1.5 bg-gray-200 rounded-full mt-1.5">
              <div
                className="h-1.5 bg-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${(quoteStep / 5) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setShowReset(true)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Reset quote
          </button>
        </div>

        {/* Step content */}
        <main className="flex-1 overflow-auto px-4 sm:px-6 py-6 max-w-4xl w-full mx-auto">
          {quoteStep === 1 && <Step1ClientProfile {...sharedProps} />}
          {quoteStep === 2 && <Step2ScopeOfAdvice {...sharedProps} />}
          {quoteStep === 3 && <Step3Adjustments {...sharedProps} />}
          {quoteStep === 4 && <Step4OngoingService {...sharedProps} />}
          {quoteStep === 5 && (
            <Step5Summary
              {...sharedProps}
              onGoAnalysis={onGoAnalysis}
              onReset={() => setShowReset(true)}
            />
          )}
        </main>
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
