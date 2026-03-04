

# Finance Advisor Module — Build Plan

## Overview
Build a full Finance Advisor module following the same architectural patterns as Med AI: a **Welcome page**, a **multi-step question wizard**, and a **rich Summary/Report page** with charts, scores, and AI-powered insights.

## New Files to Create

### 1. `src/types/finance.ts`
- Define types for all intake data: `FinanceIntake` (identity, income, expenses, assets, liabilities, goals, behaviour)
- Define wizard step type union
- Define score/insight types for summary page
- Export constants for dropdown options (employment statuses, goal categories, etc.)

### 2. `src/services/financeApi.ts`
- `startSession(intake)` → POST to `/finance/start/` → returns `{ session_id, summary }`
- Uses `VITE_API_BASE_URL` like medaiApi

### 3. `src/pages/finance/Welcome.tsx`
- Landing page at `/finance-advisor` mirroring Med AI Welcome pattern
- Animated floating icons (wallet, chart, piggy bank, etc.)
- "How it works" steps: Profile → Income → Expenses → Assets → Goals → Report
- CTA button → navigates to `/finance-advisor/questions/<generated-id>`
- Disclaimer about not being regulated financial advice

### 4. `src/pages/finance/Questions.tsx`
- Route: `/finance-advisor/questions/:sessionId`
- Multi-step wizard with **8 steps**, each animated with `AnimatePresence`:
  1. **Identity** — name, age, gender (radio buttons), location, employment status (select), dependants
  2. **Income** — primary monthly income, secondary income, income stability (fixed/variable radio)
  3. **Fixed Expenses** — rent/mortgage, loan EMIs, insurance, subscriptions
  4. **Variable & Irregular Expenses** — groceries, transport, dining, entertainment, annual bills, school fees, medical
  5. **Assets** — savings balance, investments, property value, emergency fund
  6. **Liabilities** — credit card balances + rates, personal/car/student loans, mortgage outstanding, BNPL
  7. **Goals** — short/medium/long term goals with target amounts and timeframes
  8. **Behaviour** (optional) — spending patterns, savings dipping frequency, missed payments
- Progress bar (step X of 8)
- Back/Next navigation, final "Generate Report" button
- On submit: calls `financeApi.startSession()`, stores data in sessionStorage, navigates to `/finance-advisor/summary/:sessionId`

### 5. `src/pages/finance/Summary.tsx`
- Route: `/finance-advisor/summary/:sessionId`
- Reads session data from sessionStorage
- Rich dashboard layout with sections:
  - **Overview Card** — name, age, location, employment
  - **Financial Health Score** — circular score ring (reuse `ScoreRing` component pattern) with overall 0-100 score
  - **Score Breakdown** — 4 mini score rings: Debt, Savings, Spending, Goal Progress
  - **Insights & Warnings** — alert cards with contextual messages (calculated from user data)
  - **Budget Plan** — 50/30/20 rule visualization using recharts (PieChart or BarChart)
  - **Debt Prioritisation** — table showing debts ranked by interest rate, with projected payoff
  - **Goal Planning** — cards per goal with monthly savings needed and progress bars
  - **Investment Nudges** — card showing idle money and growth projections
  - **Behavioural Coaching** — tips based on optional behaviour inputs
- All sections use recharts for charts (already installed), framer-motion for animations
- Print/share button option
- Disclaimer footer

## Files to Modify

### 6. `src/App.tsx`
- Add 3 new routes:
  - `/finance-advisor` → `Welcome`
  - `/finance-advisor/questions/:sessionId` → `Questions`
  - `/finance-advisor/summary/:sessionId` → `Summary`

### 7. `src/pages/Home.tsx`
- Add a 4th card in the grid for "Finance Advisor" with a wallet/chart icon
- Update grid from `sm:grid-cols-3` to `sm:grid-cols-4` (or keep 3 and wrap to 2 rows)

## CSS Additions
- Add a `--finance` color token (green-ish, e.g. `152 60% 42%`) to `src/index.css` for the finance theme accent, or reuse `--success`

## Architecture Notes
- All calculations (scores, budgets, insights) done client-side from user input — no real backend needed for MVP
- Score formulas: debt-to-income ratio, savings rate, emergency fund coverage, goal progress
- Budget: 50% needs / 30% wants / 20% savings adapted to actual income
- Insight messages generated via helper functions comparing ratios to healthy benchmarks

## Estimated Scope
- ~6 new files, ~2 modified files
- Heavy use of existing UI patterns (cards, progress, animations) and recharts for charts

