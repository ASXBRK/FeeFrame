import { useState, useEffect } from 'react';
import type { BenchmarkFeeStructure, AdviceComplexity } from '../../lib/benchmarks/types';
import type { PracticeProfile } from '../../lib/practiceProfile/types';
import { loadPracticeProfile, clearPracticeProfile } from '../../lib/practiceProfile/storage';
import { deriveAnchors } from '../../lib/benchmarks/segmentationEngine';
import { deriveCostJustifiedFee } from '../../lib/benchmarks/costJustifiedEngine';
import SpectrumChart from './SpectrumChart';
import BenchmarkNarrative from './BenchmarkNarrative';
import NoDataPanel from './NoDataPanel';
import PracticeProfileForm from '../shared/PracticeProfileForm';
import PracticeProfilePill from '../shared/PracticeProfilePill';

interface Props {
  fee: number;
  feeStructure: BenchmarkFeeStructure;
  feePercent?: number;
  clientFUA?: number;
  hoursPerYear?: number;
  adviceComplexity?: AdviceComplexity;
  defaultOpen?: boolean;
}

const DEFAULT_HOURS = 10;

export default function BenchmarkSection({ fee, feeStructure, feePercent, clientFUA: propFUA = 0, hoursPerYear = DEFAULT_HOURS, adviceComplexity, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [profile, setProfile] = useState<PracticeProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [localFUA, setLocalFUA] = useState(propFUA > 0 ? propFUA : 0);
  const [localHours, setLocalHours] = useState(hoursPerYear);

  // Load practice profile from localStorage on mount
  useEffect(() => { setProfile(loadPracticeProfile()); }, []);

  // Sync propFUA into localFUA if parent provides it
  useEffect(() => { if (propFUA > 0) setLocalFUA(propFUA); }, [propFUA]);

  const effectiveFUA = localFUA;

  const anchors = deriveAnchors({ fee, feeStructure, feePercent, clientFUA: effectiveFUA, adviceComplexity });

  const costJustifiedFee = profile
    ? deriveCostJustifiedFee(profile, { hoursPerYear: localHours })
    : null;

  function handleSave(p: PracticeProfile) {
    setProfile(p);
    setShowForm(false);
  }

  function handleClear() {
    clearPracticeProfile();
    setProfile(null);
  }

  const needsFUA = feeStructure === 'percentage' && effectiveFUA <= 0;
  const needsSubscriptionNote = feeStructure === 'subscription' && fee < 1_500;

  return (
    <>
      <div className="bg-white rounded-card border border-light-border" id="section-benchmark">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <div>
            <h3 className="text-base font-bold font-heading text-dark">
              [ Benchmark this fee ]
            </h3>
            <p className="text-xs text-mid mt-0.5">
              {open
                ? 'Compare this fee to market data and your practice cost.'
                : anchors.dataAvailable
                  ? `See how this fee compares to market benchmarks.`
                  : 'Compare to market benchmarks — expand to set context.'}
            </p>
          </div>
          <svg className={`w-5 h-5 text-mid transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        {open && (
          <div className="px-5 pb-5 border-t border-light-border pt-4 space-y-4">
            {/* Practice profile pill */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <PracticeProfilePill profile={profile} onEdit={() => setShowForm(true)} onClear={handleClear}/>
            </div>

            {/* FUA input when not supplied by parent */}
            {propFUA <= 0 && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-mid whitespace-nowrap">Client FUA (optional)</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-mid">$</span>
                  <input
                    type="number"
                    min="0"
                    value={localFUA > 0 ? localFUA : ''}
                    onChange={e => setLocalFUA(Number(e.target.value) || 0)}
                    placeholder="e.g. 500000"
                    className="w-36 rounded-input border border-light-border px-2 py-1 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
                <span className="text-xs text-mid">Scales the benchmark to this FUA band.</span>
              </div>
            )}

            {/* Hours per year (when no parent-supplied value or profile needs it) */}
            {profile && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-mid whitespace-nowrap">Adviser hours / year on this client</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={localHours}
                  onChange={e => setLocalHours(Number(e.target.value) || 0)}
                  className="w-20 rounded-input border border-light-border px-2 py-1 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-teal"
                />
                <span className="text-xs text-mid">4 hrs = review only · 10 hrs = standard · 25+ hrs = complex</span>
              </div>
            )}

            {needsFUA && (
              <div className="bg-amber-50 border border-amber-200 rounded-input px-3 py-2 text-xs text-amber-800">
                Enter the client FUA above to benchmark a percentage-based fee in dollar terms.
              </div>
            )}

            {needsSubscriptionNote ? (
              <NoDataPanel gapReason="subscription pricing models" costJustifiedFee={costJustifiedFee}/>
            ) : anchors.dataAvailable ? (
              <>
                <SpectrumChart anchors={anchors} userFee={fee} costJustifiedFee={costJustifiedFee}/>
                <BenchmarkNarrative anchors={anchors} userFee={fee} costJustifiedFee={costJustifiedFee}/>
              </>
            ) : anchors.gapReason === 'enter client FUA to see a dollar-equivalent comparison' ? null : (
              <NoDataPanel gapReason={anchors.gapReason ?? 'this segment'} costJustifiedFee={costJustifiedFee}/>
            )}

            {/* Source attribution */}
            <p className="text-xs text-mid border-t border-light-border pt-3">
              Based on Adviser Ratings 2025 Landscape Report · Investment Trends 2025 ABM Report
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <PracticeProfileForm
          initial={profile}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}
