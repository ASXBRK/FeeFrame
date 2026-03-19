/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {

      // ── Colours ──────────────────────────────────────────
      colors: {
        // Primary brand teal
        teal: {
          DEFAULT: '#0d9488',
          light:   '#5eead4',
          subtle:  '#ccfbf1',
        },
        // Dark backgrounds / structure
        dark: {
          DEFAULT: '#111827',
          surface: '#1f2937',
          border:  '#374151',
        },
        // Light backgrounds
        light: {
          DEFAULT: '#f8fafc',
          surface: '#f1f5f9',
          border:  '#e2e8f0',
        },
        // Muted text / labels
        mid: '#6b7280',
        // Traffic light — implied hourly rate health
        healthy: '#10b981',
        warning: '#f59e0b',
        risk:    '#ef4444',
        // Traffic light backgrounds (subtle fills)
        'healthy-bg': '#d1fae5',
        'warning-bg': '#fef3c7',
        'risk-bg':    '#fee2e2',
        // Traffic light text (dark variants for on-bg use)
        'healthy-text': '#065f46',
        'warning-text': '#92400e',
        'risk-text':    '#991b1b',
      },

      // ── Typography ───────────────────────────────────────
      fontFamily: {
        heading: ['"DM Sans"', 'sans-serif'],
        body:    ['"Plus Jakarta Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      fontSize: {
        // Display
        'display-lg': ['48px', { lineHeight: '1.05', letterSpacing: '-1.5px', fontWeight: '700' }],
        'display':    ['36px', { lineHeight: '1.1',  letterSpacing: '-1px',   fontWeight: '700' }],
        // Headings
        'h1': ['28px', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '600' }],
        'h2': ['22px', { lineHeight: '1.3', letterSpacing: '-0.3px', fontWeight: '600' }],
        'h3': ['17px', { lineHeight: '1.4', letterSpacing: '-0.2px', fontWeight: '600' }],
        // Body
        'body-lg': ['16px', { lineHeight: '1.65', fontWeight: '400' }],
        'body':    ['14px', { lineHeight: '1.6',  fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.55', fontWeight: '400' }],
        // UI labels
        'label':    ['11px', { lineHeight: '1.4', letterSpacing: '1.5px', fontWeight: '500' }],
        'label-sm': ['10px', { lineHeight: '1.4', letterSpacing: '1.5px', fontWeight: '500' }],
      },

      // ── Spacing ──────────────────────────────────────────
      spacing: {
        '4.5': '18px',
        '18':  '72px',
        '22':  '88px',
      },

      // ── Border radius ────────────────────────────────────
      borderRadius: {
        card:  '10px',
        input: '6px',
        badge: '4px',
      },

      // ── Box shadow ───────────────────────────────────────
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
        input:   '0 0 0 3px rgba(13,148,136,0.15)',
        sidebar: '1px 0 0 #374151',
      },

    },
  },
  plugins: [],
}
