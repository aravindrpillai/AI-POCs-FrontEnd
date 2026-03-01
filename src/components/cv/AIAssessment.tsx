import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, X } from "lucide-react";

interface AIAssessmentProps {
  value: string | null;
  onSave: (value: string | null) => void;
  readOnly?: boolean;
}

const AIAssessment = ({
  value,
  onSave,
  readOnly = false,
}: AIAssessmentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>(value ?? "");

  // Sync draft when parent value changes (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setDraft(value ?? "");
    }
  }, [value, isEditing]);

  const startEdit = () => {
    if (readOnly) return;
    setDraft(value ?? "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(value ?? "");
    setIsEditing(false);
  };

  const save = () => {
    const cleaned = draft.trim();
    onSave(cleaned.length ? cleaned : null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          AI Assessment
        </span>

        {!readOnly && (
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button type="button" onClick={save} className="text-muted-foreground hover:text-primary transition-colors" title="Save">
                  <Check className="h-4 w-4" />
                </button>
                <button type="button" onClick={cancelEdit} className="text-muted-foreground hover:text-destructive transition-colors" title="Cancel">
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button type="button" onClick={startEdit} className="text-muted-foreground hover:text-primary transition-colors" title="Edit">
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
        />
      ) : value ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {value}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No AI assessment available.
        </p>
      )}
    </div>
  );
};

export default AIAssessment;
