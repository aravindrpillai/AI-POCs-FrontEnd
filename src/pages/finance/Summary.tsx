import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, TrendingUp, PiggyBank, Target,
  Lightbulb, Printer, BarChart3, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { FinanceIntake, FinanceScore, Insight } from "@/types/finance";

/* ─── Score calculation helpers ─── */
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(v)));

function calcScores(d: FinanceIntake): FinanceScore {
  const totalIncome = d.primaryIncome + d.secondaryIncome;
  const totalFixedExp = d.rent + d.insurance + d.subscriptions;
  const totalVarExp = d.groceries + d.transport + d.dining + d.entertainment + d.medical + d.schoolFees;
  const totalExpenses = totalFixedExp + totalVarExp;

  // Debt score: based on loan-to-income ratio
  const loanRatio = totalIncome > 0 ? d.totalOutstandingLoan / (totalIncome * 12) : 1;
  const debtScore = clamp(100 - loanRatio * 50);

  // Savings score
  const savingsRate = totalIncome > 0 ? Math.max(0, totalIncome - totalExpenses) / totalIncome : 0;
  const emergencyMonths = totalExpenses > 0 ? d.emergencyFund / totalExpenses : 0;
  const savingsScore = clamp(savingsRate * 200 + Math.min(emergencyMonths / 3, 1) * 30);

  // Spending score
  const spendRatio = totalIncome > 0 ? totalExpenses / totalIncome : 1;
  const spendingScore = clamp(100 - spendRatio * 100);

  const overall = clamp(debtScore * 0.3 + savingsScore * 0.35 + spendingScore * 0.35);
  return { overall, debt: debtScore, savings: savingsScore, spending: spendingScore };
}

