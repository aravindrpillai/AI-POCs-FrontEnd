import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FinanceIntake, Goal, WizardStep, EMPLOYMENT_OPTIONS, STEP_TITLES, defaultIntake,
} from "@/types/finance";

const Questions = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<FinanceIntake>({ ...defaultIntake });
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof FinanceIntake>(key: K, val: FinanceIntake[K]) =>
    setData((p) => ({ ...p, [key]: val }));

  const num = (key: keyof FinanceIntake, val: string) =>
    set(key, (val === "" ? 0 : parseFloat(val)) as any);

  const canGoNext = (): boolean => {
    if (step === 1) return !!data.name && data.age > 0;
    if (step === 2) return data.primaryIncome > 0;
    return true;
  };

  const nextStep = () => { if (step < 8) setStep((s) => (s + 1) as WizardStep); };
  const prevStep = () => { if (step > 1) setStep((s) => (s - 1) as WizardStep); };

  const addGoal = (list: "shortTermGoals" | "mediumTermGoals" | "longTermGoals") => {
    set(list, [...data[list], { label: "", targetAmount: 0, timeframeMonths: 12 }]);
  };

  const updateGoal = (list: "shortTermGoals" | "mediumTermGoals" | "longTermGoals", idx: number, field: keyof Goal, val: string) => {
    const goals = [...data[list]];
    if (field === "label") goals[idx] = { ...goals[idx], label: val };
    else goals[idx] = { ...goals[idx], [field]: parseFloat(val) || 0 };
    set(list, goals);
  };

  const removeGoal = (list: "shortTermGoals" | "mediumTermGoals" | "longTermGoals", idx: number) => {
    set(list, data[list].filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      sessionStorage.setItem(`finance-data-${sessionId}`, JSON.stringify(data));
      navigate(`/finance-advisor/summary/${sessionId}`);
    } catch {
      setLoading(false);
    }
  };

  const inputClass = "bg-card border-border";

  const renderField = (label: string, key: keyof FinanceIntake, placeholder = "", type = "number") => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        className={inputClass}
        value={type === "number" ? (data[key] as number || "") : (data[key] as string)}
        onChange={(e) => type === "number" ? num(key, e.target.value) : set(key, e.target.value as any)}
      />
    </div>
  );

  const renderGoalSection = (title: string, list: "shortTermGoals" | "mediumTermGoals" | "longTermGoals") => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-foreground">{title}</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => addGoal(list)} className="h-7 text-xs gap-1 text-success">
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      {data[list].map((g, i) => (
        <div key={i} className="flex gap-2 items-start">
          <Input placeholder="Goal name" className={`${inputClass} flex-1`} value={g.label} onChange={(e) => updateGoal(list, i, "label", e.target.value)} />
          <Input placeholder="Amount" type="number" className={`${inputClass} w-28`} value={g.targetAmount || ""} onChange={(e) => updateGoal(list, i, "targetAmount", e.target.value)} />
          <Input placeholder="Months" type="number" className={`${inputClass} w-20`} value={g.timeframeMonths || ""} onChange={(e) => updateGoal(list, i, "timeframeMonths", e.target.value)} />
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeGoal(list, i)}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );

  const stepContent: Record<WizardStep, JSX.Element> = {
    1: (
      <div className="grid gap-4 sm:grid-cols-2">
        {renderField("Full Name", "name", "John Doe", "text")}
        {renderField("Age", "age", "30")}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Gender</Label>
          <RadioGroup value={data.gender} onValueChange={(v) => set("gender", v as any)} className="flex gap-4 pt-1">
            {["male", "female", "other"].map((g) => (
              <div key={g} className="flex items-center gap-1.5">
                <RadioGroupItem value={g} id={`g-${g}`} />
                <Label htmlFor={`g-${g}`} className="text-sm capitalize cursor-pointer">{g}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        {renderField("Location (City/Country)", "location", "London, UK", "text")}
        <div className="space-y-1.5">
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
        {renderField("Number of Dependants", "dependants", "0")}
      </div>
    ),
    2: (
      <div className="grid gap-4 sm:grid-cols-2">
        {renderField("Primary Monthly Income (after tax)", "primaryIncome", "3000")}
        {renderField("Secondary Income (freelance, rental, etc.)", "secondaryIncome", "0")}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium text-muted-foreground">Income Stability</Label>
          <RadioGroup value={data.incomeStability} onValueChange={(v) => set("incomeStability", v as any)} className="flex gap-6 pt-1">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="fixed" id="inc-fixed" />
              <Label htmlFor="inc-fixed" className="text-sm cursor-pointer">Fixed Salary</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="variable" id="inc-var" />
              <Label htmlFor="inc-var" className="text-sm cursor-pointer">Variable / Commission</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    ),
    3: (
      <div className="grid gap-4 sm:grid-cols-2">
        {renderField("Rent / Mortgage", "rent", "1200")}
        {renderField("Loan EMIs", "loanEMIs", "0")}
        {renderField("Insurance Premiums", "insurance", "0")}
        {renderField("Subscriptions", "subscriptions", "0")}
      </div>
    ),
    4: (
      <div className="grid gap-4 sm:grid-cols-2">
        {renderField("Groceries", "groceries", "300")}
        {renderField("Transport", "transport", "100")}
        {renderField("Dining Out", "dining", "150")}
        {renderField("Entertainment", "entertainment", "100")}
        {renderField("Annual Bills (monthly avg)", "annualBills", "0")}
        {renderField("School Fees", "schoolFees", "0")}
        {renderField("Medical", "medical", "0")}
      </div>
    ),
    5: (
      <div className="grid gap-4 sm:grid-cols-2">
        {renderField("Savings Account Balance", "savingsBalance", "5000")}
        {renderField("Investments (stocks, funds, pension)", "investments", "0")}
        {renderField("Property Value", "propertyValue", "0")}
        {renderField("Emergency Fund", "emergencyFund", "0")}
      </div>
    ),
    6: (
      <div className="grid gap-4 sm:grid-cols-2">
        {renderField("Credit Card Balance", "creditCardBalance", "0")}
        {renderField("Credit Card Interest Rate (%)", "creditCardRate", "18")}
        {renderField("Personal Loans", "personalLoans", "0")}
        {renderField("Car Loans", "carLoans", "0")}
        {renderField("Student Loans", "studentLoans", "0")}
        {renderField("Mortgage Outstanding", "mortgageOutstanding", "0")}
        {renderField("Buy-Now-Pay-Later Balances", "bnplBalance", "0")}
      </div>
    ),
    7: (
      <div className="space-y-6">
        {renderGoalSection("Short Term (< 1 year)", "shortTermGoals")}
        {renderGoalSection("Medium Term (1–5 years)", "mediumTermGoals")}
        {renderGoalSection("Long Term (5+ years)", "longTermGoals")}
      </div>
    ),
    8: (
      <div className="grid gap-4">
        <p className="text-xs text-muted-foreground">These are optional but help us give better recommendations.</p>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Spending Pattern</Label>
          <Select value={data.spendingPattern} onValueChange={(v) => set("spendingPattern", v)}>
            <SelectTrigger className={inputClass}><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="consistent">Consistent throughout the month</SelectItem>
              <SelectItem value="front-loaded">Spend more at start of month</SelectItem>
              <SelectItem value="end-heavy">Spend more at end of month</SelectItem>
              <SelectItem value="weekends">Higher weekend spending</SelectItem>
              <SelectItem value="impulsive">Impulsive / unplanned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">How often do you dip into savings?</Label>
          <Select value={data.savingsDipFrequency} onValueChange={(v) => set("savingsDipFrequency", v)}>
            <SelectTrigger className={inputClass}><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="rarely">Rarely (1–2 times/year)</SelectItem>
              <SelectItem value="sometimes">Sometimes (monthly)</SelectItem>
              <SelectItem value="often">Often (weekly)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Missed payments in the last 12 months?</Label>
          <Select value={data.missedPayments} onValueChange={(v) => set("missedPayments", v)}>
            <SelectTrigger className={inputClass}><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="1-2">1–2 times</SelectItem>
              <SelectItem value="3-5">3–5 times</SelectItem>
              <SelectItem value="6+">6+ times</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step === 1 ? navigate("/finance-advisor") : prevStep()} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-heading font-bold text-foreground">Financial Check-up</h1>
            <p className="text-xs text-muted-foreground">Step {step} of 8 — {STEP_TITLES[step]}</p>
          </div>
        </div>

        <Progress value={(step / 8) * 100} className="mb-8 h-2" />

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-card"
          >
            <h2 className="text-base font-heading font-bold text-foreground mb-5">{STEP_TITLES[step]}</h2>
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={step === 1} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {step < 8 ? (
            <Button onClick={nextStep} disabled={!canGoNext()} className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Generate Report <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;
