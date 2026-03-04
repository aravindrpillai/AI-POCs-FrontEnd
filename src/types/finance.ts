export type EmploymentStatus = "employed" | "self-employed" | "unemployed" | "retired";
export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface FinanceIntake {
  // Identity
  age: number;
  location: string;
  employmentStatus: EmploymentStatus;

  // Income
  primaryIncome: number;
  secondaryIncome: number;

  // Expenses — fixed
  rent: number;
  insurance: number;
  subscriptions: number;
  totalOutstandingLoan: number;

  // Expenses — variable (total)
  variableExpenses: number;

  // Assets
  savingsBalance: number;
  investments: number;
  propertyValue: number;
  emergencyFund: number;

  // Goals (free-form)
  goalSummary: string;
}

export interface FinanceScore {
  overall: number;
  debt: number;
  savings: number;
  spending: number;
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
  3: "Expenses",
  4: "Assets",
  5: "Your Goals",
};

export const defaultIntake: FinanceIntake = {
  age: 30, location: "", employmentStatus: "employed",
  primaryIncome: 0, secondaryIncome: 0,
  rent: 0, insurance: 0, subscriptions: 0, totalOutstandingLoan: 0,
  variableExpenses: 0,
  savingsBalance: 0, investments: 0, propertyValue: 0, emergencyFund: 0,
  goalSummary: "",
};

export const CITIES: string[] = [
  "Abu Dhabi", "Accra", "Addis Ababa", "Ahmedabad", "Algiers", "Amman", "Amsterdam",
  "Ankara", "Athens", "Atlanta", "Auckland", "Austin", "Baghdad", "Baku", "Baltimore",
  "Bangalore", "Bangkok", "Barcelona", "Beijing", "Beirut", "Belgrade", "Berlin", "Bogotá",
  "Boston", "Brisbane", "Brussels", "Bucharest", "Budapest", "Buenos Aires", "Cairo",
  "Calgary", "Cape Town", "Casablanca", "Charlotte", "Chennai", "Chicago", "Colombo",
  "Columbus", "Copenhagen", "Dallas", "Dar es Salaam", "Delhi", "Denver", "Detroit",
  "Dhaka", "Doha", "Dubai", "Dublin", "Durban", "Düsseldorf", "Edinburgh", "Frankfurt",
  "Geneva", "Glasgow", "Guangzhou", "Hamburg", "Hanoi", "Helsinki", "Ho Chi Minh City",
  "Hong Kong", "Houston", "Hyderabad", "Indianapolis", "Istanbul", "Jacksonville",
  "Jakarta", "Jeddah", "Johannesburg", "Karachi", "Kathmandu", "Kiev", "Kinshasa",
  "Kolkata", "Kuala Lumpur", "Kuwait City", "Lagos", "Lahore", "Las Vegas", "Lima",
  "Lisbon", "London", "Los Angeles", "Luanda", "Lusaka", "Luxembourg", "Lyon", "Madrid",
  "Manchester", "Manila", "Marseille", "Mecca", "Medellín", "Melbourne", "Mexico City",
  "Miami", "Milan", "Minneapolis", "Monterrey", "Montréal", "Moscow", "Mumbai", "Munich",
  "Muscat", "Nairobi", "Nashville", "New York", "Osaka", "Oslo", "Ottawa", "Paris",
  "Perth", "Philadelphia", "Phoenix", "Portland", "Prague", "Pune", "Quito", "Raleigh",
  "Riyadh", "Rome", "Rotterdam", "Salt Lake City", "San Antonio", "San Diego",
  "San Francisco", "San Jose", "Santiago", "São Paulo", "Seattle", "Seoul", "Shanghai",
  "Shenzhen", "Singapore", "Sofia", "Stockholm", "Stuttgart", "Surabaya", "Sydney",
  "Taipei", "Tampa", "Tehran", "Tel Aviv", "The Hague", "Tokyo", "Toronto", "Tunis",
  "Vancouver", "Vienna", "Warsaw", "Washington DC", "Zurich",
];
