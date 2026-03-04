import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet, PiggyBank, TrendingUp, BarChart3, Target, ShieldCheck,
  ArrowRight, ArrowLeft, CircleDollarSign, Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Wallet, title: "Your Profile", desc: "Tell us about yourself — age, location, dependants" },
  { icon: CircleDollarSign, title: "Income & Expenses", desc: "Map your earnings and spending habits" },
  { icon: Landmark, title: "Assets & Debts", desc: "Savings, investments, loans, credit cards" },
  { icon: Target, title: "Goals", desc: "Short, medium, and long-term financial goals" },
  { icon: BarChart3, title: "AI Report", desc: "Get your personalised financial health dashboard" },
];

const floatingIcons = [
  { Icon: Wallet, x: "8%", y: "18%", delay: 0, size: 22 },
  { Icon: PiggyBank, x: "88%", y: "12%", delay: 0.4, size: 26 },
  { Icon: TrendingUp, x: "78%", y: "72%", delay: 0.9, size: 20 },
  { Icon: BarChart3, x: "12%", y: "68%", delay: 1.3, size: 24 },
  { Icon: Target, x: "52%", y: "8%", delay: 0.7, size: 18 },
  { Icon: ShieldCheck, x: "92%", y: "48%", delay: 1.1, size: 20 },
];

const Welcome = () => {
  const navigate = useNavigate();
  const sessionId = crypto.randomUUID().slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {floatingIcons.map(({ Icon, x, y, delay, size }, i) => (
        <motion.div
          key={i}
          className="absolute text-success/[0.08] pointer-events-none hidden sm:block"
          style={{ left: x, top: y }}
          animate={{ y: [0, -16, 0], rotate: [0, 6, -6, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay, ease: "easeInOut" }}
        >
          <Icon style={{ width: size, height: size }} />
        </motion.div>
      ))}

      <div className="absolute w-[500px] h-[500px] rounded-full bg-success/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        <motion.button
          onClick={() => navigate("/")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="self-start mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </motion.button>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-success flex items-center justify-center mb-6 shadow-elevated"
        >
          <Wallet className="w-8 h-8 md:w-10 md:h-10 text-success-foreground" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-5xl font-bold font-heading text-foreground text-center mb-3 tracking-tight"
        >
          Finance{" "}
          <span className="bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">
            Advisor
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm md:text-base text-muted-foreground text-center max-w-md mb-10 leading-relaxed"
        >
          Get a comprehensive, AI-powered financial health check. Answer a few questions and receive personalised insights, scores, and action plans.
        </motion.p>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full mb-10"
        >
          <h2 className="text-sm font-heading font-semibold text-muted-foreground text-center mb-6 uppercase tracking-wider">
            How it works
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-card border border-border shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-success" />
                </div>
                <h3 className="text-xs font-heading font-bold text-foreground">{s.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-snug">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Button
            size="lg"
            onClick={() => navigate(`/finance-advisor/questions/${sessionId}`)}
            className="bg-success hover:bg-success/90 text-success-foreground gap-2 px-8 text-base font-heading font-bold shadow-elevated"
          >
            Start Financial Check-up <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-8 text-[11px] text-muted-foreground text-center max-w-sm leading-relaxed"
        >
          ⚠️ This tool provides general financial guidance only. It does not constitute regulated financial advice. Always consult a qualified financial advisor for important decisions.
        </motion.p>
      </div>
    </div>
  );
};

export default Welcome;
