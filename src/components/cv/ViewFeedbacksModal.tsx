import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FeedbackData } from "@/components/cv/FeedbackModal";

interface ViewFeedbacksModalProps {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  feedbacks: FeedbackData[];
}

const statusColors: Record<string, string> = {
  selected: "bg-green-500/15 text-green-700",
  need_more_evaluation: "bg-yellow-500/15 text-yellow-700",
  rejected: "bg-red-500/15 text-red-700",
};

const statusLabels: Record<string, string> = {
  selected: "Selected",
  need_more_evaluation: "Need More Evaluation",
  rejected: "Rejected",
};

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`h-3.5 w-3.5 ${s <= count ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
    ))}
  </div>
);

const ViewFeedbacksModal = ({ open, onClose, candidateName, feedbacks }: ViewFeedbacksModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Feedbacks for {candidateName}</DialogTitle>
        </DialogHeader>

        {feedbacks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No feedbacks yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{fb.feedbackBy}</p>
                    <p className="text-xs text-muted-foreground">{fb.date}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[fb.status]}`}>
                    {statusLabels[fb.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Communication", value: fb.communication },
                    { label: "Technical", value: fb.technicalKnowledge },
                    { label: "Functional", value: fb.functionalKnowledge },
                    { label: "Problem Solving", value: fb.problemSolving },
                    { label: "Teamwork", value: fb.teamwork },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{r.label}</span>
                      <Stars count={r.value} />
                    </div>
                  ))}
                </div>

                {fb.comments && (
                  <p className="text-sm text-muted-foreground border-t pt-2">{fb.comments}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewFeedbacksModal;
