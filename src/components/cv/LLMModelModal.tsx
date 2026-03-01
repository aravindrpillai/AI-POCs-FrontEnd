import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LLMModelModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (model: string, passcode?: string) => void;
}

const LLMModelModal = ({ open, onClose, onConfirm }: LLMModelModalProps) => {
  const [selectedModel, setSelectedModel] = useState<"ollama" | "openai" | null>(null);
  const [passcode, setPasscode] = useState("1234");

  const handleConfirm = () => {
    if (!selectedModel) return;
    onConfirm(selectedModel, selectedModel === "openai" ? passcode : undefined);
    setSelectedModel(null);
    setPasscode("1234");
  };

  const handleClose = () => {
    setSelectedModel(null);
    setPasscode("1234");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select LLM Model</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            {(["ollama", "openai"] as const).map((model) => (
              <button
                key={model}
                onClick={() => {
                  setSelectedModel(model);
                  if (model !== "openai") setPasscode("");
                }}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  selectedModel === model
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                <span className="text-2xl">{model === "ollama" ? "🦙" : "🤖"}</span>
                <span className="font-semibold capitalize">{model === "openai" ? "OpenAI" : "Ollama"}</span>
              </button>
            ))}
          </div>

          {/* {selectedModel === "openai" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="passcode">OpenAI Passcode</Label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter your OpenAI API key"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </div>
          )} */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LLMModelModal;
