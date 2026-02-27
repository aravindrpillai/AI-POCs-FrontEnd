import { useState, useCallback } from "react";
import { Message, AttachmentFile, ClaimStep, ClaimData, FOLLOW_UP_QUESTIONS, CLAIM_FIELD_KEYS } from "@/types/claim";
import ChatWindow from "@/components/claim/ChatWindow";
import Composer from "@/components/claim/Composer";
import ProgressPanel from "@/components/claim/ProgressPanel";
import AttachmentCard from "@/components/claim/AttachmentCard";
import ConfirmationModal from "@/components/claim/ConfirmationModal";
import { ShieldCheck, Lightbulb, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const WELCOME_MESSAGE = "Hi there! 👋 I'm your claims assistant. I'm here to help you file a claim quickly and easily. Please describe what happened — include as much detail as you'd like.";

const genId = () => Math.random().toString(36).slice(2, 10);

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: genId(), type: 'ai', content: WELCOME_MESSAGE, timestamp: new Date() },
  ]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [currentStep, setCurrentStep] = useState<ClaimStep>('describe');
  const [questionIndex, setQuestionIndex] = useState(-1); // -1 = waiting for initial description
  const [isTyping, setIsTyping] = useState(false);
  const [claimData, setClaimData] = useState<ClaimData>({
    description: '', dateTime: '', location: '', incidentType: '', injuries: '', policeReport: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId] = useState(`CLM-${Math.floor(100000 + Math.random() * 900000)}`);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [...prev, { ...msg, id: genId(), timestamp: new Date() }]);
  }, []);

  const simulateAiReply = useCallback((content: string, delay = 1200) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ type: 'ai', content });
    }, delay);
  }, [addMessage]);

  const handleSend = useCallback((text: string) => {
    addMessage({ type: 'user', content: text });

    if (questionIndex === -1) {
      // Initial description
      setClaimData((prev) => ({ ...prev, description: text }));
      setQuestionIndex(0);
      setCurrentStep('details');
      simulateAiReply(
        `Thank you for sharing that. I'll need a few more details to process your claim.\n\n${FOLLOW_UP_QUESTIONS[0]}`
      );
    } else if (questionIndex < FOLLOW_UP_QUESTIONS.length) {
      // Store answer
      const fieldKey = CLAIM_FIELD_KEYS[questionIndex];
      setClaimData((prev) => ({ ...prev, [fieldKey]: text }));

      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);

      if (nextIdx < FOLLOW_UP_QUESTIONS.length) {
        simulateAiReply(FOLLOW_UP_QUESTIONS[nextIdx]);
      } else {
        // All questions answered
        setCurrentStep('review');
        simulateAiReply(
          "Thank you for providing all the details! I'm reviewing everything now…",
          1000
        );
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setCurrentStep('submit');
            addMessage({ type: 'ai', content: "Everything looks good. I'm submitting your claim now." });
            setIsSubmitting(true);
            setTimeout(() => {
              setIsSubmitting(false);
              setShowModal(true);
            }, 2500);
          }, 1500);
        }, 2500);
      }
    }
  }, [questionIndex, addMessage, simulateAiReply]);

  const handleAttach = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const attachment: AttachmentFile = {
        id: genId(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        isImage,
      };
      setAttachments((prev) => [...prev, attachment]);
      addMessage({ type: 'attachment', content: '', attachment });
    });
  }, [addMessage]);

  const handleDeleteAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setMessages((prev) => prev.filter((m) => !(m.type === 'attachment' && m.attachment?.id === id)));
  }, []);

  const handleNoteChange = useCallback((id: string, note: string) => {
    setAttachments((prev) => prev.map((a) => a.id === id ? { ...a, note } : a));
    setMessages((prev) => prev.map((m) =>
      m.type === 'attachment' && m.attachment?.id === id
        ? { ...m, attachment: { ...m.attachment, note } }
        : m
    ));
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    // Reset
    setMessages([{ id: genId(), type: 'ai', content: WELCOME_MESSAGE, timestamp: new Date() }]);
    setAttachments([]);
    setCurrentStep('describe');
    setQuestionIndex(-1);
    setClaimData({ description: '', dateTime: '', location: '', incidentType: '', injuries: '', policeReport: '' });
  }, []);

  const isComposerDisabled = isTyping || isSubmitting || currentStep === 'submit';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-heading font-bold leading-tight">ClaimAssist</h1>
            <p className="text-[11px] text-muted-foreground">AI-Powered Claim Filing</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Left: Chat */}
        <div className="flex-1 flex flex-col bg-card rounded-2xl shadow-card border border-border overflow-hidden min-h-0" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <ChatWindow messages={messages} isTyping={isTyping} onDeleteAttachment={handleDeleteAttachment} onNoteChange={handleNoteChange} />

          {/* Submitting overlay */}
          {isSubmitting && (
            <div className="flex items-center justify-center gap-3 py-4 bg-muted/50 border-t border-border animate-fade-in">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Submitting your claim…</span>
            </div>
          )}

          <Composer
            onSend={handleSend}
            onAttach={handleAttach}
            disabled={isComposerDisabled}
            placeholder={
              questionIndex === -1
                ? "Describe what happened…"
                : "Type your answer…"
            }
          />
        </div>

        {/* Right: Side Panel */}
        <aside className="lg:w-80 flex-shrink-0">
          {/* Mobile toggle */}
          <button
            className="lg:hidden w-full flex items-center justify-between p-3 rounded-xl bg-card shadow-card border border-border mb-3"
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
          >
            <span className="text-sm font-medium">Claim Progress & Attachments</span>
            {sidePanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className={`space-y-4 ${sidePanelOpen ? 'block' : 'hidden'} lg:block`}>
            {/* Progress */}
            <div className="bg-card rounded-2xl shadow-card border border-border p-5">
              <h3 className="text-sm font-heading font-semibold mb-4">Claim Progress</h3>
              <ProgressPanel currentStep={currentStep} />
            </div>

            {/* Attachments */}
            <div className="bg-card rounded-2xl shadow-card border border-border p-5">
              <h3 className="text-sm font-heading font-semibold mb-3">
                Attachments {attachments.length > 0 && <span className="text-muted-foreground font-normal">({attachments.length})</span>}
              </h3>
              {attachments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No files attached yet.</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((a) => (
                    <AttachmentCard key={a.id} attachment={a} onDelete={handleDeleteAttachment} onNoteChange={handleNoteChange} compact />
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-accent/5 rounded-2xl border border-accent/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-heading font-semibold">Quick Tips</h3>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>• Include photos from multiple angles</li>
                <li>• Attach police reports if available</li>
                <li>• Be specific about dates and times</li>
                <li>• Mention any witnesses present</li>
              </ul>
            </div>
          </div>
        </aside>
      </main>

      {/* Confirmation Modal */}
      {showModal && (
        <ConfirmationModal
          claimData={claimData}
          attachments={attachments}
          referenceId={referenceId}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Index;
