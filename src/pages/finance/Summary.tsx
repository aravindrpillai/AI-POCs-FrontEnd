import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, TrendingUp, PiggyBank, CreditCard, Target,
  Lightbulb, Brain, Printer, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { FinanceIntake, FinanceScore, Insight, Goal } from "@/types/finance";

/* ─── Score calculation helpers ─── */
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(v)));

function calcScores(d: FinanceIntake): FinanceScore {
  const totalIncome = d.primaryIncome + d.secondaryIncome;
  const totalFixedExp = d.rent + d.loanEMIs + d.insurance + d.subscriptions;
  const totalVarExp = d.groceries + d.transport + d.dining + d.entertainment + (d.annualBills / 12) + (d.schoolFees / 12) + (d.medical / 12);
  const totalExpenses = totalFixedExp + totalVarExp;
  const totalDebt = d.creditCardBalance + d.personalLoans + d.carLoans + d.studentLoans + d.mortgageOutstanding + d.bnplBalance;
  const totalDebtPayments = d.loanEMIs + (d.creditCardBalance * (d.creditCardRate / 100) / 12);

  // Debt score: based on debt-to-income ratio (lower = better)
  const dti = totalIncome > 0 ? totalDebtPayments / totalIncome : 1;
  const debtScore = clamp(100 - dti * 200);

  // Savings score: savings rate + emergency fund coverage
  const savingsRate = totalIncome > 0 ? Math.max(0, totalIncome - totalExpenses) / totalIncome : 0;
  const emergencyMonths = totalExpenses > 0 ? d.emergencyFund / totalExpenses : 0;
  const savingsScore = clamp(savingsRate * 200 + Math.min(emergencyMonths / 3, 1) * 30);

  // Spending score: percentage of income spent (lower = better)
  const spendRatio = totalIncome > 0 ? totalExpenses / totalIncome : 1;
  const spendingScore = clamp(100 - spendRatio * 100);

  // Goal progress: how achievable goals are at current savings
  const allGoals = [...d.shortTermGoals, ...d.mediumTermGoals, ...d.longTermGoals];
  const monthlySavings = Math.max(0, totalIncome - totalExpenses);
  let goalScore = 70; // default if no goals
  if (allGoals.length > 0) {
    const feasible = allGoals.filter((g) => g.timeframeMonths > 0 && monthlySavings * g.timeframeMonths >= g.targetAmount * 0.5).length;
    goalScore = clamp((feasible / allGoals.length) * 100);
  }

  const overall = clamp((debtScore * 0.3 + savingsScore * 0.3 + spendingScore * 0.2 + goalScore * 0.2));
  return { overall, debt: debtScore, savings: savingsScore, spending: spendingScore, goalProgress: goalScore };
}

function generateInsights(d: FinanceIntake): Insight[] {
  const insights: Insight[] = [];
  const totalIncome = d.primaryIncome + d.secondaryIncome;
  const totalFixedExp = d.rent + d.loanEMIs + d.insurance + d.subscriptions;
  const totalVarExp = d.groceries + d.transport + d.dining + d.entertainment + (d.annualBills / 12) + (d.schoolFees / 12) + (d.medical / 12);
  const totalExpenses = totalFixedExp + totalVarExp;
  const monthlySavings = totalIncome - totalExpenses;
  const debtPayments = d.loanEMIs + (d.creditCardBalance * (d.creditCardRate / 100) / 12);
  const dti = totalIncome > 0 ? debtPayments / totalIncome : 0;
  const emergencyMonths = totalExpenses > 0 ? d.emergencyFund / totalExpenses : 0;

  if (dti > 0.3) insights.push({ type: "warning", icon: "⚠️", title: "High Debt Load", message: `You're spending ${Math.round(dti * 100)}% of income on debt — the healthy limit is 30%.` });
  if (emergencyMonths < 3) insights.push({ type: "warning", icon: "🚨", title: "Low Emergency Fund", message: `Your emergency fund covers only ${emergencyMonths.toFixed(1)} months — recommended is 3–6 months.` });
  if (d.savingsBalance > 0 && monthlySavings <= 0) insights.push({ type: "warning", icon: "⏳", title: "Savings Drain", message: `At this rate you'll deplete savings in ${Math.round(d.savingsBalance / Math.abs(monthlySavings || 1))} months.` });
  if (monthlySavings > 500) insights.push({ type: "success", icon: "✅", title: "Healthy Surplus", message: `You have ${monthlySavings.toLocaleString()} available monthly — great for investing or goals.` });
  if (d.creditCardBalance > 0) insights.push({ type: "info", icon: "💳", title: "Credit Card Debt", message: `Your credit card is costing you ~${Math.round(d.creditCardBalance * d.creditCardRate / 100 / 12).toLocaleString()}/month in interest.` });
  if (d.subscriptions > 100) insights.push({ type: "info", icon: "🔁", title: "Subscription Check", message: `You're spending ${d.subscriptions.toLocaleString()}/month on subscriptions — review if all are needed.` });

  return insights;
}

