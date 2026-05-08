/**
 * FeeFrame brand tokens
 * Single source of truth for colours, typography, and UI constants.
 * Import this wherever you need brand values in logic (charts, PDFs, etc.)
 * For component styling, prefer the Tailwind classes derived from tailwind.config.js.
 */

export const colors = {
  // Primary brand
  teal:        '#0d9488',
  tealLight:   '#5eead4',
  tealSubtle:  '#ccfbf1',

  // Structure
  dark:        '#111827',
  darkSurface: '#1f2937',
  darkBorder:  '#374151',

  // Light backgrounds
  light:        '#f8fafc',
  lightSurface: '#f1f5f9',
  lightBorder:  '#e2e8f0',

  // Text
  textPrimary:   '#111827',
  textSecondary: '#374151',
  textMuted:     '#6b7280',
  textInverse:   '#f8fafc',

  // Traffic light — implied hourly rate health check
  healthy:     '#10b981',
  healthyBg:   '#d1fae5',
  healthyText: '#065f46',

  warning:     '#f59e0b',
  warningBg:   '#fef3c7',
  warningText: '#92400e',

  risk:        '#ef4444',
  riskBg:      '#fee2e2',
  riskText:    '#991b1b',
} as const

export const fonts = {
  heading: '"DM Sans", sans-serif',
  body:    '"Plus Jakarta Sans", sans-serif',
  mono:    '"JetBrains Mono", "Fira Code", monospace',
} as const

export const fontWeights = {
  regular: 400,
  medium:  500,
  semibold: 600,
  bold:    700,
} as const

/**
 * Traffic light thresholds for implied hourly rate.
 * Adjust these to match practice benchmarks.
 */
export const rateThresholds = {
  healthyAbove: 300,  // $/hr — green above this
  warningAbove: 200,  // $/hr — amber between this and healthy
  // below warningAbove = red
} as const

/**
 * Returns the traffic light status for a given implied hourly rate.
 */
export type RateStatus = 'healthy' | 'warning' | 'risk'

export function getRateStatus(impliedHourlyRate: number): RateStatus {
  if (impliedHourlyRate >= rateThresholds.healthyAbove) return 'healthy'
  if (impliedHourlyRate >= rateThresholds.warningAbove) return 'warning'
  return 'risk'
}

/**
 * Returns the colour tokens for a given rate status.
 * Use these for charts, PDF exports, and any non-Tailwind rendering.
 */
export function getRateColors(status: RateStatus) {
  return {
    healthy: { fill: colors.healthyBg, stroke: colors.healthy, text: colors.healthyText },
    warning: { fill: colors.warningBg, stroke: colors.warning, text: colors.warningText },
    risk:    { fill: colors.riskBg,    stroke: colors.risk,    text: colors.riskText },
  }[status]
}

/**
 * Module identifiers — used for logos, favicons, and routing.
 */
export const modules = {
  feeframe: {
    name:    'FeeFrame',
    tagline: 'Fee calculator for financial advisers',
    color:   colors.teal,
  },
  feequote: {
    name:    'FeeQuote',
    tagline: 'Scope & quote',
    color:   colors.teal,
  },
  feereview: {
    name:    'FeeReview',
    tagline: 'Annual fee consent & renewal',
    color:   colors.teal,
  },
} as const
