import { useRef, useState } from "react";
import { Upload, FileText, ArrowLeft, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LLMModelModal from "@/components/cv/LLMModelModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type UploadPhase = "idle" | "uploading" | "processing";

const UploadResume = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [llmModalOpen, setLlmModalOpen] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState<number>(0);
  const [showProgress, setShowProgress] = useState(false);
  const [phase, setPhase] = useState<UploadPhase>("idle");

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.onload = () => {
        const res = String(reader.result || "");
        const base64 = res.includes(",") ? res.split(",")[1] : res;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });

  const onPickFile = (file: File | null) => {
    setErrorMsg(null);
    if (!file) return;

    // Basic size guard (10MB)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setSelectedFile(null);
      setErrorMsg("File too large. Max 10MB.");
      return;
    }

    // Basic type/extension guard
    const allowedExt = [".pdf", ".doc", ".docx"];
    const lower = file.name.toLowerCase();
    if (!allowedExt.some((e) => lower.endsWith(e))) {
      setSelectedFile(null);
      setErrorMsg("Unsupported file type. Use PDF, DOC, or DOCX.");
      return;
    }

    setSelectedFile(file);
  };

  const handleCardClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0] ?? null;
    onPickFile(file);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const resetProgressUi = () => {
    setShowProgress(false);
    setUploadPct(0);
    setPhase("idle");
  };

  const handleLlmConfirm = async (model: string, passcode?: string) => {
    setErrorMsg(null);

    if (!selectedFile) return setErrorMsg("No file selected.");
    if (!model) return setErrorMsg("No model selected.");
    if (!passcode) return setErrorMsg("Passcode is required.");

    // Close modal immediately
    setLlmModalOpen(false);

    try {
      setIsUploading(true);
      setShowProgress(true);
      setUploadPct(0);
      setPhase("uploading");

      const file_base64 = await fileToBase64(selectedFile);

      const payload = {
        filename: selectedFile.name,
        llm_model: model,
        passkey: passcode,
        file_base64,
      };

      const candidateId = await new Promise<number>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${import.meta.env.VITE_API_BASE_URL}/cv/candidate/upload/`, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        let switchedToProcessing = false;

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const pct = Math.round((event.loaded / event.total) * 100);
          setUploadPct(pct);

          // Upload body fully sent -> now backend is processing
          if (pct >= 100 && !switchedToProcessing) {
            switchedToProcessing = true;
            setPhase("processing");
          }
        };

        // Safety net: sometimes onprogress never lands on 100
        xhr.upload.onload = () => {
          setUploadPct(100);
          setPhase("processing");
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadPct(100);
            // Keep "processing" label until we parse and redirect
            try {
              const resp = JSON.parse(xhr.responseText || "{}");
              const id = resp?.candidate_id;

              if (typeof id !== "number") {
                reject(new Error("Upload succeeded but response is missing candidate_id"));
                return;
              }

              resolve(id);
            } catch {
              reject(new Error("Upload succeeded but response is not valid JSON"));
            }
          } else {
            reject(new Error(`Upload failed (${xhr.status}). ${xhr.responseText || ""}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(JSON.stringify(payload));
      });

      // Redirect on success
      navigate(`/cv/profile/${candidateId}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Upload failed");
      resetProgressUi();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "var(--gradient-surface)" }}
    >
      <Link to="/" className="absolute top-6 left-6">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </Link>

      <div className="w-full max-w-lg text-center space-y-8">
        <div>
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "var(--gradient-primary)" }}
          >
            <FileText className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Upload Resume</h1>
          <p className="mt-2 text-muted-foreground">Upload a resume to get AI-powered analysis and insights</p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          disabled={isUploading}
        />

        <Card
          className={`border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer ${
            isUploading ? "opacity-60 pointer-events-none" : ""
          }`}
          onClick={handleCardClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {selectedFile ? `${selectedFile.name} selected ✓` : "Click to upload or drag & drop"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </CardContent>
        </Card>

        {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

        {showProgress && (
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                {phase === "processing" ? (
                  <>
                    <span className="inline-flex h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground" />
                    Processing...
                  </>
                ) : (
                  "Uploading..."
                )}
              </span>
              <span>{phase === "processing" ? "100%" : `${uploadPct}%`}</span>
            </div>

            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${phase === "processing" ? "bg-muted-foreground/60" : "bg-primary"}`}
                style={{ width: `${phase === "processing" ? 100 : uploadPct}%` }}
              />
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <Button size="lg" className="gap-2" disabled={isUploading} onClick={() => setLlmModalOpen(true)}>
              <Sparkles className="h-4 w-4" /> {isUploading ? "Uploading..." : "Generate Summary"}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">Your resume is processed securely and never shared</p>
      </div>

      <LLMModelModal open={llmModalOpen} onClose={() => setLlmModalOpen(false)} onConfirm={handleLlmConfirm} />
    </div>
  );
};

export default UploadResume;
