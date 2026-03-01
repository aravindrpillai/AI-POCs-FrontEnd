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
        Streamline your workflows with intelligent AI agents. Choose a tool below to get started — more coming soon.
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
    </div>
  );
};

export default Home;
