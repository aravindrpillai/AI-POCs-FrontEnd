
const BASE_URL = import.meta.env.VITE_API_BASE_URL+"/ai/finance";

export interface FinancePayload {
  age?: number;
  city?: string;
  employment_status?: string;
  primary_income?: number;
  secondary_income?: number;
  rent_mortgage?: number;
  insurance_premiums?: number;
  subscriptions?: number;
  outstanding_loans?: number;
  variable_expenses?: number;
  savings_balance?: number;
  investments?: number;
  property_value?: number;
  emergency_fund?: number;
  goals?: string;
}

export interface FinanceRecord extends FinancePayload {
  id: string;
  ai_response: FinanceReport | null;
  created_at: string;
}

export interface FinanceReport {
  health_score: {
    score: number;
    grade: "A" | "B" | "C" | "D" | "F";
    summary: string;
  };
  income_expense_summary: {
    total_monthly_income: number;
    total_monthly_expenses: number;
    monthly_surplus: number;
    savings_rate_percent: number;
    verdict: string;
  };
  budget_breakdown: {
    rent_mortgage:      { amount: number; status: BudgetStatus; note: string };
    insurance_premiums: { amount: number; status: BudgetStatus; note: string };
    subscriptions:      { amount: number; status: BudgetStatus; note: string };
    outstanding_loans:  { amount: number; status: BudgetStatus; note: string };
    variable_expenses:  { amount: number; status: BudgetStatus; note: string };
  };
  savings_assets_assessment: {
    emergency_fund_months: number;
    emergency_fund_status: "sufficient" | "insufficient";
    emergency_fund_note: string;
    savings_balance: number;
    savings_vs_age_verdict: string;
    investments_status: "none" | "low" | "moderate" | "strong";
    investments_note: string;
  };
  debt_analysis: {
    total_debt: number;
    debt_to_income_ratio: number;
    status: BudgetStatus;
    repayment_strategy: string | null;
  };
  goal_alignment: {
    stated_goals: string;
    alignment_score: number;
    analysis: string;
    gaps: string[];
  };
  recommendations: {
    priority: number;
    title: string;
    detail: string;
    rationale: string;
  }[];
  risk_flags: {
    severity: "high" | "medium" | "low";
    flag: string;
    action: string;
  }[];
}

type BudgetStatus = "healthy" | "concerning" | "critical";

/* ── Create a new record ── */
export async function createFinanceRecord(payload: FinancePayload): Promise<FinanceRecord> {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create finance record");
  return res.json();
}

/* ── Update an existing record ── */
export async function updateFinanceRecord(id: string, payload: FinancePayload): Promise<FinanceRecord> {
  const res = await fetch(`${BASE_URL}/${id}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update finance record");
  return res.json();
}

/* ── Get a record by ID ── */
export async function getFinanceRecord(id: string): Promise<FinanceRecord> {
  const res = await fetch(`${BASE_URL}/${id}/`);
  if (!res.ok) throw new Error("Failed to fetch finance record");
  return res.json();
}

/* ── Trigger AI report generation ── */
export async function generateFinanceReport(id: string): Promise<FinanceRecord> {
  const res = await fetch(`${BASE_URL}/${id}/report/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to generate finance report");
  return res.json();
}
