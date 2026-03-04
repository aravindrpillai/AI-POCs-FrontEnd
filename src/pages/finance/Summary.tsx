import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, TrendingUp, PiggyBank, Target,
  Lightbulb, Printer, BarChart3, DollarSign, Loader2, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { FinanceRecord, FinanceReport, generateFinanceReport, getFinanceRecord } from "@/services/financeService";

/* ── Constants ── */
const PIE_COLORS = ["hsl(var(--success))", "hsl(28 92% 58%)", "hsl(var(--info))"];

const STATUS_STYLES: Record<string, string> = {
  healthy:    "bg-success/10 text-success border-success/30",
  concerning: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  critical:   "bg-destructive/10 text-destructive border-destructive/30",
};

const SEVERITY_STYLES: Record<string, string> = {
  high:   "border-destructive/30 bg-destructive/5",
  medium: "border-orange-500/30 bg-orange-500/5",
  low:    "border-info/30 bg-info/5",
};

const SEVERITY_ICON: Record<string, string> = {
  high: "🚨", medium: "⚠️", low: "ℹ️",
};

const GRADE_COLOR: Record<string, string> = {
  A: "text-success", B: "text-success", C: "text-orange-500", D: "text-destructive", F: "text-destructive",
};

/* ── Score Ring ── */
const ScoreRing = ({ score, size = 100, label }: { score: number; size?: number; label: string }) => {
  const sw = 7, r = (size - sw) / 2, circ = 2 * Math.PI * r, off = circ - (score / 100) * circ;
  const color = score >= 75 ? "hsl(var(--success))" : score >= 60 ? "hsl(28 92% 58%)" : "hsl(var(--destructive))";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={sw} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
        </svg>
        <span className="absolute text-xl font-bold text-foreground">{score}</span>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

/* ── Loading Screen ── */
const GeneratingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
    <div className="relative">
      <div className="w-20 h-20 rounded-full border-4 border-success/20 border-t-success animate-spin" />
      <DollarSign className="absolute inset-0 m-auto w-8 h-8 text-success" />
    </div>
    <div className="text-center space-y-2">
      <h2 className="text-lg font-heading font-bold text-foreground">Generating Your Report</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Our AI is analysing your financial profile and preparing personalised insights…
      </p>
    </div>
  </div>
);

