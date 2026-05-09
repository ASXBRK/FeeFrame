import { useState } from 'react';
import type { PracticeProfile } from '../../lib/practiceProfile/types';
import { savePracticeProfile } from '../../lib/practiceProfile/storage';

interface Props {
  initial?: PracticeProfile | null;
  onSave: (profile: PracticeProfile) => void;
  onCancel: () => void;
}

interface FormValues {
  practiceName: string;
  adviserSalary: string;
  adviserOnCostsPct: string;
  billableHoursPerYear: string;
  targetMargin: string;
  totalOverheads: string;
}

function toValues(p?: PracticeProfile | null): FormValues {
  if (!p) {
    return { practiceName: '', adviserSalary: '', adviserOnCostsPct: '25', billableHoursPerYear: '1600', targetMargin: '30', totalOverheads: '' };
  }
  return {
    practiceName: p.practiceName ?? '',
    adviserSalary: p.adviserSalary > 0 ? String(p.adviserSalary) : '',
    adviserOnCostsPct: String(Math.round(p.adviserOnCostsPct * 100)),
    billableHoursPerYear: String(p.billableHoursPerYear),
    targetMargin: String(Math.round(p.targetMargin * 100)),
    totalOverheads: p.totalOverheads > 0 ? String(p.totalOverheads) : '',
  };
}

const inputClass = 'w-full rounded-input border border-light-border bg-white px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent';
const labelClass = 'block text-xs font-semibold font-heading text-mid uppercase tracking-wide mb-1';
const errorClass = 'text-xs text-risk mt-1';

export default function PracticeProfileForm({ initial, onSave, onCancel }: Props) {
  const [vals, setVals] = useState<FormValues>(() => toValues(initial));
  const [touched, setTouched] = useState(false);

  function v(field: keyof FormValues, value: string) {
    setVals(prev => ({ ...prev, [field]: value }));
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    const salary = Number(vals.adviserSalary);
    if (!salary || salary <= 0) errs.adviserSalary = 'Enter annual adviser salary';
    const onCosts = Number(vals.adviserOnCostsPct);
    if (isNaN(onCosts) || onCosts < 0 || onCosts > 100) errs.adviserOnCostsPct = 'Enter on-costs between 0 and 100%';
    const hours = Number(vals.billableHoursPerYear);
    if (!hours || hours < 500 || hours > 3000) errs.billableHoursPerYear = 'Enter billable hours between 500 and 3,000';
    const margin = Number(vals.targetMargin);
    if (isNaN(margin) || margin < 0 || margin > 99) errs.targetMargin = 'Enter target margin between 0 and 99%';
    const overheads = Number(vals.totalOverheads);
    if (isNaN(overheads) || overheads < 0) errs.totalOverheads = 'Enter practice overheads (enter 0 if none)';
    return errs;
  }

  const errs = validate();
  const hasErrors = Object.keys(errs).length > 0;

  function handleSave() {
    setTouched(true);
    if (hasErrors) return;
    const profile: PracticeProfile = {
      version: 1,
      practiceName: vals.practiceName.trim() || undefined,
      adviserSalary: Number(vals.adviserSalary),
      adviserOnCostsPct: Number(vals.adviserOnCostsPct) / 100,
      billableHoursPerYear: Number(vals.billableHoursPerYear),
      targetMargin: Number(vals.targetMargin) / 100,
      totalOverheads: Number(vals.totalOverheads) || 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    savePracticeProfile(profile);
    onSave(profile);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-card border border-light-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-card-hover">
        <div className="px-5 py-4 border-b border-light-border">
          <h2 className="text-base font-bold font-heading text-dark">Practice profile</h2>
          <p className="text-xs text-mid mt-0.5">Used to calculate your cost-justified fee and profitability check.</p>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className={labelClass}>Practice name <span className="font-normal normal-case">(optional)</span></label>
            <input type="text" value={vals.practiceName} onChange={e => v('practiceName', e.target.value)} placeholder="e.g. Smith Financial Planning" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Annual adviser salary ($)</label>
              <input type="number" min="0" value={vals.adviserSalary} onChange={e => v('adviserSalary', e.target.value)} placeholder="e.g. 180000" className={inputClass} />
              {touched && errs.adviserSalary && <p className={errorClass}>{errs.adviserSalary}</p>}
            </div>
            <div>
              <label className={labelClass}>On-costs (%)</label>
              <input type="number" min="0" max="100" value={vals.adviserOnCostsPct} onChange={e => v('adviserOnCostsPct', e.target.value)} placeholder="25" className={inputClass} />
              <p className="text-xs text-mid mt-1">Super, leave, workers comp. Typically 22–28%.</p>
              {touched && errs.adviserOnCostsPct && <p className={errorClass}>{errs.adviserOnCostsPct}</p>}
            </div>
            <div>
              <label className={labelClass}>Billable hours per year</label>
              <input type="number" min="500" max="3000" value={vals.billableHoursPerYear} onChange={e => v('billableHoursPerYear', e.target.value)} placeholder="1600" className={inputClass} />
              <p className="text-xs text-mid mt-1">Typically 1,400–1,800 hrs.</p>
              {touched && errs.billableHoursPerYear && <p className={errorClass}>{errs.billableHoursPerYear}</p>}
            </div>
            <div>
              <label className={labelClass}>Target margin (%)</label>
              <input type="number" min="0" max="99" value={vals.targetMargin} onChange={e => v('targetMargin', e.target.value)} placeholder="30" className={inputClass} />
              <p className="text-xs text-mid mt-1">Top 20% practices run 40%+.</p>
              {touched && errs.targetMargin && <p className={errorClass}>{errs.targetMargin}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Annual practice overheads ($)</label>
              <input type="number" min="0" value={vals.totalOverheads} onChange={e => v('totalOverheads', e.target.value)} placeholder="e.g. 120000" className={inputClass} />
              <p className="text-xs text-mid mt-1">Rent, software, insurance, licencing, marketing — exclude adviser salary.</p>
              {touched && errs.totalOverheads && <p className={errorClass}>{errs.totalOverheads}</p>}
            </div>
          </div>

          <div className="bg-light-surface border border-light-border rounded-input px-3 py-2 text-xs text-mid">
            Practice profile is saved only in this browser. We don't transmit, store, or share this data.
          </div>
        </div>

        <div className="px-5 py-4 border-t border-light-border flex justify-end gap-3">
          <button onClick={onCancel} className="text-sm text-mid hover:text-dark transition-colors px-4 py-2">Cancel</button>
          <button
            onClick={handleSave}
            className="text-sm font-semibold bg-teal hover:opacity-90 text-white rounded-input px-5 py-2 transition-opacity"
          >
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}
