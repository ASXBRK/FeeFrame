/**
 * Format a number as Australian currency
 * $X,XXX or $X,XXX.XX
 */
export function formatCurrency(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  const rounded = decimals === 0 ? Math.round(value) : Number(value.toFixed(decimals));
  return '$' + rounded.toLocaleString('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format hours with suffix
 */
export function formatHours(value) {
  if (value === null || value === undefined || isNaN(value)) return '0 hrs';
  const n = Number(value);
  return n === 1 ? '1 hr' : `${n % 1 === 0 ? n : n.toFixed(1)} hrs`;
}

/**
 * Format a percentage with suffix
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Parse a raw input to a safe number
 */
export function parseNumber(value, fallback = 0) {
  const n = parseFloat(value);
  return isNaN(n) ? fallback : n;
}
