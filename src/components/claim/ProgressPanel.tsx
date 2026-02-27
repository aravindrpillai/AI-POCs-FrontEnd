import { STEPS, ClaimStep } from "@/types/claim";
import { Check } from "lucide-react";

interface ProgressPanelProps {
  currentStep: ClaimStep;
}

const stepIndex = (step: ClaimStep) => STEPS.findIndex((s) => s.key === step);

const ProgressPanel = ({ currentStep }: ProgressPanelProps) => {
  const current = stepIndex(currentStep);

  return (
    <div className="space-y-3">
      {STEPS.map((step, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;
        return (
          <div key={step.key} className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all ${
                isCompleted
                  ? 'bg-success text-success-foreground'
                  : isCurrent
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/10'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                isCompleted
                  ? 'text-success'
                  : isCurrent
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressPanel;
