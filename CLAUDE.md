# FeeFrame — Claude Code Instructions

## What this project is
A web-based fee calculator for Australian financial advisers and paraplanners.
Two modules: **FeeQuote** (scope a client engagement, generate a justified fee) and **FeeAnalysis** (check profitability on a client).
No signup. Runs in the browser. Free to use.

## Tech stack
- React + TypeScript
- Tailwind CSS (see `tailwind.config.js` for brand tokens)
- Vite

## Brand rules — always follow these

### Colours
Use only the colours defined in `tailwind.config.js` and `src/brand.ts`.
- Primary: `teal` (`#0d9488`)
- Dark backgrounds: `dark` (`#111827`)
- Light backgrounds: `light` (`#f8fafc`)
- Traffic light: `healthy` / `warning` / `risk` — use `getRateStatus()` from `brand.ts`
- Never use: purple gradients, bright blue (`#0066ff`), orange

### Typography
- Headings: `font-heading` (DM Sans, weight 600–700)
- Body: `font-body` (Plus Jakarta Sans, weight 400–500)
- Labels / tags: `font-heading` + `text-label` + uppercase + tracked
- Never use: Inter, Roboto, Arial, system-ui as primary fonts

### Logo & icons
- SVG logo files live in `src/assets/logos/`
- Always use the correct variant: `-light` on white, `-dark` on dark bg, `-monochrome` for print
- Favicon: `feeframe-favicon-teal.svg` (teal bg) or `feeframe-favicon-dark.svg`
- Sub-module logos: `feequote-light.svg`, `feeanalysis-light.svg`

### Component style rules
- Cards: `rounded-card shadow-card bg-light` (light mode) or `bg-dark-surface` (dark)
- Inputs: `rounded-input border border-light-border focus:shadow-input`
- Sidebar: dark bg (`bg-dark`), teal accents for active state
- No gradients on primary UI elements
- No drop shadows heavier than `shadow-card-hover`
- Border radius: `rounded-card` (10px) for cards, `rounded-input` (6px) for inputs/buttons

### Tone
The product is for conservative finance professionals. UI copy should be:
- Direct and precise — no fluff
- No exclamation marks
- No "AI-powered" language
- Error states: plain language, no blame
- Empty states: helpful, not cute

## Module structure
```
src/
  assets/
    logos/           ← SVG logo files go here
  brand.ts           ← colour + font tokens, getRateStatus()
  modules/
    feequote/        ← FeeQuote module
    feeanalysis/     ← FeeAnalysis module
  components/        ← shared components
  App.tsx
tailwind.config.js   ← Tailwind brand tokens
CLAUDE.md            ← this file
```

## Key domain concepts
- **Implied hourly rate** = total fee ÷ estimated hours. The core health metric.
- **Traffic light**: green ≥ $300/hr, amber $200–299/hr, red < $200/hr (configurable in `brand.ts`)
- **Scope** = services included in a client engagement (FeeQuote)
- **Profitability** = whether a client generates an acceptable implied hourly rate (FeeAnalysis)
- **AFS licence** context — this is a regulated industry, language must be precise

## What to avoid building
- No authentication / login flows (it's intentionally no-signup)
- No database calls (browser-only, no backend)
- No dark patterns or upsell UI
- No generic SaaS dashboard chrome (avoid the "admin panel" look)
