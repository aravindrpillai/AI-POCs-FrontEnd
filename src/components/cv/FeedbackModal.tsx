import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  onSubmit: (feedback: FeedbackData) => void;
}

export interface FeedbackData {
  candidateName: string;
  feedbackBy: string;
  communication: number;
  technicalKnowledge: number;
  functionalKnowledge: number;
  problemSolving: number;
  teamwork: number;
  status: "selected" | "need_more_evaluation" | "rejected";
  comments: string;
  date: string;
}

const ratingCategories = [
  { key: "communication", label: "Communication" },
  { key: "technicalKnowledge", label: "Technical Knowledge" },
  { key: "functionalKnowledge", label: "Functional Knowledge" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "teamwork", label: "Teamwork & Collaboration" },
] as const;

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-5 w-5 ${
              star <= (hover || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const FeedbackModal = ({ open, onClose, candidateName, onSubmit }: FeedbackModalProps) => {
  const [ratings, setRatings] = useState<Record<string, number>>({
    communication: 0,
    technicalKnowledge: 0,
    functionalKnowledge: 0,
    problemSolving: 0,
    teamwork: 0,
  });
  const [status, setStatus] = useState<string>("need_more_evaluation");
  const [comments, setComments] = useState("");

  const handleSubmit = () => {
    onSubmit({
      candidateName,
      feedbackBy: "Current User",
      communication: ratings.communication,
      technicalKnowledge: ratings.technicalKnowledge,
      functionalKnowledge: ratings.functionalKnowledge,
      problemSolving: ratings.problemSolving,
      teamwork: ratings.teamwork,
      status: status as FeedbackData["status"],
      comments,
      date: new Date().toLocaleDateString(),
    });
    // Reset
    setRatings({ communication: 0, technicalKnowledge: 0, functionalKnowledge: 0, problemSolving: 0, teamwork: 0 });
    setStatus("need_more_evaluation");
    setComments("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Candidate & Feedback by */}
          <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
            <p className="text-sm font-semibold text-foreground">{candidateName}</p>
            <p className="text-xs text-muted-foreground">Feedback by: <span className="font-medium text-foreground">Current User</span></p>
          </div>

          {/* Star Ratings */}
          <div className="space-y-3">
            {ratingCategories.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{cat.label}</span>
                <StarRating
                  value={ratings[cat.key]}
                  onChange={(v) => setRatings((prev) => ({ ...prev, [cat.key]: v }))}
                />
              </div>
            ))}
          </div>

          {/* Status Toggle */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Decision</span>
            <ToggleGroup type="single" value={status} onValueChange={(v) => v && setStatus(v)} className="justify-start">
              <ToggleGroupItem value="selected" className="data-[state=on]:bg-green-500/20 data-[state=on]:text-green-700 text-xs px-3">
                Selected
              </ToggleGroupItem>
              <ToggleGroupItem value="need_more_evaluation" className="data-[state=on]:bg-yellow-500/20 data-[state=on]:text-yellow-700 text-xs px-3">
                Need More Evaluation
              </ToggleGroupItem>
              <ToggleGroupItem value="rejected" className="data-[state=on]:bg-red-500/20 data-[state=on]:text-red-700 text-xs px-3">
                Rejected
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Feedback</span>
            <Textarea
              placeholder="Enter your feedback here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">Submit Feedback</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
