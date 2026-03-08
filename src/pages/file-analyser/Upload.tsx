import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload as UploadIcon, FileText, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileAnalyserUpload = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: UploadedFile[] = Array.from(incoming).map((f) => ({
      file: f,
      id: crypto.randomUUID(),
      progress: 0,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const simulateUpload = async () => {
    if (files.length === 0) {
      toast({ title: "No files selected", description: "Please add at least one file.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const fileId = files[i].id;
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" } : f))
      );

      // Simulate upload with progress
      for (let p = 0; p <= 100; p += 10) {
        await new Promise((r) => setTimeout(r, 80 + Math.random() * 120));
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress: p } : f))
        );
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "done", progress: 100 } : f))
      );
    }

    setIsUploading(false);
    setAllDone(true);

    // Navigate to chat after a brief pause
    setTimeout(() => {
      const sessionId = crypto.randomUUID().slice(0, 8);
      navigate(`/file-analyser/chat/${sessionId}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-xl w-full">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/file-analyser")}
          className="self-start flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold font-heading text-foreground text-center mb-2 tracking-tight"
        >
          Upload Your Files
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-muted-foreground text-center mb-8"
        >
          Add one or more documents to analyse. Supported: PDF, TXT, DOCX, CSV and more.
        </motion.p>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border hover:border-accent rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer bg-card/60 transition-colors mb-6"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <UploadIcon className="w-6 h-6 text-accent" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Drag & drop files here or <span className="text-accent">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">Any file type supported</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </motion.div>

        {/* File list */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="w-full space-y-2 mb-6"
            >
              {files.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {f.status === "done" ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{f.file.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatSize(f.file.size)}</p>
                    {f.status === "uploading" && (
                      <Progress value={f.progress} className="h-1.5 mt-1" />
                    )}
                  </div>
                  {f.status === "pending" && !isUploading && (
                    <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {f.status === "done" && (
                    <span className="text-[11px] text-success font-medium">Done</span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Button
            size="lg"
            onClick={simulateUpload}
            disabled={files.length === 0 || isUploading || allDone}
            className="rounded-xl px-8 gap-2 shadow-elevated"
          >
            {isUploading
              ? "Uploading..."
              : allDone
                ? "Redirecting..."
                : `Upload ${files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""}` : ""}`}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default FileAnalyserUpload;
