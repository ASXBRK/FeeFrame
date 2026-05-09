import { useState } from 'react';
import Nav from '../../components/Nav';
import FooterBar from '../../components/shared/FooterBar';
import ConfirmModal from '../../components/shared/ConfirmModal';
import AdviserDetails from './sections/AdviserDetails';
import ClientDetails from './sections/ClientDetails';
import ReferenceDate from './sections/ReferenceDate';
import FeesNextPeriod from './sections/FeesNextPeriod';
import ServicesNextPeriod from './sections/ServicesNextPeriod';
import DeductionAccounts from './sections/DeductionAccounts';
import RetrospectiveSection from './sections/RetrospectiveSection';
import IndexationSection from './sections/IndexationSection';
import BenchmarkSection from '../../components/benchmarks/BenchmarkSection';
import ProfitabilitySection from '../../components/profitability/ProfitabilitySection';
import { useFeeReviewForm } from './useFeeReviewForm';
import { triggerPdfDownload } from './output/pdfDocument';
import type { FeeReviewState } from './types';

interface Props {
  onGoHome: () => void;
  onNavigate: (page: string) => void;
}

function findFirstErrorAnchor(errors: ReturnType<typeof useFeeReviewForm>['errors']): string | null {
  const order: Array<[keyof typeof errors, string]> = [
    ['adviserName',     'section-adviser'],
    ['licenseeName',    'section-adviser'],
    ['afslNumber',      'section-adviser'],
    ['practiceName',    'section-adviser'],
    ['practiceAddress', 'section-adviser'],
    ['adviserEmail',    'section-adviser'],
    ['clientName',      'section-client'],
    ['referenceDate',   'section-reference-date'],
    ['feeAmount',       'section-fees'],
    ['services',        'section-services'],
    ['accounts',        'section-accounts'],
  ];
  for (const [key, anchor] of order) {
    if (errors[key]) return anchor;
  }
  return null;
}

function deriveAnnualFee(state: FeeReviewState): number {
  if (state.feeStructure === 'fixed') return state.fixedAmount;
  if (state.feeStructure === 'percentage') return state.fuaBalance > 0 ? (state.percentageRate / 100) * state.fuaBalance : 0;
  return state.subscriptionMonthly * 12;
}

export default function FeeReview({ onGoHome, onNavigate }: Props) {
  const form = useFeeReviewForm();
  const { state, set, toggleService, addAccount, updateAccount, removeAccount, reset, errors, warnings, isValid } = form;
  const [showErrors, setShowErrors] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const annualFee = deriveAnnualFee(state);
  const annualCommission = state.insuranceCommissionsEnabled ? state.insuranceCommissionsAmount : 0;

  function handleGenerate() {
    if (!isValid) {
      setShowErrors(true);
      const anchor = findFirstErrorAnchor(errors);
      if (anchor) {
        const el = document.getElementById(anchor);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    triggerPdfDownload(state);
  }

  function handleReset() {
    reset();
    setShowErrors(false);
    setShowResetConfirm(false);
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <>
      <Nav current="landing" onNavigate={p => onNavigate(p)} />
      <div className="min-h-screen bg-light flex flex-col">
        {/* Page header */}
        <header className="bg-white border-b border-light-border px-6 py-5">
          <div className="max-w-4xl mx-auto flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold font-heading text-dark" style={{ letterSpacing: '-0.3px' }}>
                Annual Fee Consent and Renewal
              </h1>
              <p className="text-sm text-mid mt-0.5">
                Generate a DBFO Act–aligned consent document. Stateless — nothing is saved.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onGoHome}
                className="text-xs text-mid hover:text-dark transition-colors"
              >
                ← Home
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-mid hover:text-risk transition-colors"
              >
                Reset form
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 py-6 pb-12 max-w-4xl w-full mx-auto">
          <div className="space-y-5">
            <AdviserDetails state={state} set={set} errors={errors} showErrors={showErrors} />
            <ClientDetails state={state} set={set} errors={errors} showErrors={showErrors} />
            <ReferenceDate state={state} set={set} errors={errors} warnings={warnings} showErrors={showErrors} />
            <FeesNextPeriod state={state} set={set} errors={errors} showErrors={showErrors} />
            <ServicesNextPeriod state={state} set={set} toggleService={toggleService} errors={errors} showErrors={showErrors} />
            <DeductionAccounts
              state={state}
              addAccount={addAccount}
              updateAccount={updateAccount}
              removeAccount={removeAccount}
              errors={errors}
              showErrors={showErrors}
            />
            <RetrospectiveSection state={state} set={set} toggleService={toggleService} />
            <IndexationSection state={state} set={set} />
            <BenchmarkSection
              fee={annualFee}
              feeStructure={state.feeStructure}
              feePercent={state.feeStructure === 'percentage' ? state.percentageRate : undefined}
              clientFUA={state.feeStructure === 'percentage' ? state.fuaBalance : 0}
              hoursPerYear={state.hoursPerYear}
            />
            <ProfitabilitySection
              fee={annualFee}
              commission={annualCommission}
              hoursPerYear={state.hoursPerYear}
              onChangeHours={v => set('hoursPerYear', v)}
            />

            {/* Generate PDF card */}
            <div className="bg-white rounded-card border border-light-border p-5">
              <h3 className="text-base font-bold font-heading text-dark mb-1">Generate consent document</h3>
              <p className="text-xs text-mid mb-4">
                Produces a PDF combining the OFA renewal consent and fee deduction consent in a single document.
              </p>

              {showErrors && errorCount > 0 && (
                <div className="mb-4 bg-risk-bg border border-risk-200 rounded-xl px-4 py-3 text-sm text-risk-text">
                  <span className="font-medium">{errorCount} {errorCount === 1 ? 'item needs' : 'items need'} attention</span> before the document can be generated.
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={showErrors && !isValid}
                className={`w-full py-3 px-6 rounded-input text-sm font-semibold transition-colors ${
                  showErrors && !isValid
                    ? 'bg-light-border text-mid cursor-not-allowed'
                    : 'bg-teal hover:opacity-90 text-white'
                }`}
              >
                {showErrors && !isValid ? 'Resolve errors to continue' : 'Generate PDF'}
              </button>

              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                <span className="font-medium">Draft document.</span> Verify against your licensee’s requirements before issuing to the client.
                FeeFrame does not provide legal or compliance advice.
              </div>
            </div>
          </div>
        </main>

        <FooterBar
          currentPage="feereview"
          onNavigate={p => {
            if (p === 'home') onGoHome();
            else onNavigate(p);
          }}
        />

        {showResetConfirm && (
          <ConfirmModal
            title="Reset the form?"
            message="All entries will be cleared. This cannot be undone."
            confirmLabel="Reset"
            onConfirm={handleReset}
            onCancel={() => setShowResetConfirm(false)}
          />
        )}
      </div>
    </>
  );
}

// Re-export type for any consumer that imports the module barrel.
export type { FeeReviewState };
