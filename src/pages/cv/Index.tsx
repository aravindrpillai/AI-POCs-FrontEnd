import { FileText, Sparkles, Shield, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-surface)" }}>
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2 font-bold text-lg text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          Resume AI
        </div>
        <div className="flex items-center gap-2">
          <Link to="cv/search">
            <Button variant="outline" size="sm" className="gap-2">
              <Search className="h-3.5 w-3.5" /> Search
            </Button>
          </Link>
          <Link to="/uploadresume">
            <Button size="sm">Upload</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            AI-Powered Resume<br />
            <span className="text-primary">Analysis & Insights</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Upload any resume and get instant, intelligent analysis with skill mapping, experience timeline, and ranking scores.
          </p>
          <Link to="/uploadresume">
            <Button size="lg" className="gap-2 mt-2">
              Upload Resume <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3 max-w-3xl w-full">
          {[
            { icon: FileText, title: "Smart Parsing", desc: "Extract skills, experience & certifications automatically" },
            { icon: Sparkles, title: "AI Scoring", desc: "Get an intelligent ranking score with detailed reasoning" },
            { icon: Shield, title: "Private & Secure", desc: "Your data is processed securely and never shared" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl bg-card p-6 text-left" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        <a href="https://aravindpillai.com" target="blank">Aravind R Pillai </a>
      </footer>
    </div>
  );
};

export default Index;
