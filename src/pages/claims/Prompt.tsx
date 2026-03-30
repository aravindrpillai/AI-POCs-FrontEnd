import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface PromptEntry {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
}

const STORAGE_KEY = "claims-ai-prompts";

const getPrompts = (): PromptEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // migrate legacy single prompt
  const legacy = localStorage.getItem("claims-ai-prompt");
  const initial: PromptEntry[] = [
    { id: crypto.randomUUID(), name: "Default Prompt", content: legacy || "", isDefault: true },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const savePrompts = (prompts: PromptEntry[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));

const Prompt = () => {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(true);

  const simulateLoad = useCallback((cb: () => void) => {
    setLoading(true);
    setTimeout(() => { cb(); setLoading(false); }, 600);
  }, []);

  useEffect(() => {
    simulateLoad(() => {
      const all = getPrompts();
      setPrompts(all);
      const def = all.find((p) => p.isDefault) || all[0];
      if (def) { setSelectedId(def.id); setName(def.name); setContent(def.content); setIsDefault(def.isDefault); }
    });
  }, [simulateLoad]);

  const handleSelect = (id: string) => {
    simulateLoad(() => {
      const found = prompts.find((p) => p.id === id);
      if (found) { setSelectedId(found.id); setName(found.name); setContent(found.content); setIsDefault(found.isDefault); }
    });
  };

  const handleSave = () => {
    let updated = prompts.map((p) =>
      p.id === selectedId
        ? { ...p, name, content, isDefault }
        : isDefault ? { ...p, isDefault: false } : p
    );
    // ensure at least one default
    if (!updated.some((p) => p.isDefault) && updated.length) updated[0].isDefault = true;
    setPrompts(updated);
    savePrompts(updated);
    toast({ title: "Saved", description: "Prompt has been saved successfully." });
  };

  const handleNew = () => {
    const entry: PromptEntry = { id: crypto.randomUUID(), name: "New Prompt", content: "", isDefault: false };
    const updated = [...prompts, entry];
    setPrompts(updated);
    savePrompts(updated);
    setSelectedId(entry.id);
    setName(entry.name);
    setContent(entry.content);
    setIsDefault(entry.isDefault);
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

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedId} onValueChange={handleSelect}>
            <SelectTrigger className="w-[220px] bg-card">
              <SelectValue placeholder="Select a prompt" />
            </SelectTrigger>
            <SelectContent>
              {prompts.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    {p.name}
                    {p.isDefault && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prompt name"
            className="w-[180px] bg-card"
          />

          <div className="flex items-center gap-2">
            <Switch id="default-toggle" checked={isDefault} onCheckedChange={setIsDefault} />
            <Label htmlFor="default-toggle" className="text-sm text-muted-foreground whitespace-nowrap">Default</Label>
          </div>

          <Button variant="outline" size="sm" onClick={handleNew}>+ New</Button>

          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1.5" /> Save
          </Button>
          <Button size="sm" onClick={() => navigate("/claim/new")}>Start New Claim</Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 md:px-8 py-8 w-full">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2">AI Prompt</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Configure the system prompt used by the Claims AI assistant.
        </p>
        <div className="w-full md:w-[80%] flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex flex-col gap-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="flex-1 min-h-[400px] w-full" />
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the AI system prompt here..."
              className="flex-1 w-full min-h-[400px] md:min-h-[500px] text-sm font-mono resize-none overflow-y-auto bg-white dark:bg-white/95 text-foreground"
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Prompt;
