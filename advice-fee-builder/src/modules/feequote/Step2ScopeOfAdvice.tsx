import { useState } from 'react';
import Toggle from '../../components/shared/Toggle';
import Tooltip from '../../components/shared/Tooltip';
import NumInput from '../../components/shared/NumInput';
import { STRATEGIES, ADD_ONS, CORE_TASKS } from '../../lib/serviceLines';
import { calculateQuote } from '../../lib/calculateQuote';
import { formatCurrency } from '../../lib/formatters';

const RATE_TOOLTIPS = {
  adviser: 'Based on an average adviser salary of $175k (Advisely 2025). Enter your actual employment cost per hour — not your charge-out rate.',
  paraplanner: 'Based on an average paraplanner salary of $102k (Advisely 2025). Enter your actual employment cost per hour — not your charge-out rate.',
  admin: 'Based on an average CSA salary of $67k (Advisely 2025). Enter your actual employment cost per hour — not your charge-out rate.',
};

export default function Step2ScopeOfAdvice({ quote, dispatch, onNext, onBack }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const calc = calculateQuote(quote);

  const set = (field, value) => dispatch({ type: 'SET_QUOTE_FIELD', field, value });
  const isExternal = quote.paraplanner === 'external';

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function setHourOverride(id: string, role: string, value: number) {
    dispatch({ type: 'SET_HOUR_OVERRIDE', key: `${id}.${role}`, value });
  }

  function getHour(item: any, role: string): number {
    const key = `${item.id}.${role}`;
    if (quote.hourOverrides?.[key] !== undefined) return quote.hourOverrides[key];
    if (isExternal) {
      const extKey = `external${role.charAt(0).toUpperCase() + role.slice(1)}Hours`;
      if (item[extKey] !== undefined) return item[extKey];
    }
    return item[`${role}Hours`];
  }

  return (
    <div>
      <h2 className="text-xl font-bold font-heading text-dark mb-1" style={{ letterSpacing: '-0.3px' }}>Scope of Advice</h2>
      <p className="text-sm text-mid mb-6">Select the services in scope. Fees calculate automatically from your role costs.</p>

      <div className="space-y-5">

        {/* Section A: Paraplanner model */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <label className="block text-sm font-medium text-dark mb-3">Paraplanner</label>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${!isExternal ? 'font-medium text-dark' : 'text-mid'}`}>Internal</span>
            <Toggle
              checked={isExternal}
              onChange={v => set('paraplanner', v ? 'external' : 'internal')}
              label="Paraplanner type"
            />
            <span className={`text-sm ${isExternal ? 'font-medium text-dark' : 'text-mid'}`}>External</span>
          </div>

          {isExternal && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-1">External paraplanning fee (excl GST)</label>
                <p className="text-xs text-mid mb-3">Enter the fee quoted by your external paraplanner.</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mid">$</span>
                  <NumInput
                    value={quote.paraplannerFee}
                    onChange={v => set('paraplannerFee', v)}
                    min={0}
                    max={50000}
                    className="w-36 rounded-input border border-light-border px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                  />
                  <span className="text-sm text-mid">ex GST</span>
                </div>
              </div>
              <div className="border-t border-light-border pt-4 flex items-start gap-3">
                <Toggle checked={!!quote.paraplannerBuffer} onChange={v => set('paraplannerBuffer', v)} label="Add 10% buffer" />
                <div>
                  <p className="text-sm font-medium text-dark">Add a 10% buffer</p>
                  <p className="text-xs text-mid mt-0.5">Protects your margin if the paraplanning fee increases before completion.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section B: Hourly cost rates */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-base font-bold font-heading text-dark mb-1">Hourly Cost Rates</h3>
          <p className="text-xs text-mid mb-4">Your internal employment cost per hour — not what you charge clients.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              { field: 'adviserRate', label: 'Adviser hourly cost', role: 'adviser', default: 106 },
              { field: 'paraplannerRate', label: 'Paraplanner hourly cost', role: 'paraplanner', default: 62, disabled: isExternal },
              { field: 'adminRate', label: 'Admin / CSA hourly cost', role: 'admin', default: 40 },
            ] as const).map(({ field, label, role, default: def, disabled }: any) => (
              <div key={field}>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className={`text-sm font-medium ${disabled ? 'text-mid' : 'text-dark'}`}>{label}</label>
                  <Tooltip text={RATE_TOOLTIPS[role]} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${disabled ? 'text-light-border' : 'text-mid'}`}>$</span>
                  {disabled ? (
                    <span className="w-24 rounded-input border border-light-border px-3 py-2 text-sm bg-light-surface text-mid cursor-not-allowed block text-center">—</span>
                  ) : (
                    <NumInput
                      value={quote[field] ?? def}
                      onChange={v => set(field, v)}
                      min={0}
                      max={500}
                      className="w-24 rounded-input border border-light-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0"
                    />
                  )}
                  <span className={`text-xs ${disabled ? 'text-light-border' : 'text-mid'}`}>/hr</span>
                </div>
                {disabled && <p className="text-xs text-mid mt-1">Not applicable — external paraplanner</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Section C: Strategies in Scope */}
        <ScopeSection
          heading="Strategies in Scope"
          subheading="Select the advice areas in scope for this engagement."
          tooltipText="If an advice area includes multiple distinct strategies (e.g. Superannuation may cover contributions, consolidation, and spouse splitting separately), increase the quantity to reflect the additional work."
          items={STRATEGIES}
          enabledMap={quote.strategies || {}}
          onToggle={(id, v) => dispatch({ type: 'SET_STRATEGY', id, enabled: v })}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          getHour={getHour}
          onHourOverride={setHourOverride}
          isExternal={isExternal}
          calcItems={calc.strategyItems}
          quantityMap={quote.strategyQuantities || {}}
          onQuantityChange={(id, qty) => dispatch({ type: 'SET_STRATEGY_QUANTITY', id, quantity: qty })}
        />

        {Object.values(quote.strategies || {}).filter(Boolean).length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mt-3">
            <span className="font-medium">⚠</span> No strategies selected. Select at least one advice area to generate a meaningful fee.
          </div>
        )}

        {/* Section D: Add-ons */}
        <ScopeSection
          heading="Add-ons"
          subheading="Additional items that add scope or complexity."
          items={ADD_ONS}
          enabledMap={quote.addOns || {}}
          onToggle={(id, v) => dispatch({ type: 'SET_ADDON', id, enabled: v })}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          getHour={getHour}
          onHourOverride={setHourOverride}
          isExternal={isExternal}
          calcItems={calc.addOnItems}
          quantityMap={quote.addOnQuantities || {}}
          onQuantityChange={(id, qty) => dispatch({ type: 'SET_ADDON_QUANTITY', id, quantity: qty })}
        />

        {/* Section E: Core Process Tasks */}
        <div className="bg-white rounded-card border border-light-border overflow-hidden">
          <div className="px-5 py-4 border-b border-light-border">
            <h3 className="text-base font-bold font-heading text-dark">Core Process Tasks</h3>
            <p className="text-xs text-mid mt-0.5">Standard tasks included in every engagement.</p>
          </div>
          <div className="divide-y divide-light-border">
            {CORE_TASKS.filter(task => !(isExternal && task.hideWhenExternal)).map(task => {
              const calcItem = calc.coreTaskItems.find(c => c.id === task.id);
              const fee = calcItem?.fee ?? 0;
              const enabled = task.alwaysOn ? true : (quote.coreTasks?.[task.id] ?? task.defaultOn ?? false);
              const isExpanded = expandedIds.has(task.id);

              return (
                <div key={task.id}>
                  <div className="px-5 py-3.5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-dark">{task.label}</div>
                      {task.alwaysOn && (
                        <div className="text-xs text-mid mt-0.5">Included in every engagement</div>
                      )}
                      {task.perEntity && (
                        <div className="text-xs text-mid mt-0.5">× {calc.totalEntities} entities</div>
                      )}
                      {task.perAdditionalScenario && (
                        <div className="text-xs text-mid mt-0.5 flex items-center gap-1.5">
                          <span>Scenarios</span>
                          <Tooltip text="First scenario is included at no extra charge. Fee applies per additional scenario beyond the first." />
                          <NumInput
                            value={quote.scenarios ?? 0}
                            onChange={v => dispatch({ type: 'SET_QUOTE_FIELD', field: 'scenarios', value: Math.max(0, Math.min(10, Math.round(v))) })}
                            min={0}
                            max={10}
                            integer
                            emptyDefault={0}
                            className="w-10 rounded-input border border-light-border px-1.5 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-teal focus:ring-offset-0 inline-block"
                          />
                          <span className="text-xs text-mid">(max 10)</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {!task.alwaysOn && (
                        <Toggle
                          checked={enabled}
                          onChange={v => dispatch({ type: 'SET_CORE_TASK', id: task.id, enabled: v })}
                          label={task.label}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => toggleExpand(task.id)}
                        className={`text-sm transition-colors ${isExpanded ? 'text-teal' : 'text-mid hover:text-dark'}`}
                        title="Edit hours"
                      >
                        ✏️
                      </button>
                      <div className="w-20 text-right">
                        <span className={`text-sm font-medium ${fee > 0 ? 'text-dark' : 'text-light-border'}`}>
                          {formatCurrency(fee)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <HourEditor
                      item={task}
                      getHour={getHour}
                      onHourOverride={setHourOverride}
                      isExternal={isExternal}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="px-5 py-4 bg-light-surface border-t border-light-border flex items-center justify-between">
            <span className="text-sm font-semibold text-dark">Core Tasks Subtotal</span>
            <span className="text-sm font-bold text-dark">
              {formatCurrency(calc.coreTaskItems.reduce((s, i) => s + i.fee, 0))}
            </span>
          </div>
        </div>

        {/* Section F: Implementation Fees */}
        <div className="bg-white rounded-card border border-light-border p-5">
          <h3 className="text-base font-bold font-heading text-dark mb-4">Implementation Fees</h3>
          <div className="space-y-4">
            <ImplRow
              label="Investment & super implementation"
              tooltip="$550 incl GST per account — covers platform setup, product applications, and account establishment."
              value={quote.investmentAccounts}
              inputLabel="accounts"
              onChange={v => set('investmentAccounts', v)}
              fee={calc.implInvestmentFee}
              feeOverride={quote.implInvestmentOverride}
              onFeeOverride={v => set('implInvestmentOverride', v)}
              allowOverride
              inputMax={20}
            />
            <ImplRow
              label="In-specie transfers of existing assets"
              tooltip="Admin time to coordinate in-specie asset transfers. Billed at admin hourly cost."
              value={quote.inSpecieHours}
              inputLabel="hours"
              onChange={v => set('inSpecieHours', v)}
              fee={calc.implInSpecieFee}
              inputMax={50}
            />
            <ImplRow
              label="Insurance implementation"
              tooltip="Admin time to process insurance applications and policy documentation. Billed at admin hourly cost."
              value={quote.insuranceImplHours}
              inputLabel="hours"
              onChange={v => set('insuranceImplHours', v)}
              fee={calc.implInsuranceFee}
              inputMax={50}
            />
            <div className="flex items-center gap-4 pt-2 border-t border-light-border">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-sm font-medium text-dark">Less: Insurance commission offset</span>
                <Tooltip text="Enter any upfront insurance commission you expect to receive. This offsets the client's initial fees — first against implementation, then against the SOA fee if commission exceeds implementation. Ongoing commissions are handled separately in the next step." />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-mid">-$</span>
                <NumInput
                  value={quote.insuranceCommissionOffset}
                  onChange={v => set('insuranceCommissionOffset', v)}
                  min={0}
                  max={50000}
                  className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 text-center"
                />
                <span className="text-xs text-mid w-14" />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-sm font-medium w-20 text-right ${(quote.insuranceCommissionOffset || 0) > 0 ? 'text-risk-text' : 'text-light-border'}`}>
                  {(quote.insuranceCommissionOffset || 0) > 0 ? `-${formatCurrency(calc.commissionOffset)}` : '—'}
                </span>
                <div className="w-6" />
              </div>
            </div>
            <div className="bg-light-surface rounded-card px-4 py-3 flex items-center justify-between border border-light-border">
              <span className="text-sm font-semibold text-dark">Total Implementation Fees (Incl GST)</span>
              <span className="text-base font-bold text-dark">{formatCurrency(calc.implTotal)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Running total bar */}
      <div className="mt-5 bg-white rounded-card border border-light-border px-5 py-3.5 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-mid">SOA Prep Fee</span>
          <span className="text-sm font-bold text-dark">{formatCurrency(calc.soaTotalInclGst)}</span>
          <span className="text-xs text-mid">incl GST</span>
        </div>
        <div className="text-light-border text-xs">|</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-mid">Implementation</span>
          <span className="text-sm font-bold text-dark">{formatCurrency(calc.implTotal)}</span>
          <span className="text-xs text-mid">incl GST</span>
        </div>
        <div className="ml-auto text-xs text-mid">Premiums, discounts, and profit margin are applied in later steps.</div>
      </div>

    </div>
  );
}

// ── ScopeSection (strategies + add-ons share same UX) ─────────────────────────
function ScopeSection({ heading, subheading, tooltipText = null, items, enabledMap, onToggle, expandedIds, onToggleExpand, getHour, onHourOverride, isExternal, calcItems, quantityMap = {}, onQuantityChange = null }) {
  return (
    <div className="bg-white rounded-card border border-light-border overflow-hidden">
      <div className="px-5 py-4 border-b border-light-border">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-bold font-heading text-dark">{heading}</h3>
          {tooltipText && <Tooltip text={tooltipText} />}
        </div>
        <p className="text-xs text-mid mt-0.5">{subheading}</p>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(item => {
            const enabled = !!enabledMap[item.id];
            const isExpanded = expandedIds.has(item.id);
            const calcItem = calcItems?.find(c => c.id === item.id);
            const fee = enabled ? (calcItem?.fee ?? 0) : 0;
            const quantity = enabled ? (quantityMap[item.id] ?? 1) : 1;

            return (
              <div key={item.id} className={`rounded-input border transition-colors ${enabled ? 'border-teal bg-teal-subtle' : 'border-light-border bg-white'}`}>
                <div className="px-4 py-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={e => onToggle(item.id, e.target.checked)}
                    className="w-4 h-4 rounded border-light-border text-teal focus:ring-teal flex-shrink-0"
                  />
                  <span className={`text-sm flex-1 min-w-0 ${enabled ? 'font-medium text-dark' : 'text-dark'}`}>{item.label}</span>
                  {enabled && onQuantityChange && (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <span className="text-xs text-gray-400 mr-0.5">×</span>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.id, quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-5 h-5 rounded border border-light-border bg-white text-mid hover:bg-light-surface disabled:opacity-30 flex items-center justify-center text-xs leading-none"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-5 text-center text-dark">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.id, quantity + 1)}
                        disabled={quantity >= 5}
                        className="w-5 h-5 rounded border border-light-border bg-white text-mid hover:bg-light-surface disabled:opacity-30 flex items-center justify-center text-xs leading-none"
                      >
                        +
                      </button>
                    </div>
                  )}
                  <span className={`text-sm font-medium flex-shrink-0 ${enabled ? 'text-teal' : 'text-light-border'}`}>
                    {enabled ? formatCurrency(fee) : '—'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleExpand(item.id)}
                    className={`text-sm flex-shrink-0 transition-colors ${isExpanded ? 'text-teal' : 'text-mid hover:text-dark'}`}
                    title="Edit hours"
                  >
                    ✏️
                  </button>
                </div>
                {isExpanded && (
                  <div className="border-t border-light-border mx-3 mb-3">
                    <HourEditor
                      item={item}
                      getHour={getHour}
                      onHourOverride={onHourOverride}
                      isExternal={isExternal}
                      quantity={quantity}
                      feePerUnit={calcItem?.feePerUnit ?? 0}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {calcItems && (
        <div className="px-5 py-3.5 bg-light-surface border-t border-light-border flex items-center justify-between">
          <span className="text-sm font-semibold text-dark">{heading} Subtotal</span>
          <span className="text-sm font-bold text-dark">
            {formatCurrency(calcItems.reduce((s, i) => s + i.fee, 0))}
          </span>
        </div>
      )}
    </div>
  );
}

// ── HourEditor — inline hour inputs (pencil expand) ───────────────────────────
function HourEditor({ item, getHour, onHourOverride, isExternal, quantity = 1, feePerUnit = 0 }) {
  return (
    <div className="pt-3 px-1 pb-1">
      <div className="flex gap-4 text-xs text-mid mb-2 font-medium">
        <span className="w-24">Role</span>
        <span>{quantity > 1 ? 'Hours per instance' : 'Hours'}</span>
      </div>
      {(['adviser', 'paraplanner', 'admin'] as const).map(role => {
        const disabled = isExternal && role === 'paraplanner';
        return (
          <div key={role} className="flex items-center gap-3 mb-2">
            <span className={`text-xs w-24 ${disabled ? 'text-light-border' : 'text-dark'}`}>
              {role === 'admin' ? 'Admin / CSA' : role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
            {disabled ? (
              <span className="w-16 text-sm text-mid text-right">—</span>
            ) : (
              <NumInput
                value={getHour(item, role)}
                onChange={v => onHourOverride(item.id, role, v)}
                min={0}
                max={50}
                className="w-16 rounded-input border border-light-border px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal focus:ring-offset-0"
              />
            )}
            <span className="text-xs text-mid">hrs</span>
          </div>
        );
      })}
      {quantity > 1 && (
        <div className="mt-1 pt-2 border-t border-light-border text-xs text-mid">
          × {quantity} instances = {formatCurrency(feePerUnit * quantity)}
        </div>
      )}
    </div>
  );
}

// ── ImplRow ───────────────────────────────────────────────────────────────────
function ImplRow({ label, tooltip, value, inputLabel, onChange, fee, feeOverride = null, onFeeOverride = null, allowOverride = false, inputMax = undefined }) {
  const [expanded, setExpanded] = useState(false);
  const isOverridden = feeOverride !== null && feeOverride !== undefined;
  const displayFee = isOverridden ? feeOverride : fee;

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-sm font-medium text-dark">{label}</span>
          <Tooltip text={tooltip} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <NumInput
            value={value}
            onChange={onChange}
            min={0}
            max={inputMax}
            className="w-16 rounded-input border border-light-border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-0 text-center"
          />
          <span className="text-xs text-mid w-14">{inputLabel}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOverridden && (
            <span className="text-xs text-mid bg-light-surface px-1.5 py-0.5 rounded border border-light-border">override</span>
          )}
          <span className={`text-sm font-medium w-20 text-right ${displayFee > 0 ? 'text-dark' : 'text-light-border'}`}>
            {formatCurrency(displayFee)}
          </span>
          {allowOverride ? (
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              className={`w-6 text-sm text-center transition-colors ${expanded ? 'text-teal' : 'text-mid hover:text-dark'}`}
              title="Override fee"
            >
              ✏️
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>
      </div>
      {allowOverride && expanded && (
        <div className="mt-1.5 flex items-center gap-3 px-4 py-3 bg-light-surface rounded-input border border-light-border">
          <span className="text-xs text-mid flex-1">Override fee</span>
          <span className="text-sm text-mid">$</span>
          <NumInput
            value={isOverridden ? feeOverride : fee}
            onChange={v => onFeeOverride(v)}
            autoFocus
            className="w-24 rounded-input border border-teal px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal"
          />
          <button type="button" onClick={() => setExpanded(false)} className="text-xs font-medium text-teal hover:opacity-80">Done</button>
          {isOverridden && (
            <button type="button" onClick={() => { onFeeOverride(null); setExpanded(false); }} className="text-xs text-mid hover:text-dark">Reset</button>
          )}
        </div>
      )}
    </div>
  );
}
