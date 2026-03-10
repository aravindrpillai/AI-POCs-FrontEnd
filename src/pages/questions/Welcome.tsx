import { useNavigate } from "react-router-dom";
import { BookOpen, FileJson, Upload, ArrowRight, Brain, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

const floatingIcons = [
  { Icon: Brain, x: "12%", y: "18%", delay: 0, size: 20 },
  { Icon: Sparkles, x: "82%", y: "12%", delay: 0.6, size: 22 },
  { Icon: Zap, x: "78%", y: "72%", delay: 1.2, size: 18 },
  { Icon: BookOpen, x: "18%", y: "68%", delay: 0.9, size: 20 },
];

const Welcome = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          sessionStorage.setItem("exam-questions", JSON.stringify(data));
          navigate("/questions/quiz");
        }
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
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

      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-2xl">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-lg"
        >
          <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold font-heading text-foreground text-center mb-4 tracking-tight"
        >
          Exam <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Prep AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm md:text-base text-muted-foreground text-center max-w-lg mb-12 leading-relaxed"
        >
          Upload your question bank as a JSON file and the system will quiz you — shuffling questions and answers each time.
          Flag tricky questions, track your progress, and download your updated results.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg"
        >
          <button
            onClick={() => window.open("https://chatgpt.com", "_blank")}
            className="group flex flex-col items-start gap-3 p-6 rounded-2xl border border-border bg-card text-foreground shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
              <FileJson className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold">Convert Doc to JSON</h3>
              <p className="text-xs text-muted-foreground mt-1">Use ChatGPT to convert your document into the required JSON format</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-accent opacity-70 group-hover:opacity-100 transition-opacity mt-auto">
              Open ChatGPT <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="group flex flex-col items-start gap-3 p-6 rounded-2xl bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold">Load JSON & Start</h3>
              <p className="text-xs text-primary-foreground/70 mt-1">Upload your question bank JSON file and begin the quiz immediately</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity mt-auto">
              Upload file <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>

        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileLoad} />

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={() => navigate("/")}
          className="mt-10 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Home
        </motion.button>
      </div>
    </div>
  );
};

export default Welcome;