/* ── Main Component ── */
const Summary = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [record, setRecord] = useState<FinanceRecord | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* On mount: fetch record, then trigger report if ai_response is null */
  useEffect(() => {
    if (!sessionId) return;

    const init = async () => {
      try {
        setGenerating(true);

        // 1. Fetch the record
        const rec = await getFinanceRecord(sessionId);
        setRecord(rec);

        // 2. If no AI report yet, generate it
        if (!rec.ai_response) {
          const updated = await generateFinanceReport(sessionId);
          setRecord(updated);
        }
      } catch (e) {
        setError("Something went wrong generating your report. Please try again.");
      } finally {
        setGenerating(false);
      }
    };

    init();
  }, [sessionId]);

  if (generating) return <GeneratingScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-destructive text-sm">{error}</p>
          <Button variant="outline" onClick={() => navigate("/finance-advisor")}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!record || !record.ai_response) return null;

  const report: FinanceReport = record.ai_response;
  const { health_score, income_expense_summary, budget_breakdown,
    savings_assets_assessment, debt_analysis, goal_alignment,
    recommendations, risk_flags } = report;

  /* Charts data */
  const budgetPie = [
    { name: "Fixed Expenses", value: (record.rent_mortgage ?? 0) + (record.insurance_premiums ?? 0) + (record.subscriptions ?? 0) },
    { name: "Variable",       value: record.variable_expenses ?? 0 },
    { name: "Surplus",        value: Math.max(0, income_expense_summary.monthly_surplus) },
  ];

  const budgetBarData = Object.entries(budget_breakdown).map(([key, val]) => ({
    name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    amount: val.amount,
    status: val.status,
  }));

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
              <p className="text-sm text-muted-foreground">
                {record.age} years • {record.city} • {record.employment_status}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 self-start sm:self-auto">
            <Printer className="w-4 h-4" /> Print
          </Button>
        </motion.div>

        {/* Health Score */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4 text-success" /> Financial Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
                <div className="flex flex-col items-center gap-2">
                  <ScoreRing score={health_score.score} size={130} label="Overall" />
                  <span className={`text-3xl font-bold ${GRADE_COLOR[health_score.grade]}`}>
                    Grade {health_score.grade}
                  </span>
                </div>
                <div className="flex-1 max-w-sm">
                  <p className="text-sm text-muted-foreground leading-relaxed">{health_score.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Income & Expense Summary */}
        <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Monthly Income",   value: income_expense_summary.total_monthly_income,   color: "text-success" },
              { label: "Monthly Expenses", value: income_expense_summary.total_monthly_expenses, color: "text-destructive" },
              { label: "Monthly Surplus",  value: income_expense_summary.monthly_surplus,         color: income_expense_summary.monthly_surplus >= 0 ? "text-success" : "text-destructive" },
              { label: "Savings Rate",     value: `${income_expense_summary.savings_rate_percent}%`, color: "text-info", raw: true },
            ].map((s, i) => (
              <div key={i} className="p-3 sm:p-4 rounded-xl border border-border bg-card shadow-card text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-base sm:text-xl font-bold ${s.color}`}>
                  {(s as any).raw ? s.value : `$${Number(s.value).toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center italic">{income_expense_summary.verdict}</p>
        </motion.div>

        {/* Budget Charts */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PiggyBank className="w-4 h-4 text-success" /> Expense Distribution</CardTitle></CardHeader>
            <CardContent className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetPie} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {budgetPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Expense Breakdown</CardTitle></CardHeader>
            <CardContent className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} name="Amount"
                    fill="hsl(var(--success))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Breakdown Detail */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader><CardTitle className="text-base">Budget Status</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {Object.entries(budget_breakdown).map(([key, val]) => (
                <div key={key} className={`flex items-start justify-between p-3 rounded-xl border ${STATUS_STYLES[val.status]}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold capitalize">{key.replace(/_/g, " ")}</p>
                    {val.note && <p className="text-[11px] mt-0.5 opacity-80 leading-relaxed">{val.note}</p>}
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-sm font-bold">${val.amount.toLocaleString()}</p>
                    <Badge variant="outline" className={`text-[10px] mt-1 ${STATUS_STYLES[val.status]}`}>
                      {val.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings & Assets */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-4 h-4 text-success" /> Savings & Assets</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Emergency Fund</p>
                  <p className="text-lg font-bold text-foreground">{savings_assets_assessment.emergency_fund_months} months</p>
                  <Badge variant="outline" className={`text-[10px] mt-1 ${savings_assets_assessment.emergency_fund_status === "sufficient" ? STATUS_STYLES.healthy : STATUS_STYLES.critical}`}>
                    {savings_assets_assessment.emergency_fund_status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{savings_assets_assessment.emergency_fund_note}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Investments</p>
                  <Badge variant="outline" className={`text-[10px] ${
                    savings_assets_assessment.investments_status === "strong" || savings_assets_assessment.investments_status === "moderate"
                      ? STATUS_STYLES.healthy
                      : savings_assets_assessment.investments_status === "low"
                      ? STATUS_STYLES.concerning
                      : STATUS_STYLES.critical
                  }`}>
                    {savings_assets_assessment.investments_status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{savings_assets_assessment.investments_note}</p>
                </div>
                <p className="text-xs text-muted-foreground italic">{savings_assets_assessment.savings_vs_age_verdict}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Debt Analysis */}
        {debt_analysis.total_debt > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="w-4 h-4 text-destructive" /> Debt Analysis</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3 mb-4">
                  {[
                    { label: "Total Debt",          value: `$${debt_analysis.total_debt.toLocaleString()}` },
                    { label: "Debt-to-Income Ratio", value: `${debt_analysis.debt_to_income_ratio}%` },
                    { label: "Status",               value: debt_analysis.status },
                  ].map((s, i) => (
                    <div key={i} className="p-3 rounded-xl border border-border bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                      <p className="text-lg font-bold text-foreground capitalize">{s.value}</p>
                    </div>
                  ))}
                </div>
                {debt_analysis.repayment_strategy && (
                  <div className="p-3 rounded-xl bg-info/5 border border-info/20">
                    <p className="text-xs font-semibold text-info mb-1">Repayment Strategy</p>
                    <p className="text-sm text-foreground leading-relaxed">{debt_analysis.repayment_strategy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Goal Alignment */}
        <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="w-4 h-4 text-info" /> Goal Alignment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <ScoreRing score={goal_alignment.alignment_score} size={80} label="Alignment" />
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">{goal_alignment.analysis}</p>
                </div>
              </div>
              {goal_alignment.gaps.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Gaps to address:</p>
                  {goal_alignment.gaps.map((gap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="text-destructive mt-0.5">•</span> {gap}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendations */}
        <motion.div {...fadeUp} transition={{ delay: 0.45 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="w-4 h-4 text-accent" /> Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl border border-border bg-muted/20">
                  <span className="w-6 h-6 rounded-full bg-success/10 text-success text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {rec.priority}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rec.detail}</p>
                    <p className="text-xs text-info mt-1 leading-relaxed italic">↳ {rec.rationale}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Flags */}
        {risk_flags.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="w-4 h-4 text-destructive" /> Risk Flags</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {risk_flags.map((flag, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-xl border ${SEVERITY_STYLES[flag.severity]}`}>
                    <span className="text-lg">{SEVERITY_ICON[flag.severity]}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground">{flag.flag}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{flag.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{flag.action}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.p {...fadeUp} transition={{ delay: 0.6 }}
          className="text-[11px] text-muted-foreground text-center max-w-md mx-auto leading-relaxed pb-8">
          ⚠️ This report is for informational purposes only and does not constitute regulated financial advice.
          Always consult a qualified financial advisor before making significant financial decisions.
        </motion.p>

      </div>
    </div>
  );
};

export default Summary;
