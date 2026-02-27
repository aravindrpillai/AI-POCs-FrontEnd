import { useState } from "react";
import { AttachmentFile } from "@/types/claim";
import { FileText, Trash2, X, Check, PenLine } from "lucide-react";

interface AttachmentCardProps {
  attachment: AttachmentFile;
  onDelete: (id: string) => void;
  onNoteChange?: (id: string, note: string) => void;
  compact?: boolean;
  autoShowNote?: boolean;
}

const AttachmentCard = ({ attachment, onDelete, onNoteChange, compact, autoShowNote = false }: AttachmentCardProps) => {
  const [isEditingNote, setIsEditingNote] = useState(autoShowNote && !attachment.note);
  const [noteText, setNoteText] = useState(attachment.note || "");

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const saveNote = () => {
    onNoteChange?.(attachment.id, noteText.trim());
    setIsEditingNote(false);
  };

  const dismissNote = () => {
    setNoteText("");
    setIsEditingNote(false);
  };

  const noteEditor = (small?: boolean) => (
    <div className={`flex items-center gap-${small ? '1' : '2'}`}>
      <input
        type="text"
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") saveNote();
          if (e.key === "Escape") dismissNote();
        }}
        placeholder="Describe this file (optional)…"
        className={`flex-1 ${small ? 'text-[11px] px-2 py-1 rounded-md' : 'text-xs px-3 py-1.5 rounded-lg'} border border-input bg-background focus:outline-none focus:ring-${small ? '1' : '2'} focus:ring-ring/20`}
        autoFocus
      />
      {noteText.trim() && (
        <button onClick={saveNote} className={`${small ? 'p-1' : 'p-1.5'} rounded-lg hover:bg-success/10 text-success`}>
          <Check className={`${small ? 'w-3 h-3' : 'w-4 h-4'}`} />
        </button>
      )}
      <button onClick={dismissNote} className={`${small ? 'p-1' : 'p-1.5'} rounded-lg hover:bg-muted text-muted-foreground`}>
        <X className={`${small ? 'w-3 h-3' : 'w-4 h-4'}`} />
      </button>
    </div>
  );

  const savedNote = attachment.note && !isEditingNote ? (
    <p
      className="text-xs text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors"
      onClick={() => setIsEditingNote(true)}
    >
      📝 {attachment.note}
    </p>
  ) : null;

  if (compact) {
    return (
      <div className="space-y-1">
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
          <div className="flex items-center gap-1">
            {!isEditingNote && !attachment.note && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="p-1 rounded hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
                title="Add description"
              >
                <PenLine className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => onDelete(attachment.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="pl-10">
          {isEditingNote ? noteEditor(true) : savedNote}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card border border-border group">
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
        {!isEditingNote && !attachment.note && (
          <button
            onClick={() => setIsEditingNote(true)}
            className="p-2 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
            title="Add description"
          >
            <PenLine className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(attachment.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-destructive/10 text-destructive"
          aria-label="Delete attachment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="pl-4">
        {isEditingNote ? noteEditor() : savedNote}
      </div>
    </div>
  );
};

export default AttachmentCard;
