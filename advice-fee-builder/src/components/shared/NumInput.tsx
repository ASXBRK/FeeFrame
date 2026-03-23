import { useState, useEffect } from 'react';

/**
 * Number input that allows the field to be blank while typing.
 * Commits the parsed value to onChange on every valid keystroke (live calc updates).
 * If the field is left blank on blur, reverts to emptyDefault (0).
 * If min/max are provided, the value is clamped to that range on blur.
 */
type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> & {
  value: number;
  onChange: (value: number) => void;
  emptyDefault?: number;
  integer?: boolean;
  min?: number;
  max?: number;
};

export default function NumInput({ value, onChange, emptyDefault = 0, integer = false, min, max, className = '', ...rest }: Props) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // Sync display when value changes externally (e.g. reset)
  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  return (
    <input
      {...rest}
      min={min}
      max={max}
      type="text"
      inputMode={integer ? 'numeric' : 'decimal'}
      className={className}
      value={draft}
      onFocus={e => {
        setFocused(true);
        // Select all so first keystroke replaces the value
        setTimeout(() => e.target.select(), 0);
      }}
      onChange={e => {
        const raw = e.target.value;
        // Allow empty, minus, and partial decimals while typing
        if (raw === '' || raw === '-' || /^-?\d*\.?\d*$/.test(raw)) {
          setDraft(raw);
          const n = parseFloat(raw);
          if (!isNaN(n)) onChange(integer ? Math.round(n) : n);
        }
      }}
      onBlur={() => {
        setFocused(false);
        const n = parseFloat(draft);
        let final = isNaN(n) ? (min ?? emptyDefault) : (integer ? Math.round(n) : n);
        if (min !== undefined) final = Math.max(min, final);
        if (max !== undefined) final = Math.min(max, final);
        setDraft(String(final));
        onChange(final);
      }}
    />
  );
}
