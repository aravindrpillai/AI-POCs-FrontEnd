import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PromptEntry {
  uid: string;
  name: string;
  prompt: string;
  active: number; // 0 | 1
  updated_on: string;
  created_on: string;
}

// ── Config ─────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const PROMPTS_URL = `${BASE_URL}/claims/prompts/`;

// ── Helpers ────────────────────────────────────────────────────────────────────

const getAuthHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  // Add auth token here if needed, e.g.:
  // Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Component ──────────────────────────────────────────────────────────────────

const Prompt = () => {
  const navigate = useNavigate();

  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(false);

  // Separate loading states
  const [listLoading, setListLoading] = useState(true);   // initial list fetch
  const [detailLoading, setDetailLoading] = useState(false); // per-prompt fetch
  const [saving, setSaving] = useState(false);            // save / create

  // ── API calls ────────────────────────────────────────────────────────────────

  /** Fetch all prompts and auto-select the active one (or first). */
  const fetchPrompts = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch(PROMPTS_URL, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Failed to load prompts (${res.status})`);
      const json = await res.json();
      if (!json.status) throw new Error("Server returned status=false");

      const data: PromptEntry[] = json.data ?? [];
      setPrompts(data);

      // Select active prompt first, otherwise first item
      const active = data.find((p) => p.active === 1) ?? data[0];
      if (active) {
        setSelectedId(active.uid);
        setName(active.name);
        setContent(active.prompt);
        setIsActive(active.active === 1);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message ?? "Could not load prompts.", variant: "destructive" });
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);

  /** Fetch a single prompt by uid. */
  const fetchPromptById = useCallback(async (uid: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${PROMPTS_URL}${uid}/`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Failed to fetch prompt (${res.status})`);
      const json = await res.json();
      if (!json.status) throw new Error("Server returned status=false");

      const data: PromptEntry = json.data;
      setSelectedId(data.uid);
      setName(data.name);
      setContent(data.prompt);
      setIsActive(data.active === 1);
    } catch (err: any) {
      toast({ title: "Error", description: err.message ?? "Could not load prompt.", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /** Validate then POST (new) or PUT (existing). */
  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Validation Error", description: "Prompt name is required.", variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: "Validation Error", description: "Prompt content cannot be empty.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const body = JSON.stringify({ active: isActive, name: name.trim(), prompt: content.trim() });

    try {
      const isNew = !selectedId || selectedId === "NEW";
      const url = isNew ? PROMPTS_URL : `${PROMPTS_URL}${selectedId}/`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, { method, headers: getAuthHeaders(), body });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const json = await res.json();
      if (!json.status) throw new Error(json.message ?? "Server returned status=false");

      const saved: PromptEntry = json.data;
      toast({ title: "Saved", description: json.message ?? "Prompt saved successfully." });

      // Refresh list and re-select the saved entry
      const listRes = await fetch(PROMPTS_URL, { headers: getAuthHeaders() });
      const listJson = await listRes.json();
      const updated: PromptEntry[] = listJson.data ?? [];
      setPrompts(updated);
      setSelectedId(saved.uid);
      setName(saved.name);
      setContent(saved.prompt);
      setIsActive(saved.active === 1);
    } catch (err: any) {
      toast({ title: "Error", description: err.message ?? "Could not save prompt.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  /** Create a blank local "NEW" placeholder then user fills & saves. */
  const handleNew = () => {
    setSelectedId("NEW");
    setName("New Prompt");
    setContent("");
    setIsActive(false);
  };

  const handleSelect = (uid: string) => {
    if (uid === selectedId) return;
    fetchPromptById(uid);
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const isBusy = saving || detailLoading; // backdrop active when true

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col relative">

      {/* ── Full-screen loading backdrop ─────────────────────────────────────── */}
      {isBusy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              {saving ? "Saving prompt…" : "Loading prompt…"}
            </span>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-border px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => navigate("/claims")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Claims
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Prompt selector */}
          <Select value={selectedId} onValueChange={handleSelect} disabled={listLoading || isBusy}>
            <SelectTrigger className="w-[220px] bg-card">
              <SelectValue placeholder={listLoading ? "Loading…" : "Select a prompt"} />
            </SelectTrigger>
            <SelectContent>
              {prompts.map((p) => (
                <SelectItem key={p.uid} value={p.uid}>
                  <span className="flex items-center gap-2">
                    {p.name}
                    {p.active === 1 && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Name input */}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prompt name *"
            className="w-[180px] bg-card"
            disabled={isBusy}
          />

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="active-toggle"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isBusy}
            />
            <Label htmlFor="active-toggle" className="text-sm text-muted-foreground whitespace-nowrap">
              Active
            </Label>
          </div>

          <Button variant="outline" size="sm" onClick={handleNew} disabled={isBusy}>
            + New
          </Button>

          <Button variant="outline" size="sm" onClick={handleSave} disabled={isBusy}>
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4 mr-1.5" /> Save</>
            )}
          </Button>

          <Button size="sm" onClick={() => navigate("/claim/new")} disabled={isBusy}>
            Start New Claim
          </Button>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-8 py-8 w-full">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2">AI Prompt</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Configure the system prompt used by the Claims AI assistant.
        </p>

        <div className="w-full md:w-[80%] flex-1 flex flex-col min-h-0">
          {listLoading ? (
            <div className="flex-1 flex flex-col gap-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="flex-1 min-h-[400px] w-full" />
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the AI system prompt here… *"
              className="flex-1 w-full min-h-[400px] md:min-h-[500px] text-sm font-mono resize-none overflow-y-auto bg-white dark:bg-white/95 text-foreground"
              disabled={isBusy}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Prompt;
