import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MessageSquare, Image, Cpu, Zap, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const floatingIcons = [
  { Icon: Cpu, x: "8%", y: "18%", delay: 0, size: 20 },
  { Icon: Brain, x: "88%", y: "22%", delay: 0.6, size: 22 },
  { Icon: Zap, x: "80%", y: "72%", delay: 1.1, size: 18 },
  { Icon: MessageSquare, x: "12%", y: "68%", delay: 1.4, size: 20 },
];

const steps = [
  { icon: "💬", title: "Start a Conversation", desc: "Type your message just like chatting with a friend" },
  { icon: "🖼️", title: "Upload Images", desc: "Attach images for the AI to analyze and discuss" },
  { icon: "🦙", title: "Ollama Powered", desc: "Runs on local Ollama models for fast, private responses" },
  { icon: "🔄", title: "Multi-turn Chat", desc: "Maintains context across your entire conversation" },
];

const OllamaWelcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {floatingIcons.map(({ Icon, x, y, delay, size }, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/[0.06] pointer-events-none hidden sm:block"
          style={{ left: x, top: y }}
          animate={{ y: [0, -16, 0], rotate: [0, 6, -6, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay, ease: "easeInOut" }}
        >
          <Icon style={{ width: size, height: size }} />
        </motion.div>
      ))}

      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/")}
          className="self-start flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </motion.button>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-elevated"
        >
          <MessageSquare className="w-8 h-8 text-primary-foreground" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold font-heading text-foreground text-center mb-3 tracking-tight"
        >
          Ollama{" "}
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Chat
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-sm md:text-base text-muted-foreground text-center max-w-md mb-10 leading-relaxed"
        >
          Have a natural conversation with an Ollama-powered AI. Upload images for analysis — just like ChatGPT.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-10"
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card shadow-card text-center"
            >
              <span className="text-2xl">{s.icon}</span>
              <h3 className="text-xs font-heading font-bold text-foreground">{s.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-snug">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button
            size="lg"
            onClick={() => navigate("/ollama/chat")}
            className="rounded-xl px-8 gap-2 shadow-elevated"
          >
            Start Chatting <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default OllamaWelcome;
