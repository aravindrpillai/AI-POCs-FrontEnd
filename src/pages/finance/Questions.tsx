import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Loader2, DollarSign, Search, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FinanceIntake, WizardStep, EMPLOYMENT_OPTIONS, STEP_TITLES, defaultIntake, CITIES,
} from "@/types/finance";
import {
  createFinanceRecord, updateFinanceRecord, getFinanceRecord,
} from "@/services/financeService";

/* ── Searchable City Picker ── */
const CityPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => (query ? CITIES.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 30) : CITIES.slice(0, 30)),
    [query]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-card px-3 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {open ? (
          <input
            autoFocus
            className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground"
            placeholder="Search city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        ) : (
          <span className={`text-sm flex-1 ${value ? "text-foreground" : "text-muted-foreground"}`}>
            {value || "Select city…"}
          </span>
        )}
        {value && !open && <Check className="w-3.5 h-3.5 text-success" />}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-elevated scrollbar-thin"
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No cities found</p>
            ) : (
              filtered.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent/10 transition-colors flex items-center justify-between ${value === city ? "bg-success/10 text-success font-medium" : "text-foreground"}`}
                  onClick={() => { onChange(city); setOpen(false); setQuery(""); }}
                >
                  {city}
                  {value === city && <Check className="w-3.5 h-3.5" />}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── helpers ── */
const intakeToPayload = (data: FinanceIntake) => ({
  age:               data.age,
  city:              data.location,
  employment_status: data.employmentStatus,
  primary_income:    data.primaryIncome,
  secondary_income:  data.secondaryIncome,
  rent_mortgage:     data.rent,
  insurance_premiums: data.insurance,
  subscriptions:     data.subscriptions,
  outstanding_loans: data.totalOutstandingLoan,
  variable_expenses: data.variableExpenses,
  savings_balance:   data.savingsBalance,
  investments:       data.investments,
  property_value:    data.propertyValue,
  emergency_fund:    data.emergencyFund,
  goals:             data.goalSummary,
});

/* ── Main Component ── */
const Questions = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<FinanceIntake>({ ...defaultIntake });
  const [recordId, setRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TOTAL_STEPS = 5;

  const set = <K extends keyof FinanceIntake>(key: K, val: FinanceIntake[K]) =>
    setData((p) => ({ ...p, [key]: val }));

  const num = (key: keyof FinanceIntake, val: string) =>
    set(key, (val === "" ? 0 : parseFloat(val)) as any);

  const canGoNext = (): boolean => {
    if (step === 1) return data.age > 0 && !!data.location;
    if (step === 2) return data.primaryIncome > 0;
    return true;
  };

  /* ── Persist to API on each step advance ── */
  const saveStep = async (): Promise<string | null> => {
    try {
      const payload = intakeToPayload(data);
      if (recordId) {
        await updateFinanceRecord(recordId, payload);
        return recordId;
      } else {
        const record = await createFinanceRecord(payload);
        setRecordId(record.id);
        // Update URL with backend UUID without adding a new history entry
        navigate(`/finance-advisor/questions/${record.id}`, { replace: true });
        return record.id;
      }
    } catch (e) {
      setError("Failed to save progress. Please try again.");
      return null;
    }
  };

  const nextStep = async () => {
    if (step >= TOTAL_STEPS) return;
    setLoading(true);
    setError(null);
    const id = await saveStep();
    setLoading(false);
    if (id) setStep((s) => (s + 1) as WizardStep);
  };

  const prevStep = () => {
    setError(null);
    if (step > 1) setStep((s) => (s - 1) as WizardStep);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const id = await saveStep();
    if (id) {
      navigate(`/finance-advisor/summary/${id}`);
    } else {
      setLoading(false);
    }
  };

  const inputClass = "bg-card border-border";

  const renderField = (label: string, key: keyof FinanceIntake, placeholder = "", type = "number") => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        {type === "number" && (
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-success/60" />
        )}
        <Input
          type={type}
          placeholder={placeholder}
          className={`${inputClass} ${type === "number" ? "pl-8" : ""}`}
          value={type === "number" ? (data[key] as number || "") : (data[key] as string)}
          onChange={(e) => type === "number" ? num(key, e.target.value) : set(key, e.target.value as any)}
        />
      </div>
    </div>
  );

  const stepContent: Record<WizardStep, JSX.Element> = {
    1: (
      <div className="grid gap-4 sm:grid-cols-2">
        {renderField("Age", "age", "30")}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">City</Label>
          <CityPicker value={data.location} onChange={(v) => set("location", v)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Employment Status</Label>
          <Select value={data.employmentStatus} onValueChange={(v) => set("employmentStatus", v as any)}>
            <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    ),
    2: (
      <div className="grid gap-4 sm:grid-cols-2">
        {renderField("Primary Monthly Income (after tax)", "primaryIncome", "3000")}
        {renderField("Secondary Income (freelance, rental, etc.)", "secondaryIncome", "0")}
      </div>
    ),
    3: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-heading font-semibold text-success mb-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success" /> Fixed Expenses
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {renderField("Rent / Mortgage", "rent", "1200")}
            {renderField("Insurance Premiums", "insurance", "0")}
            {renderField("Subscriptions", "subscriptions", "0")}
            {renderField("Total Outstanding Loans", "totalOutstandingLoan", "0")}
          </div>
        </div>
        <div className="border-t border-border pt-5">
          <h3 className="text-xs font-heading font-semibold text-info mb-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-info" /> Variable Expenses
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {renderField("Total Variable Expenses (groceries, transport, dining, entertainment, medical, school fees)", "variableExpenses", "800")}
          </div>
        </div>
      </div>
    ),
    4: (
      <div className="grid gap-4 sm:grid-cols-2">
        {renderField("Savings Account Balance", "savingsBalance", "5000")}
        {renderField("Investments (stocks, funds, pension)", "investments", "0")}
        {renderField("Property Value", "propertyValue", "0")}
        {renderField("Emergency Fund", "emergencyFund", "0")}
      </div>
    ),
    5: (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tell us about your financial goals — what are you saving for? Planning a holiday, buying a car, saving for a house deposit, retirement planning? The more detail the better.
        </p>
        <Textarea
          placeholder="e.g. I'm saving for a house deposit of £30,000 in the next 2 years, and I'd like to start a pension top-up. I also want to clear my credit card debt..."
          className={`${inputClass} min-h-[140px] resize-none`}
          value={data.goalSummary}
          onChange={(e) => set("goalSummary", e.target.value)}
        />
      </div>
    ),
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => step === 1 ? navigate("/finance-advisor") : prevStep()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-heading font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success shrink-0" />
              Financial Check-up
            </h1>
            <p className="text-xs text-muted-foreground">Step {step} of {TOTAL_STEPS} — {STEP_TITLES[step]}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="relative mb-7">
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <button
                key={i}
                onClick={() => i + 1 < step && setStep((i + 1) as WizardStep)}
                className={`w-6 h-6 rounded-full text-[10px] font-bold border-2 transition-all ${
                  i + 1 <= step
                    ? "bg-success border-success text-success-foreground"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-card relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] pointer-events-none">
              <DollarSign className="w-full h-full" />
            </div>
            <h2 className="text-base font-heading font-bold text-foreground mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center text-success text-xs font-bold">{step}</span>
              {STEP_TITLES[step]}
            </h2>
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="mt-3 text-xs text-destructive text-center">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-5 gap-3">
          <Button variant="outline" onClick={prevStep} disabled={step === 1 || loading} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {step < TOTAL_STEPS ? (
            <Button onClick={nextStep} disabled={!canGoNext() || loading} className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Next <ArrowRight className="w-4 h-4" /></>}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Generate Report <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;
