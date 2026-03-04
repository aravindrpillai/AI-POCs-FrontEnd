export type EmploymentStatus = "employed" | "self-employed" | "unemployed" | "retired";
export type Gender = "male" | "female" | "other";
export type IncomeStability = "fixed" | "variable";
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Goal {
  label: string;
  targetAmount: number;
  timeframeMonths: number;
}

export interface FinanceIntake {
  // Identity
  name: string;
  age: number;
  gender: Gender;
  location: string;
  employmentStatus: EmploymentStatus;
  dependants: number;

  // Income
  primaryIncome: number;
  secondaryIncome: number;
  incomeStability: IncomeStability;

  // Fixed expenses
  rent: number;
  loanEMIs: number;
  insurance: number;
  subscriptions: number;

  // Variable & irregular expenses
  groceries: number;
  transport: number;
  dining: number;
  entertainment: number;
  annualBills: number;
  schoolFees: number;
  medical: number;

  // Assets
  savingsBalance: number;
  investments: number;
  propertyValue: number;
  emergencyFund: number;

  // Liabilities
  creditCardBalance: number;
  creditCardRate: number;
  personalLoans: number;
  carLoans: number;
  studentLoans: number;
  mortgageOutstanding: number;
  bnplBalance: number;

  // Goals
  shortTermGoals: Goal[];
  mediumTermGoals: Goal[];
  longTermGoals: Goal[];

  // Behaviour (optional)
  savingsDipFrequency: string;
  missedPayments: string;
  spendingPattern: string;
}

export interface FinanceScore {
  overall: number;
  debt: number;
  savings: number;
  spending: number;
  goalProgress: number;
}

export interface Insight {
  type: "warning" | "success" | "info";
  icon: string;
  title: string;
  message: string;
}

export const EMPLOYMENT_OPTIONS: { value: EmploymentStatus; label: string }[] = [
  { value: "employed", label: "Employed" },
  { value: "self-employed", label: "Self-Employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "retired", label: "Retired" },
];

export const STEP_TITLES: Record<WizardStep, string> = {
  1: "Identity & Demographics",
  2: "Income",
  3: "Fixed Expenses",
  4: "Variable & Irregular Expenses",
  5: "Assets",
  6: "Liabilities & Debts",
  7: "Goals",
  8: "Behaviour",
};

export const defaultIntake: FinanceIntake = {
  name: "", age: 30, gender: "male", location: "", employmentStatus: "employed", dependants: 0,
  primaryIncome: 0, secondaryIncome: 0, incomeStability: "fixed",
  rent: 0, loanEMIs: 0, insurance: 0, subscriptions: 0,
  groceries: 0, transport: 0, dining: 0, entertainment: 0, annualBills: 0, schoolFees: 0, medical: 0,
  savingsBalance: 0, investments: 0, propertyValue: 0, emergencyFund: 0,
  creditCardBalance: 0, creditCardRate: 0, personalLoans: 0, carLoans: 0, studentLoans: 0, mortgageOutstanding: 0, bnplBalance: 0,
  shortTermGoals: [], mediumTermGoals: [], longTermGoals: [],
  savingsDipFrequency: "", missedPayments: "", spendingPattern: "",
};
