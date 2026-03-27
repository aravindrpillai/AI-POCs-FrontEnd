import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const Prompt = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(() => localStorage.getItem("claims-ai-prompt") || "");

  const handleSave = () => {
    localStorage.setItem("claims-ai-prompt", prompt);
    toast({ title: "Saved", description: "AI prompt has been saved successfully." });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => navigate("/claims")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Claims
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1.5" /> Save
          </Button>
          <Button size="sm" onClick={() => navigate("/claim/new")}>
            Start New Claim
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 md:px-8 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2">AI Prompt</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Configure the system prompt used by the Claims AI assistant.
        </p>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the AI system prompt here..."
          className="flex-1 w-full min-h-[400px] md:min-h-[500px] text-sm font-mono resize-y"
        />
      </main>
    </div>
  );
};

export default Prompt;
