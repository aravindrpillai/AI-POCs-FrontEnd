import { AttachmentFile } from "@/types/claim";
import { FileText, Image, Trash2, X } from "lucide-react";

interface AttachmentCardProps {
  attachment: AttachmentFile;
  onDelete: (id: string) => void;
  compact?: boolean;
}

const AttachmentCard = ({ attachment, onDelete, compact }: AttachmentCardProps) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted group hover:bg-secondary transition-colors">
        {attachment.isImage ? (
          <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
            <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded bg-info/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-info" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{attachment.name}</p>
          <p className="text-[10px] text-muted-foreground">{formatSize(attachment.size)}</p>
        </div>
        <button
          onClick={() => onDelete(attachment.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-destructive"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card border border-border animate-fade-in group">
      {attachment.isImage ? (
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-info" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">{formatSize(attachment.size)}</p>
      </div>
      <button
        onClick={() => onDelete(attachment.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-destructive/10 text-destructive"
        aria-label="Delete attachment"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AttachmentCard;
