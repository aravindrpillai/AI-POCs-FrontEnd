import { Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { ICandidateBase, ICandidate_LLM_Data } from "@/interfaces/ICandidate";


export interface ICandidateListItem {
  candidate: ICandidateBase,
  isSelected: boolean,
  onClick: () => void;
}


const CandidateListItem = ({ candidate, isSelected, onClick }: ICandidateListItem) => {

  const [selectedLLMData, setSelectedLLMData] = useState<ICandidate_LLM_Data | null>(null);

  useEffect(() => {
    setSelectedLLMData(candidate.openai ?? candidate.ollama ?? null);
  }, [candidate]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-score-high bg-score-high/10";
    if (score >= 40) return "text-score-medium bg-score-medium/10";
    return "text-score-low bg-score-low/10";
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-4 transition-all border ${isSelected
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-transparent bg-card hover:bg-secondary/50"
        }`}
      style={{ boxShadow: isSelected ? undefined : "var(--shadow-card)" }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          {candidate.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-foreground truncate">{candidate.name}</h4>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${getScoreColor(60)}`}
            >
              {60}
            </span>
          </div>
          <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{candidate.mobile}</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedLLMData?.skills?.slice(0, 3).map((s) => (
              <span key={s.name} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                {s.name}
              </span>
            ))}
            {selectedLLMData?.skills?.length > 3 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                +{selectedLLMData?.skills?.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default CandidateListItem;