function generateInsights(d: FinanceIntake): Insight[] {
  const insights: Insight[] = [];
  const totalIncome = d.primaryIncome + d.secondaryIncome;
  const totalFixedExp = d.rent + d.insurance + d.subscriptions;
  const totalVarExp = d.groceries + d.transport + d.dining + d.entertainment + d.medical + d.schoolFees;
  const totalExpenses = totalFixedExp + totalVarExp;
  const monthlySavings = totalIncome - totalExpenses;
  const emergencyMonths = totalExpenses > 0 ? d.emergencyFund / totalExpenses : 0;

  if (totalIncome > 0 && totalExpenses / totalIncome > 0.8) {
    insights.push({ type: "warning", icon: "⚠️", title: "High Spending", message: `You're spending ${Math.round((totalExpenses / totalIncome) * 100)}% of income — aim for under 80%.` });
  }
  if (emergencyMonths < 3) {
    insights.push({ type: "warning", icon: "🚨", title: "Low Emergency Fund", message: `Your emergency fund covers only ${emergencyMonths.toFixed(1)} months — recommended is 3–6 months.` });
  }
  if (d.savingsBalance > 0 && monthlySavings <= 0) {
    insights.push({ type: "warning", icon: "⏳", title: "Savings Drain", message: `At this rate you'll deplete savings in ${Math.round(d.savingsBalance / Math.abs(monthlySavings || 1))} months.` });
  }
  if (monthlySavings > 500) {
    insights.push({ type: "success", icon: "✅", title: "Healthy Surplus", message: `You have ${monthlySavings.toLocaleString()} available monthly — great for investing or goals.` });
  }
  if (d.totalOutstandingLoan > totalIncome * 12) {
    insights.push({ type: "warning", icon: "💳", title: "High Loan Burden", message: `Your outstanding loans exceed your annual income. Consider a repayment strategy.` });
  }
  if (d.subscriptions > 100) {
    insights.push({ type: "info", icon: "🔁", title: "Subscription Check", message: `You're spending ${d.subscriptions.toLocaleString()}/month on subscriptions — review if all are needed.` });
  }

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
  const totalFixedExp = data.rent + data.insurance + data.subscriptions;
  const totalVarExp = data.groceries + data.transport + data.dining + data.entertainment + data.medical + data.schoolFees;
  const totalExpenses = totalFixedExp + totalVarExp;
  const monthlySavings = Math.max(0, totalIncome - totalExpenses);

  const needs = Math.round(totalIncome * 0.5);
  const wants = Math.round(totalIncome * 0.3);
  const savingsIdeal = Math.round(totalIncome * 0.2);
  const budgetData = [
    { name: "Needs (50%)", ideal: needs, actual: totalFixedExp },
    { name: "Wants (30%)", ideal: wants, actual: totalVarExp },
    { name: "Savings (20%)", ideal: savingsIdeal, actual: monthlySavings },
  ];
  const budgetPie = [
    { name: "Needs", value: totalFixedExp },
    { name: "Wants", value: totalVarExp },
    { name: "Savings", value: monthlySavings },
  ];

  const idleMoney = monthlySavings > 0 ? monthlySavings : 0;
  const projected10y = idleMoney * 12 * 10 * 1.07;

  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen px-4 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div {...fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/finance-advisor")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" />
                Financial Health Report
              </h1>
              <p className="text-sm text-muted-foreground">{data.age} years • {data.location} • {data.employmentStatus}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 self-start sm:self-auto">
            <Printer className="w-4 h-4" /> Print
          </Button>
        </motion.div>

        {/* Scores */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="w-4 h-4 text-success" /> Financial Health Score</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
                <ScoreRing score={scores.overall} size={130} label="Overall" />
                <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
                  <ScoreRing score={scores.debt} size={80} label="Debt" />
                  <ScoreRing score={scores.savings} size={80} label="Savings" />
                  <ScoreRing score={scores.spending} size={80} label="Spending" />
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
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PiggyBank className="w-4 h-4 text-success" /> 50/30/20 Budget</CardTitle></CardHeader>
            <CardContent className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetPie} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {budgetPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Ideal vs Actual</CardTitle></CardHeader>
            <CardContent className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="ideal" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Ideal" />
                  <Bar dataKey="actual" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loan overview */}
        {data.totalOutstandingLoan > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="w-4 h-4 text-destructive" /> Loan Overview</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-xl border border-border bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Outstanding Loans</p>
                    <p className="text-2xl font-bold text-foreground">{data.totalOutstandingLoan.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Loan-to-Income Ratio</p>
                    <p className="text-2xl font-bold text-foreground">{totalIncome > 0 ? (data.totalOutstandingLoan / (totalIncome * 12) * 100).toFixed(1) : 0}%</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Est. Payoff</p>
                    <p className="text-2xl font-bold text-foreground">{monthlySavings > 0 ? `${Math.ceil(data.totalOutstandingLoan / monthlySavings)} mo` : "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Goals */}
        {data.goalSummary && (
          <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="w-4 h-4 text-info" /> Your Goals</CardTitle></CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-info/5 border border-info/20">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{data.goalSummary}</p>
                </div>
                {monthlySavings > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    With your current monthly surplus of <span className="text-success font-semibold">{monthlySavings.toLocaleString()}</span>, you can allocate towards these goals.
                  </p>
                )}
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
                    If invested at an average 7% annual return, this could grow to approximately <span className="font-bold text-success">{Math.round(projected10y).toLocaleString()}</span> in 10 years.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div {...fadeUp} transition={{ delay: 0.7 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Monthly Income", value: totalIncome.toLocaleString(), color: "text-success" },
              { label: "Monthly Expenses", value: totalExpenses.toLocaleString(), color: "text-destructive" },
              { label: "Net Savings", value: monthlySavings.toLocaleString(), color: monthlySavings > 0 ? "text-success" : "text-destructive" },
              { label: "Total Assets", value: (data.savingsBalance + data.investments + data.propertyValue + data.emergencyFund).toLocaleString(), color: "text-info" },
            ].map((s, i) => (
              <div key={i} className="p-3 sm:p-4 rounded-xl border border-border bg-card shadow-card text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-base sm:text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p {...fadeUp} transition={{ delay: 0.8 }} className="text-[11px] text-muted-foreground text-center max-w-md mx-auto leading-relaxed pb-8">
          ⚠️ This report is for informational purposes only and does not constitute regulated financial advice. Always consult a qualified financial advisor before making significant financial decisions.
        </motion.p>
      </div>
    </div>
  );
};

export default Summary;
