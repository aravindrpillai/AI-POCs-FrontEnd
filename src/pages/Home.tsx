import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, Sparkles, ArrowRight, Cpu, Brain, Zap, Github, ExternalLink, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

const floatingIcons = [
  { Icon: Cpu, x: "10%", y: "20%", delay: 0, size: 20 },
  { Icon: Brain, x: "85%", y: "15%", delay: 0.5, size: 24 },
  { Icon: Zap, x: "75%", y: "75%", delay: 1, size: 18 },
  { Icon: Sparkles, x: "15%", y: "70%", delay: 1.5, size: 22 },
  { Icon: Cpu, x: "50%", y: "10%", delay: 0.8, size: 16 },
  { Icon: Brain, x: "90%", y: "50%", delay: 1.2, size: 20 },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Floating background icons */}
      {floatingIcons.map(({ Icon, x, y, delay, size }, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/[0.06] pointer-events-none hidden sm:block"
          style={{ left: x, top: y }}
          animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay, ease: "easeInOut" }}
        >
          <Icon style={{ width: size, height: size }} />
        </motion.div>
      ))}

      {/* Glow orb */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-elevated"
        >
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground text-center mb-4 tracking-tight"
        >
          AI-Powered{" "}
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Playground
          </span>
        </motion.h1>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-sm md:text-base lg:text-lg text-muted-foreground text-center max-w-lg mb-12 leading-relaxed"
        >
          This is my playground where I experiment with AI models like{" "}
          <span className="font-semibold text-foreground">Claude</span>,{" "}
          <span className="font-semibold text-foreground">OpenAI</span> and{" "}
          <span className="font-semibold text-foreground">Ollama</span>.
          Choose a tool below to get started — more coming soon.
        </motion.p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full max-w-2xl">
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/claim/new")}
            className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl bg-primary text-primary-foreground shadow-card overflow-hidden text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 opacity-100" />
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary-foreground/[0.08]" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 flex items-center justify-center mb-1">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-heading font-bold">Claims AI</h2>
              <p className="text-xs text-primary-foreground/70 mt-1 leading-relaxed">
                File insurance claims with an intelligent assistant
              </p>
            </div>
            <div className="relative flex items-center gap-1.5 text-xs font-medium mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
              Get started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/cv/uploadresume")}
            className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl border border-border bg-card text-foreground shadow-card overflow-hidden text-left"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-accent/[0.06]" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-1">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-lg font-heading font-bold">Resume AI</h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Build & enhance your resume with AI power
              </p>
            </div>
            <div className="relative flex items-center gap-1.5 text-xs font-medium text-accent mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/med-ai")}
            className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl border border-border bg-card text-foreground shadow-card overflow-hidden text-left"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-info/[0.08]" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-info/10 flex items-center justify-center mb-1">
                <Stethoscope className="w-5 h-5 text-info" />
              </div>
              <h2 className="text-lg font-heading font-bold">Med AI</h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                AI-powered medical diagnostics & health insights
              </p>
            </div>
            <div className="relative flex items-center gap-1.5 text-xs font-medium text-info mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        </div>

        {/* GitHub */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-14 flex flex-col items-center gap-2"
        >
          <p className="text-xs text-muted-foreground">Interested to see my GitHub repository?</p>
          <a
            href="https://github.com/aravindrpillai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted shadow-card transition-colors"
          >
            <Github className="w-4 h-4" />
            github.com/aravindrpillai
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        </motion.div>

        {/* Credits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="mt-10 mb-6 flex flex-col items-center gap-1"
        >
          <p className="text-sm font-heading font-bold text-foreground">
            Developed by Aravind
          </p>
          <a
            href="https://aravindpillai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          >
            aravindpillai.com <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
