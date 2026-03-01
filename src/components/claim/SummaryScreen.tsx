import { useState } from "react";
import { AIResponseData, AttachmentFile } from "@/types/claim";
import { CheckCircle2, FileText, User, Car, MapPin, Calendar, Hash, X } from "lucide-react";
import DamageMapViewer from "./DamageMapViewer";

interface SummaryScreenProps {
  data: AIResponseData;
  attachments: AttachmentFile[];
  convId: string;
  onClose: () => void;
  onStartNew: () => void;
}

const SummaryScreen = ({ data, attachments, convId, onClose, onStartNew }: SummaryScreenProps) => {
  const [showFullResponse, setShowFullResponse] = useState(false);

  const rows = [
    { icon: <Calendar className="w-4 h-4" />, label: "Incident Date", value: data.incident_date },
    { icon: <MapPin className="w-4 h-4" />, label: "Location", value: data.incident_location || "Not provided" },
    { icon: <Car className="w-4 h-4" />, label: "Your Vehicle", value: data.vehicle_number || "Not provided" },
    { icon: <Car className="w-4 h-4" />, label: "Other Vehicle", value: data.other_vehicle_number || "Not provided" },
    { icon: <Hash className="w-4 h-4" />, label: "Police / FIR No.", value: data.police_fir_number || "Not provided" },
    { icon: <Hash className="w-4 h-4" />, label: "Policy Number", value: data.policy_number || "Not provided" },
  ];

  return (
    <>
      {/* ── Summary Modal ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
        <div
          className="relative bg-card rounded-2xl shadow-elevated w-full max-w-lg flex flex-col animate-scale-in"
          style={{ maxHeight: '90vh' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="bg-success/10 px-6 pt-8 pb-5 text-center rounded-t-2xl flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-success text-success-foreground flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-heading font-bold">FNOL Complete</h2>
            <p className="text-xs text-muted-foreground mt-1 font-mono break-all px-4">
              Ref: {convId}
            </p>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

            {/* What happened */}
            {data.what_happened && (
              <div className="p-3 rounded-xl bg-muted text-sm text-foreground leading-relaxed">
                {data.what_happened}
              </div>
            )}

            {/* Incident details */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Incident Details
              </p>
              <div className="space-y-0">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-start gap-4 py-2.5 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
                      {row.icon}
                      <span className="text-xs font-medium">{row.label}</span>
                    </div>
                    <span className="text-sm text-right font-medium max-w-[55%]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Damage Map */}
            {data.damage_map && (
              <div className="p-4 rounded-xl border border-border bg-background">
                <DamageMapViewer damageMap={data.damage_map} />
              </div>
            )}

            {/* Parties involved */}
            {data.parties_involved?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Parties Involved
                </p>
                <div className="space-y-2">
                  {data.parties_involved.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{p.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {p.role.replace(/_/g, " ")}
                        </p>
                        {p.injury && p.injury.toLowerCase() !== "none" && (
                          <p className="text-xs text-destructive mt-0.5">⚠ {p.injury}</p>
                        )}
                        {p.phone && (
                          <p className="text-xs text-muted-foreground mt-0.5">📞 {p.phone}</p>
                        )}
                        {p.email && (
                          <p className="text-xs text-muted-foreground">✉ {p.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Attachments ({attachments.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {attachments.map((a) => (
                    <div
                      key={a.id}
                      className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center"
                    >
                      {a.isImage
                        ? <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                        : <FileText className="w-5 h-5 text-muted-foreground" />
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Severity + Genuinity scores */}
            {(data.severity !== undefined || data.genuinity_score !== undefined) && (
              <div className="grid grid-cols-2 gap-3">
                {data.severity !== undefined && (
                  <div className="p-3 rounded-xl bg-muted text-center">
                    <p className="text-xs text-muted-foreground mb-1">Severity</p>
                    <p className="text-2xl font-bold">
                      {data.severity}
                      <span className="text-sm text-muted-foreground">/10</span>
                    </p>
                  </div>
                )}
                {data.genuinity_score !== undefined && (
                  <div className="p-3 rounded-xl bg-muted text-center">
                    <p className="text-xs text-muted-foreground mb-1">Genuinity</p>
                    <p className="text-2xl font-bold">
                      {data.genuinity_score}
                      <span className="text-sm text-muted-foreground">/10</span>
                    </p>
                  </div>
                )}
              </div>
            )}
            {data.genuinity_rationale && (
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {data.genuinity_rationale}
              </p>
            )}

          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-3 flex gap-3 flex-shrink-0 border-t border-border">
            <button
              onClick={() => setShowFullResponse(true)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              View Full Response
            </button>
            <button
              onClick={onStartNew}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start New Claim
            </button>
          </div>
        </div>
      </div>

      {/* ── Full Response Modal ──────────────────────────────────────────── */}
      {showFullResponse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={() => setShowFullResponse(false)}
          />
          <div
            className="relative bg-card rounded-2xl shadow-elevated w-full max-w-2xl flex flex-col animate-scale-in"
            style={{ maxHeight: '90vh' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <h3 className="text-base font-heading font-semibold">Full FNOL Response</h3>
              <button
                onClick={() => setShowFullResponse(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <pre className="text-xs bg-muted rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
            <div className="px-6 pb-5 pt-3 flex-shrink-0 border-t border-border">
              <button
                onClick={() => setShowFullResponse(false)}
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SummaryScreen;