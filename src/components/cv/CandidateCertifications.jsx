import { useEffect, useMemo, useState } from "react";
import { Award, Pencil, Check, X, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// incoming item shape from parent (no ids required)
const toRows = (certs) =>
  (certs ?? []).map((c) => ({
    _id: makeId(),
    name: c?.name ?? "",
    issuer: c?.issuer ?? null,
    year: c?.year ?? null,
  }));

const toOutput = (rows) =>
  rows.map(({ _id, ...rest }) => rest);

const CandidateCertifications = ({
  certifications,
  onSave,
  title = "Certifications",
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => toRows(certifications ?? []));

  // Sync when parent changes, but don't overwrite while editing
  useEffect(() => {
    if (!isEditing) setDraft(toRows(certifications ?? []));
  }, [certifications, isEditing]);

  const hasAny = useMemo(
    () => (certifications ?? []).some((c) => (c?.name ?? "").trim().length > 0),
    [certifications]
  );

  const startEdit = () => {
    if (readOnly) return;
    setDraft(toRows(certifications ?? []));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(toRows(certifications ?? []));
    setIsEditing(false);
  };

  const save = () => {
    const cleaned = toOutput(draft)
      .map((c) => ({
        name: (c.name ?? "").trim(),
        issuer: c.issuer ?? null,
        year: c.year ?? null,
      }))
      // drop empty rows
      .filter((c) => c.name.length > 0);

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
      { _id: makeId(), name: "", issuer: null, year: null },
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

      <CardContent className="space-y-3">
        {isEditing ? (
          <div className="space-y-2">
            {draft.map((cert) => (
              <div key={cert._id} className="flex items-center gap-2">
                <Input
                  value={cert.name}
                  onChange={(e) => updateRow(cert._id, { name: e.target.value })}
                  className="h-8 text-sm flex-1"
                  placeholder="Certification name"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRow(cert._id)}
                  aria-label="Remove certification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 mt-1"
              onClick={addRow}
            >
              <Plus className="h-3.5 w-3.5" /> Add Certification
            </Button>
          </div>
        ) : hasAny ? (
          (certifications ?? []).map((cert, i) => (
            <div key={`${cert?.name ?? "cert"}-${i}`} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Award className="h-4 w-4 text-accent" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {(cert?.name ?? "").trim()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No certifications available.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateCertifications;
