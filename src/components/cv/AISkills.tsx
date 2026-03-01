import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import SkillBadge from "@/components/cv/SkillBadge";

type SkillInput = { name: string; years: number | null };

// internal row type with stable id
type SkillRow = SkillInput & { _id: string };

interface AISkillsProps {
  skills: SkillInput[];                 // incoming from parent (no ids needed)
  onSave: (skills: SkillInput[]) => void; // called only when user clicks Save
  readOnly?: boolean;                   // optional: if you want to disable editing
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// normalize incoming skills into rows with stable ids
const toRows = (skills: SkillInput[]): SkillRow[] =>
  (skills ?? []).map((s) => ({
    _id: makeId(),
    name: s?.name ?? "",
    years: s?.years ?? null,
  }));

// strip ids before sending to parent
const toOutput = (rows: SkillRow[]): SkillInput[] =>
  rows.map(({ _id, ...rest }) => rest);

const AISkills = ({ skills, onSave, readOnly = false }: AISkillsProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // draft state lives here so inputs don't lose focus and parent isn't spammed
  const [draft, setDraft] = useState<SkillRow[]>(() => toRows(skills ?? []));

  // If parent skills change while NOT editing, refresh the draft.
  // If editing, we do NOT override what the user is typing.
  useEffect(() => {
    if (!isEditing) setDraft(toRows(skills ?? []));
  }, [skills, isEditing]);

  const hasSkills = useMemo(() => (skills ?? []).some((s) => (s.name ?? "").trim() !== ""), [skills]);

  const updateRow = (_id: string, patch: Partial<SkillInput>) => {
    setDraft((prev) => prev.map((r) => (r._id === _id ? { ...r, ...patch } : r)));
  };

  const removeRow = (_id: string) => {
    setDraft((prev) => prev.filter((r) => r._id !== _id));
  };

  const addRow = () => {
    setDraft((prev) => [...prev, { _id: makeId(), name: "", years: null }]);
  };

  const startEdit = () => {
    if (readOnly) return;
    setIsEditing(true);
    setDraft(toRows(skills ?? [])); // fresh snapshot when entering edit
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(toRows(skills ?? [])); // revert draft
  };

  const save = () => {
    const cleaned = toOutput(draft)
      .map((s) => ({
        name: (s.name ?? "").trim(),
        years: s.years,
      }))
      // optional: drop empty rows
      .filter((s) => s.name.length > 0);

    onSave(cleaned);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Skills</CardTitle>

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
          <div className="space-y-2">
            {draft.map((row) => (
              <div key={row._id} className="flex items-center gap-2">
                <Input
                  value={row.name}
                  onChange={(e) => updateRow(row._id, { name: e.target.value })}
                  className="h-8 text-sm flex-1"
                  placeholder="Skill"
                />

                <Input
                  type="number"
                  placeholder="yrs"
                  value={row.years ?? ""}
                  onChange={(e) =>
                    updateRow(row._id, {
                      years: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="h-8 text-sm w-16"
                  min={0}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRow(row._id)}
                  aria-label="Remove skill"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" className="gap-1 mt-1" onClick={addRow}>
              <Plus className="h-3.5 w-3.5" />
              Add Skill
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {hasSkills ? (
              (skills ?? []).map((s, i) => (
                <SkillBadge key={`${s.name}-${i}`} name={s.name} years={s.years} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No skills available.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISkills;
