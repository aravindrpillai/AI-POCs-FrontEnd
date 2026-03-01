import { useEffect, useMemo, useState } from "react";
import { Pencil, Check, X, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import ExperienceCard from "@/components/cv/ExperienceCard";

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// parent input shape (no ids required)
const toRows = (exps) =>
  (exps ?? []).map((e) => ({
    _id: makeId(),
    company: e?.company ?? "",
    role: e?.role ?? "",
    start: e?.start ?? "",
    end: e?.end ?? "",
    highlights: Array.isArray(e?.highlights) ? e.highlights : [],
  }));

const toOutput = (rows) =>
  rows.map(({ _id, ...rest }) => rest);

const CandidateExperience = ({
  experiences,
  onSave,
  title = "Experience",
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => toRows(experiences ?? []));

  // sync when parent changes, but don't overwrite while editing
  useEffect(() => {
    if (!isEditing) setDraft(toRows(experiences ?? []));
  }, [experiences, isEditing]);

  const hasAny = useMemo(() => {
    return (experiences ?? []).some(
      (e) =>
        (e?.company ?? "").trim() ||
        (e?.role ?? "").trim() ||
        (e?.highlights ?? []).length > 0
    );
  }, [experiences]);

  const startEdit = () => {
    if (readOnly) return;
    setDraft(toRows(experiences ?? []));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(toRows(experiences ?? []));
    setIsEditing(false);
  };

  const save = () => {
    const cleaned = toOutput(draft)
      .map((e) => ({
        company: (e.company ?? "").trim(),
        role: (e.role ?? "").trim(),
        start: (e.start ?? "").trim(),
        end: (e.end ?? "").trim(),
        highlights: Array.isArray(e.highlights)
          ? e.highlights.map((h) => (h ?? "").trim()).filter(Boolean)
          : [],
      }))
      // optional: drop totally empty rows
      .filter(
        (e) =>
          e.company ||
          e.role ||
          e.start ||
          e.end ||
          (e.highlights?.length ?? 0) > 0
      );

    onSave(cleaned);
    setIsEditing(false);
  };

  const updateRow = (_id, patch) => {
    setDraft((prev) => prev.map((r) => (r._id === _id ? { ...r, ...patch } : r)));
  };

  const removeRow = (_id) => {
    setDraft((prev) => prev.filter((r) => r._id !== _id));
  };

  const addRow = () => {
    setDraft((prev) => [
      ...prev,
      { _id: makeId(), company: "", role: "", start: "", end: "", highlights: [] },
    ]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>

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
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {draft.map((exp) => (
              <div key={exp._id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Role"
                    value={exp.role}
                    onChange={(e) => updateRow(exp._id, { role: e.target.value })}
                    className="h-8 text-sm flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(exp._id)}
                    aria-label="Remove experience"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => updateRow(exp._id, { company: e.target.value })}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Start"
                    value={exp.start}
                    onChange={(e) => updateRow(exp._id, { start: e.target.value })}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="End"
                    value={exp.end}
                    onChange={(e) => updateRow(exp._id, { end: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>

                <Textarea
                  placeholder="Highlights (one per line)"
                  value={(exp.highlights ?? []).join("\n")}
                  onChange={(e) =>
                    updateRow(exp._id, {
                      highlights: e.target.value
                        .split("\n")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={2}
                  className="text-sm"
                />
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addRow}>
              <Plus className="h-3.5 w-3.5" /> Add Experience
            </Button>
          </div>
        ) : hasAny ? (
          (experiences ?? []).map((exp, i) => (
            <ExperienceCard key={`${exp?.company ?? "exp"}-${exp?.start ?? ""}-${i}`} {...exp} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">No experience available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateExperience;
