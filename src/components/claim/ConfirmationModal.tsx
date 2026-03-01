import { ClaimData, AttachmentFile } from "@/types/claim";
import { CheckCircle2, Download, FileText, X } from "lucide-react";

interface ConfirmationModalProps {
  claimData: ClaimData;
  attachments: AttachmentFile[];
  referenceId: string;
  onClose: () => void;
}

const ConfirmationModal = ({ claimData, attachments, referenceId, onClose }: ConfirmationModalProps) => {
  const description = claimData.what_happened || "";
  const summaryItems = [
    { label: "Date", value: claimData.incident_date || "Not specified" },
    { label: "Location", value: claimData.incident_location || "Not specified" },
    { label: "Description", value: description.length > 80 ? description.slice(0, 80) + '…' : (description || "Not specified") },
    { label: "Attachments", value: `${attachments.length} file(s)` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-elevated w-full max-w-lg animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative bg-success/10 px-6 pt-8 pb-6 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-full bg-success text-success-foreground flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-heading font-bold">Claim Submitted</h2>
          <p className="text-sm text-muted-foreground mt-1">Reference: <span className="font-mono font-semibold text-foreground">{referenceId}</span></p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex justify-between items-start gap-4 py-2 border-b border-border last:border-0">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</span>
              <span className="text-sm text-right font-medium max-w-[60%]">{item.value}</span>
            </div>
          ))}

          {attachments.length > 0 && (
            <div className="flex gap-2 pt-2 overflow-x-auto">
              {attachments.map((a) => (
                <div key={a.id} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                  {a.isImage ? (
                    <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50"
          >
            <Download className="w-4 h-4" />
            Download Summary
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
