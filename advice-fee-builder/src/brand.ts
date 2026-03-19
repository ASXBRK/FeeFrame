/**
 * FeeFrame brand tokens — v3
 * Simplified colour system. Single source of truth.
 */

export const colors = {
  // ── Primary brand ──────────────────────────────────
  teal:        '#0d9488',   // Primary brand colour — buttons, logos, accents

  // ── Structure ──────────────────────────────────────
  dark:        '#111827',   // Primary dark — sidebar, dark backgrounds
  white:       '#ffffff',   // Cards, nav background
  offWhite:    '#f8fafc',   // Primary light — page background

  // ── Text ───────────────────────────────────────────
  textPrimary:   '#111827', // Headings, strong text
  textSecondary: '#374151', // Body text
  textMuted:     '#6b7280', // Descriptions, secondary labels
  textSubtle:    '#9ca3af', // Tags, badge text, logo subtags

  // ── Borders ────────────────────────────────────────
  border:      '#e2e8f0',   // Card and input borders

  // ── Traffic light ──────────────────────────────────
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

/**
 * Logo colour rule:
 * - Background is light (white / off-white) → logo is teal #0d9488
 * - Background is dark (#111827)            → logo is white #ffffff
 * - Background is teal (#0d9488)            → logo is white #ffffff
 * Never use any other colour for logos.
 */
export const logoColors = {
  onLight: colors.teal,
  onDark:  colors.white,
  onTeal:  colors.white,
} as const

export const fonts = {
  heading: '"DM Sans", sans-serif',
  body:    '"Plus Jakarta Sans", sans-serif',
  mono:    '"JetBrains Mono", "Fira Code", monospace',
} as const

export const fontWeights = {
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
} as const

/**
 * Traffic light thresholds for implied hourly rate.
 */
export const rateThresholds = {
  healthyAbove: 300,
  warningAbove: 200,
} as const

export type RateStatus = 'healthy' | 'warning' | 'risk'

export function getRateStatus(impliedHourlyRate: number): RateStatus {
  if (impliedHourlyRate >= rateThresholds.healthyAbove) return 'healthy'
  if (impliedHourlyRate >= rateThresholds.warningAbove) return 'warning'
  return 'risk'
}

export function getRateColors(status: RateStatus) {
  return {
    healthy: { fill: colors.healthyBg, stroke: colors.healthy, text: colors.healthyText },
    warning: { fill: colors.warningBg, stroke: colors.warning, text: colors.warningText },
    risk:    { fill: colors.riskBg,    stroke: colors.risk,    text: colors.riskText },
  }[status]
}

export const modules = {
  feeframe: {
    name:    'FeeFrame',
    tagline: 'Fee clarity for Australian advisers',
    color:   colors.teal,
  },
  feequote: {
    name:    'FeeQuote',
    tagline: 'Scope & Quote',
    color:   colors.teal,
  },
  feeanalysis: {
    name:    'FeeAnalysis',
    tagline: 'Profitability Check',
    color:   colors.teal,
  },
} as const
