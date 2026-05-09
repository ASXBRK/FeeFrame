import { useState, useRef, useEffect } from 'react';
import QuoteSidebar from './QuoteSidebar';
import FooterBar from '../../components/shared/FooterBar';
import { useDocumentMeta } from '../../lib/useDocumentMeta';
import Step1ClientProfile from './Step1ClientProfile';
import Step2ScopeOfAdvice from './Step2ScopeOfAdvice';
import Step3OngoingService from './Step3OngoingService';
import Step4Adjustments from './Step4Adjustments';
import Step5Summary from './Step5Summary';
import ConfirmModal from '../../components/shared/ConfirmModal';

const STEP_LABELS = ['', 'Next: Scope of Advice →', 'Next: Ongoing Service →', 'Next: Adjustments →', 'Next: Fee Summary →'];

export default function FeeQuoteWizard({ state, dispatch, onGoHome, onNavigate }: { state: any; dispatch: any; onGoHome: () => void; onNavigate: (page: string) => void }) {
  useDocumentMeta({ title: 'FeeQuote — Build a justified fee for new client engagements', description: 'A five-step wizard that builds a defensible fee from cost up. Practice overheads, service mix, target margin — every assumption traceable.', ogUrl: 'https://feeframe.com/feequote' });
  const [showReset, setShowReset] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const { quoteStep, maxQuoteStep, quote } = state;

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const footer = footerRef.current;
    if (!scrollContainer || !footer) return;

    function handleScroll() {
      const containerRect = scrollContainer!.getBoundingClientRect();
      const footerRect = footer!.getBoundingClientRect();
      const overlap = containerRect.bottom - footerRect.top;
      setFooterOffset(overlap > 0 ? overlap + 16 : 0);
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [quoteStep]);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [quoteStep]);

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
      <div ref={scrollContainerRef} className="flex-1 flex flex-col min-w-0 md:ml-56 h-screen overflow-y-auto">
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

        {/* Step content — pb-40 clears floating nav (≈48px buttons + spacing) */}
        <main className="flex-1 px-4 sm:px-6 py-6 pb-40 max-w-4xl w-full mx-auto">
          {quoteStep === 1 && <Step1ClientProfile {...sharedProps} />}
          {quoteStep === 2 && <Step2ScopeOfAdvice {...sharedProps} />}
          {quoteStep === 3 && <Step3OngoingService {...sharedProps} />}
          {quoteStep === 4 && <Step4Adjustments {...sharedProps} />}
          {quoteStep === 5 && (
            <Step5Summary
              {...sharedProps}
              onReset={() => setShowReset(true)}
              onNavigate={onNavigate}
            />
          )}
        </main>

        {/* Footer — full width (outside max-w-4xl), pushed to bottom on short pages */}
        <div ref={footerRef} className="mt-16 print:hidden">
          <FooterBar currentPage="feequote" onNavigate={handleNavigate} />
        </div>
      </div>

      {/* Mobile: full-width nav bar pinned to bottom */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden flex items-center gap-3 z-30 print:hidden bg-white border-t border-light-border px-4 py-3 justify-between">
        {quoteStep > 1 ? (
          <button
            onClick={back}
            className="bg-white text-mid hover:text-dark font-medium py-2.5 px-5 rounded-input border border-light-border hover:border-mid shadow-card hover:shadow-card-hover transition-all text-sm"
          >
            ← Back
          </button>
        ) : (
          <div />
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

      {/* Desktop: floating buttons, slide up when footer becomes visible */}
      <div
        className="hidden md:flex fixed right-6 md:right-8 items-center gap-3 z-30 print:hidden transition-all duration-150"
        style={{ bottom: `${Math.max(32, footerOffset + 32)}px` }}
      >
        {quoteStep > 1 && (
          <button
            onClick={back}
            className="bg-white text-mid hover:text-dark font-medium py-2.5 px-5 rounded-input border border-light-border hover:border-mid shadow-card hover:shadow-card-hover transition-all text-sm"
          >
            ← Back
          </button>
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