/* ─── Mini ScoreRing ─── */
const ScoreRing = ({ score, size = 100, label }: { score: number; size?: number; label: string }) => {
  const sw = 7, r = (size - sw) / 2, circ = 2 * Math.PI * r, off = circ - (score / 100) * circ;
  const color = score >= 70 ? "hsl(var(--success))" : score >= 40 ? "hsl(28 92% 58%)" : "hsl(var(--destructive))";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={sw} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <span className="absolute text-xl font-bold text-foreground">{score}</span>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

/* ─── PIE COLORS ─── */
const PIE_COLORS = ["hsl(var(--success))", "hsl(28 92% 58%)", "hsl(var(--info))"];

const Summary = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<FinanceIntake | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`finance-data-${sessionId}`);
    if (raw) setData(JSON.parse(raw));
  }, [sessionId]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Session not found.</p>
          <Button variant="outline" onClick={() => navigate("/finance-advisor")}>Go Back</Button>
        </div>
      </div>
    );
  }

  const scores = calcScores(data);
  const insights = generateInsights(data);
  const totalIncome = data.primaryIncome + data.secondaryIncome;
  const totalFixedExp = data.rent + data.loanEMIs + data.insurance + data.subscriptions;
  const totalVarExp = data.groceries + data.transport + data.dining + data.entertainment + (data.annualBills / 12) + (data.schoolFees / 12) + (data.medical / 12);
  const totalExpenses = totalFixedExp + totalVarExp;
  const monthlySavings = Math.max(0, totalIncome - totalExpenses);

  const needs = Math.round(totalIncome * 0.5);
  const wants = Math.round(totalIncome * 0.3);
  const savings = Math.round(totalIncome * 0.2);
  const budgetData = [
    { name: "Needs (50%)", ideal: needs, actual: totalFixedExp },
    { name: "Wants (30%)", ideal: wants, actual: totalVarExp },
    { name: "Savings (20%)", ideal: savings, actual: monthlySavings },
  ];
  const budgetPie = [
    { name: "Needs", value: totalFixedExp },
    { name: "Wants", value: totalVarExp },
    { name: "Savings", value: monthlySavings },
  ];

  const debts = [
    { name: "Credit Card", balance: data.creditCardBalance, rate: data.creditCardRate },
    { name: "Personal Loans", balance: data.personalLoans, rate: 8 },
    { name: "Car Loans", balance: data.carLoans, rate: 6 },
    { name: "Student Loans", balance: data.studentLoans, rate: 4 },
    { name: "Mortgage", balance: data.mortgageOutstanding, rate: 3.5 },
    { name: "BNPL", balance: data.bnplBalance, rate: 0 },
  ].filter((d) => d.balance > 0).sort((a, b) => b.rate - a.rate);

  const allGoals: (Goal & { category: string })[] = [
    ...data.shortTermGoals.map((g) => ({ ...g, category: "Short" })),
    ...data.mediumTermGoals.map((g) => ({ ...g, category: "Medium" })),
    ...data.longTermGoals.map((g) => ({ ...g, category: "Long" })),
  ];

  const idleMoney = monthlySavings > 0 ? monthlySavings : 0;
  const projected10y = idleMoney * 12 * 10 * 1.07; // rough 7% annual

  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  const behaviourTips: string[] = [];
  if (data.spendingPattern === "weekends") behaviourTips.push("You tend to spend more on weekends — consider setting a weekend-only budget.");
  if (data.spendingPattern === "impulsive") behaviourTips.push("Impulsive spending detected — try a 24-hour rule before non-essential purchases.");
  if (data.savingsDipFrequency === "often") behaviourTips.push("You dip into savings often — consider automating savings to a separate account.");
  if (data.missedPayments && data.missedPayments !== "none") behaviourTips.push("Missed payments can hurt credit scores — set up automatic payments where possible.");

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div {...fadeUp} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/finance-advisor")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Financial Health Report</h1>
              <p className="text-sm text-muted-foreground">{data.name} • {data.age} years • {data.location}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 hidden sm:flex">
            <Printer className="w-4 h-4" /> Print
          </Button>
        </motion.div>

        {/* Scores Section */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="w-4 h-4 text-success" /> Financial Health Score</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-center gap-8">
                <ScoreRing score={scores.overall} size={130} label="Overall" />
                <div className="flex gap-6 flex-wrap justify-center">
                  <ScoreRing score={scores.debt} size={80} label="Debt" />
                  <ScoreRing score={scores.savings} size={80} label="Savings" />
                  <ScoreRing score={scores.spending} size={80} label="Spending" />
                  <ScoreRing score={scores.goalProgress} size={80} label="Goals" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="w-4 h-4 text-accent" /> Insights & Warnings</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {insights.map((ins, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-xl border ${ins.type === "warning" ? "border-destructive/30 bg-destructive/5" : ins.type === "success" ? "border-success/30 bg-success/5" : "border-info/30 bg-info/5"}`}>
                    <span className="text-xl">{ins.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ins.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{ins.message}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Budget Plan */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PiggyBank className="w-4 h-4 text-success" /> 50/30/20 Budget</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {budgetPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Ideal vs Actual</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="ideal" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Ideal" />
                  <Bar dataKey="actual" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Debt Prioritisation */}
        {debts.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="w-4 h-4 text-destructive" /> Debt Prioritisation (Avalanche Method)</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">Ranked by interest rate — pay highest first to minimise total interest.</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Debt</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Monthly Interest</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debts.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell className="text-right">{d.balance.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{d.rate}%</TableCell>
                        <TableCell className="text-right">{Math.round(d.balance * d.rate / 100 / 12).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Goal Planning */}
        {allGoals.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="w-4 h-4 text-info" /> Goal Planning</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allGoals.map((g, i) => {
                  const needed = g.timeframeMonths > 0 ? Math.ceil(g.targetAmount / g.timeframeMonths) : g.targetAmount;
                  const feasible = monthlySavings >= needed;
                  const progress = monthlySavings > 0 ? clamp((monthlySavings / needed) * 100) : 0;
                  return (
                    <div key={i} className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{g.label || "Untitled Goal"}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-info/10 text-info font-medium">{g.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Target: {g.targetAmount.toLocaleString()} in {g.timeframeMonths} months</p>
                      <p className="text-xs text-muted-foreground">Monthly needed: <span className={feasible ? "text-success font-semibold" : "text-destructive font-semibold"}>{needed.toLocaleString()}</span></p>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Investment Nudges */}
        {idleMoney > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-4 h-4 text-success" /> Investment Nudges</CardTitle></CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                  <p className="text-sm text-foreground font-medium mb-1">
                    You have ~{idleMoney.toLocaleString()}/month available after expenses.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If invested at an average 7% annual return, this could grow to approximately <span className="font-bold text-success">{Math.round(projected10y).toLocaleString()}</span> in 10 years. Consider starting with low-cost index funds or a pension top-up.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Behavioural Coaching */}
        {behaviourTips.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.7 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Brain className="w-4 h-4 text-accent" /> Behavioural Coaching</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {behaviourTips.map((t, i) => (
                  <div key={i} className="flex gap-2 items-start p-3 rounded-lg bg-accent/5 border border-accent/15">
                    <span className="text-sm">🧠</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.p {...fadeUp} transition={{ delay: 0.8 }} className="text-[11px] text-muted-foreground text-center max-w-md mx-auto leading-relaxed pb-8">
          ⚠️ This report is for informational purposes only and does not constitute regulated financial advice. Always consult a qualified financial advisor before making significant financial decisions.
        </motion.p>
      </div>
    </div>
  );
};

export default Summary;
