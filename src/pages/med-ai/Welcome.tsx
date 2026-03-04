import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, ArrowRight, Activity, Brain, Heart, Eye, Bone, ArrowLeft } from "lucide-react";

const steps = [
  { icon: "🩺", title: "Choose Category", desc: "Pick your medical specialty — Ortho, Neuro, ENT and more." },
  { icon: "📝", title: "Describe Symptoms", desc: "Tell the AI about your health concern in your own words." },
  { icon: "📎", title: "Attach Reports", desc: "Upload lab reports, scans or photos for better accuracy." },
  { icon: "🤖", title: "AI Follow-ups", desc: "The AI asks targeted questions to understand your condition." },
  { icon: "📋", title: "Get Report", desc: "Receive a detailed diagnosis report with suggestions." },
];

const floatingIcons = [
  { Icon: Activity, x: "8%", y: "18%" },
  { Icon: Brain, x: "88%", y: "12%" },
  { Icon: Heart, x: "80%", y: "72%" },
  { Icon: Eye, x: "12%", y: "68%" },
  { Icon: Bone, x: "55%", y: "8%" },
];

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 relative overflow-hidden">
      {/* Floating icons */}
      {floatingIcons.map(({ Icon, x, y }, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/[0.05] pointer-events-none hidden md:block"
          style={{ left: x, top: y }}
          animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon style={{ width: 28, height: 28 }} />
        </motion.div>
      ))}

      {/* Glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-info/[0.04] blur-[120px] pointer-events-none top-1/3" />

      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" /> Home
      </motion.button>

      <div className="relative z-10 flex flex-col items-center max-w-3xl w-full">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-18 h-18 md:w-20 md:h-20 rounded-2xl bg-info flex items-center justify-center mb-8 shadow-elevated"
        >
          <Stethoscope className="w-9 h-9 md:w-10 md:h-10 text-info-foreground" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-5xl font-bold font-heading text-foreground text-center mb-4 tracking-tight"
        >
          Medical AI{" "}
          <span className="bg-gradient-to-r from-info via-accent to-info bg-clip-text text-transparent">
            Diagnostics
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm md:text-base text-muted-foreground text-center max-w-lg mb-14 leading-relaxed"
        >
          Get AI-powered preliminary health insights. Describe your symptoms, upload reports,
          and receive an intelligent diagnosis suggestion.
        </motion.p>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full mb-14"
        >
          <h2 className="text-lg font-heading font-bold text-center mb-8 text-foreground">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex flex-col items-center text-center p-4 rounded-2xl bg-card border border-border shadow-card"
              >
                <span className="text-2xl mb-3">{step.icon}</span>
                <h3 className="text-sm font-heading font-semibold mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, type: "spring" }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/med-ai/diagnose")}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-info text-info-foreground font-heading font-bold text-base shadow-elevated hover:shadow-lg transition-shadow"
        >
          Start Diagnosis
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-[11px] text-muted-foreground text-center max-w-md leading-relaxed"
        >
          ⚠️ This tool provides AI-generated suggestions only and is not a substitute for professional medical advice.
          Always consult a qualified healthcare provider.
        </motion.p>
      </div>
    </div>
  );
};

export default Welcome;
