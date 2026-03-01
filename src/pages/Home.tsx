import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, Sparkles } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-elevated">
        <Sparkles className="w-7 h-7 text-primary-foreground" />
      </div>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground text-center mb-3">
        AI-Powered Assistants
      </h1>

      {/* Note */}
      <p className="text-sm md:text-base text-muted-foreground text-center max-w-md mb-10 leading-relaxed">
        This is my playground where I experiment with AI models like Claude, OpenAI and Ollama. Choose a tool below to get started — more coming soon.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-md">
        <button
          onClick={() => navigate("/claim/new")}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-card hover:opacity-90 transition-opacity"
        >
          <ShieldCheck className="w-5 h-5" />
          Claims AI
        </button>
        <button
          onClick={() => navigate("/resume")}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-border bg-card text-foreground font-semibold text-sm shadow-card hover:bg-muted transition-colors"
        >
          <FileText className="w-5 h-5" />
          Resume AI
        </button>
      </div>

      {/* Credits */}
      <p className="mt-16 text-xs text-muted-foreground">
        Developed by{" "}
        <a
          href="https://aravindpillai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:text-primary underline underline-offset-2 transition-colors"
        >
          Aravind
        </a>
      </p>
    </div>
  );
};

export default Home;
