import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Star, Pencil, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScoreRing from "@/components/cv/ScoreRing";
import { ICandidateBase } from "@/interfaces/ICandidate";

type SelectedModel = "openai" | "ollama";

interface CandidateBasicInfoProps {
  resumeData?: ICandidateBase;
  selectedModel: SelectedModel;
  openAIData?: { ranking_score: number } | null;
  ollamaData?: { ranking_score: number } | null;

  onSaveResume: (updated: ICandidateBase) => void;
  onSaveRankingScore: (model: SelectedModel, score: number) => void;

  readOnly?: boolean;
}

const CandidateBasicInfo = ({
  resumeData,
  selectedModel,
  openAIData,
  ollamaData,
  onSaveResume,
  onSaveRankingScore,
  readOnly = false,
}: CandidateBasicInfoProps) => {

  const [isEditing, setIsEditing] = useState(false);

  // draft exists only when we have resumeData
  const [draft, setDraft] = useState<ICandidateBase | null>(resumeData ?? null);

  const [scoreDraft, setScoreDraft] = useState<number>(0);

  const activeScore = useMemo(() => {
    const score = selectedModel === "openai" ? openAIData?.ranking_score : ollamaData?.ranking_score;
    return typeof score === "number" ? score : null;
  }, [selectedModel, openAIData?.ranking_score, ollamaData?.ranking_score]);

  const initials = useMemo(() => {
    const name = (resumeData?.name ?? "").trim();
    if (!name) return "??";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 3);
  }, [resumeData?.name]);

  // Keep local state synced when NOT editing
  useEffect(() => {
    if (!isEditing) {
      setDraft(resumeData ?? null);
      setScoreDraft(activeScore ?? 0);
    }
  }, [resumeData, activeScore, isEditing]);

  const startEdit = () => {
    if (readOnly) return;
    if (!resumeData) return; // can't edit if nothing loaded
    setDraft(resumeData);
    setScoreDraft(activeScore ?? 0);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(resumeData ?? null);
    setScoreDraft(activeScore ?? 0);
    setIsEditing(false);
  };

  const save = () => {
    if (!draft) return;

    const cleaned: ICandidateBase = {
      ...draft,
      name: (draft.name ?? "").trim(),
      email: (draft.email ?? "").trim(),
      mobile: (draft.mobile ?? "").trim(),
      total_exp: Number.isFinite(draft.total_exp) ? draft.total_exp : 0,
    };

    const score = Math.max(0, Math.min(100, Number(scoreDraft) || 0));

    onSaveResume(cleaned);
    onSaveRankingScore(selectedModel, score);

    setIsEditing(false);
  };

  // Render loading/empty state safely
  if (!resumeData && !draft) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          ??
        </div>
        <p className="text-sm text-muted-foreground">Loading candidate…</p>
      </div>
    );
  }

  const display = isEditing ? draft : resumeData;

  // display can still be null only if you force edit without data (we guarded)
  if (!display) return null;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
      {/* Avatar */}
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        {initials}
      </div>

      {/* Basic details */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={display.name ?? ""}
                  onChange={(e) =>
                    setDraft((p) => (p ? { ...p, name: e.target.value } : p))
                  }
                  className="text-2xl font-bold h-auto py-1"
                  placeholder="Name"
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-primary hover:text-primary/80" onClick={save} type="button" title="Save">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={cancelEdit} type="button" title="Cancel">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {display.name}
                </h1>
                {!readOnly && (
                  <button
                    onClick={startEdit}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Edit candidate info"
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {isEditing ? (
            <>
              <Input
                value={display.email ?? ""}
                onChange={(e) =>
                  setDraft((p) => (p ? { ...p, email: e.target.value } : p))
                }
                className="w-60 h-8 text-sm"
                placeholder="Email"
              />
              <Input
                value={display.mobile ?? ""}
                onChange={(e) =>
                  setDraft((p) => (p ? { ...p, mobile: e.target.value } : p))
                }
                className="w-48 h-8 text-sm"
                placeholder="Mobile"
              />
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {display.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {display.mobile}
              </span>
            </>
          )}
        </div>

        {isEditing ? (
          <Input
            type="number"
            value={display.total_exp ?? 0}
            onChange={(e) =>
              setDraft((p) =>
                p
                  ? {
                      ...p,
                      total_exp:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    }
                  : p
              )
            }
            className="w-32 h-8 text-sm"
            min={0}
          />
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Star className="h-3.5 w-3.5" /> {display.total_exp} years experience
          </div>
        )}
      </div>

      {/* Score */}
      <div className="shrink-0 flex flex-col items-center gap-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Score:</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={scoreDraft}
              onChange={(e) =>
                setScoreDraft(e.target.value === "" ? 0 : Number(e.target.value))
              }
              className="w-20 h-8 text-sm"
            />
          </div>
        ) : activeScore === null ? (
          <p className="text-sm text-muted-foreground italic">No score</p>
        ) : (
          <ScoreRing score={activeScore} />
        )}
      </div>
    </div>
  );
};

export default CandidateBasicInfo;
