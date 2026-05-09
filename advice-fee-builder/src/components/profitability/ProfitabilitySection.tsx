import { useState, useEffect } from 'react';
import type { PracticeProfile } from '../../lib/practiceProfile/types';
import { loadPracticeProfile, clearPracticeProfile } from '../../lib/practiceProfile/storage';
import { computeProfitability } from '../../lib/benchmarks/costJustifiedEngine';
import PracticeProfileForm from '../shared/PracticeProfileForm';
import PracticeProfilePill from '../shared/PracticeProfilePill';
import ProfitabilityBreakdown from './ProfitabilityBreakdown';
import NumInput from '../shared/NumInput';

interface Props {
  fee: number;           // annual fee in $
  commission: number;    // annual insurance commission in $
  hoursPerYear: number;
  onChangeHours: (v: number) => void;
}

export default function ProfitabilitySection({ fee, commission, hoursPerYear, onChangeHours }: Props) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<PracticeProfile | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setProfile(loadPracticeProfile()); }, []);

  function handleSave(p: PracticeProfile) {
    setProfile(p);
    setShowForm(false);
  }

  function handleClear() {
    clearPracticeProfile();
    setProfile(null);
  }

  const result = profile ? computeProfitability(profile, fee, commission, hoursPerYear) : null;

  return (
    <>
      <div className="bg-white rounded-card border border-light-border" id="section-profitability">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <div>
            <h3 className="text-base font-bold font-heading text-dark">
              [ Profitability check ] <span className="text-mid font-normal text-sm">(optional)</span>
            </h3>
            <p className="text-xs text-mid mt-0.5">
              {open
                ? 'Compare the client\'s fee to your cost to serve.'
                : result
                  ? `Margin: ${result.margin >= 0 ? '+' : ''}$${Math.abs(Math.round(result.margin)).toLocaleString('en-AU')} (${result.marginPct.toFixed(1)}%)`
                  : 'Load a practice profile to see profitability.'}
            </p>
          </div>
          <svg className={`w-5 h-5 text-mid transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        {open && (
          <div className="px-5 pb-5 border-t border-light-border pt-4 space-y-4">
            <PracticeProfilePill profile={profile} onEdit={() => setShowForm(true)} onClear={handleClear}/>

            {!profile ? (
              <div className="bg-light-surface border border-light-border rounded-input px-4 py-3 text-sm text-mid">
                Add a practice profile above to see whether this client's fee covers the cost to serve them.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-mid whitespace-nowrap">Adviser hours / year on this client</label>
                  <NumInput
                    value={hoursPerYear}
                    onChange={onChangeHours}
                    min={0}
                    max={200}
                    className="w-20 rounded-input border border-light-border px-2 py-1 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                  <span className="text-xs text-mid">4 hrs = review only · 10 hrs = standard · 25+ hrs = complex</span>
                </div>

                {result && (
                  <ProfitabilityBreakdown
                    revenue={result.revenue}
                    cost={result.cost}
                    margin={result.margin}
                    marginPct={result.marginPct}
                    fee={fee}
                    commission={commission}
                  />
                )}
              </>
            )}
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
