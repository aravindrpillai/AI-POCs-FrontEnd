import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Message, AttachmentFile, ClaimStep, AIResponseData } from "@/types/claim";
import ChatWindow from "@/components/claim/ChatWindow";
import Composer from "@/components/claim/Composer";
import ProgressPanel from "@/components/claim/ProgressPanel";
import AttachmentCard from "@/components/claim/AttachmentCard";
import SummaryScreen from "@/components/claim/SummaryScreen";
import { claimApi } from "@/services/claimApi";
import { ShieldCheck, Lightbulb, ChevronDown, ChevronUp, Loader2, CheckCircle2, Lock } from "lucide-react";

const WELCOME_MESSAGE = "Hi there! 👋 I'm your claims assistant. I'm here to help you file a claim quickly and easily. Please describe what happened — include as much detail as you'd like.";
const genId = () => Math.random().toString(36).slice(2, 10);

const Index = () => {
  const { convId: convIdParam } = useParams<{ convId: string }>();
  const navigate = useNavigate();

  const [initializing, setInitializing] = useState(true);
  const [convId, setConvId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [currentStep, setCurrentStep] = useState<ClaimStep>('describe');
  const [isTyping, setIsTyping] = useState(false);
  const [summaryData, setSummaryData] = useState<AIResponseData | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [...prev, { ...msg, id: genId(), timestamp: new Date() }]);
  }, []);

  // ── On mount: either create new conv or load existing ──────────────────
  useEffect(() => {
    const init = async () => {
      setInitializing(true);
      try {
        if (convIdParam === "new") {
          // Create fresh conversation
          const newConvId = await claimApi.createConversation();
          setConvId(newConvId);
          navigate(`/claim/${newConvId}`, { replace: true });
          setMessages([{ id: genId(), type: 'ai', content: WELCOME_MESSAGE, timestamp: new Date() }]);
        } else if (convIdParam) {
          // Load existing conversation
          const data = await claimApi.getConversation(convIdParam);
          setConvId(data.conv_id);

          // Restore submitted state
          if (data.submitted && data.summary) {
            setSubmitted(true);
            setSummaryData(data.summary);
            setCurrentStep('submit');
          }

          // Restore messages from history
          if (data.messages.length === 0) {
            setMessages([{ id: genId(), type: 'ai', content: WELCOME_MESSAGE, timestamp: new Date() }]);
          } else {
            const restored: Message[] = [
              { id: genId(), type: 'ai', content: WELCOME_MESSAGE, timestamp: new Date() },
              ...data.messages.map((m) => ({
                id: genId(),
                type: (m.is_file ? 'attachment' : m.role === 'user' ? 'user' : 'ai') as Message['type'],
                content: m.message ?? '',
                timestamp: new Date(m.created_at),
                // For file messages show as plain text note in chat
                ...(m.is_file && {
                  type: 'ai' as const,
                  content: `📎 File uploaded: ${m.filename}${m.message ? ` — ${m.message}` : ''}`,
                }),
              })),
            ];
            setMessages(restored);

            // Determine current step from history
            const hasAssistant = data.messages.some((m) => m.role === 'assistant');
            if (data.submitted) {
              setCurrentStep('submit');
            } else if (hasAssistant) {
              setCurrentStep('details');
            }
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load conversation.");
      } finally {
        setInitializing(false);
      }
    };

    init();
  }, [convIdParam]);

  const handleSend = useCallback(async (text: string) => {
    if (!convId || submitted) return;
    setError(null);
    addMessage({ type: 'user', content: text });
    setIsTyping(true);
    if (currentStep === 'describe') setCurrentStep('details');

    try {
      const response = await claimApi.sendMessage(text, convId);
      setIsTyping(false);
      addMessage({ type: 'ai', content: response.reply });

      if (response.summary && response.data) {
        setCurrentStep('submit');
        setSummaryData(response.data);
        setSubmitted(true);
        setShowSummary(true);
      } else if (
        response.data?.incident_location &&
        response.data?.parties_involved?.length > 0
      ) {
        setCurrentStep('review');
      }
    } catch (err: any) {
      setIsTyping(false);
      const msg = err.message || "Something went wrong. Please try again.";
      setError(msg);
      addMessage({ type: 'ai', content: `Sorry, I ran into an issue: ${msg}` });
    }
  }, [convId, submitted, currentStep, addMessage]);

  const handleAttach = useCallback(async (files: FileList) => {
    if (!convId || submitted) return;

    Array.from(files).forEach(async (file) => {
      const tempId = genId();
      const attachment: AttachmentFile = {
        id: tempId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        isImage: file.type.startsWith('image/'),
        uploading: true,
        uploadError: false,
      };
      setAttachments((prev) => [...prev, attachment]);
      addMessage({ type: 'attachment', content: '', attachment });

      try {
        const result = await claimApi.uploadFile(convId, file);
        const update = (a: AttachmentFile) =>
          a.id === tempId ? { ...a, id: result.file_uid, uploading: false, uploadError: false } : a;
        setAttachments((prev) => prev.map(update));
        setMessages((prev) => prev.map((m) =>
          m.type === 'attachment' && m.attachment?.id === tempId
            ? { ...m, attachment: update(m.attachment!) }
            : m
        ));
      } catch {
        const markError = (a: AttachmentFile) =>
          a.id === tempId ? { ...a, uploading: false, uploadError: true } : a;
        setAttachments((prev) => prev.map(markError));
        setMessages((prev) => prev.map((m) =>
          m.type === 'attachment' && m.attachment?.id === tempId
            ? { ...m, attachment: markError(m.attachment!) }
            : m
        ));
      }
    });
  }, [convId, submitted, addMessage]);

  const handleDeleteAttachment = useCallback((id: string) => {
    if (submitted) return;
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setMessages((prev) => prev.filter((m) => !(m.type === 'attachment' && m.attachment?.id === id)));
  }, [submitted]);

  const handleNoteChange = useCallback((id: string, note: string) => {
    setAttachments((prev) => prev.map((a) => a.id === id ? { ...a, note } : a));
    setMessages((prev) => prev.map((m) =>
      m.type === 'attachment' && m.attachment?.id === id
        ? { ...m, attachment: { ...m.attachment!, note } }
        : m
    ));
  }, []);

  const handleSummaryClose = useCallback(() => setShowSummary(false), []);

  const handleStartNew = useCallback(() => {
    navigate("/claim/new", { replace: true });
    setMessages([]);
    setAttachments([]);
    setCurrentStep('describe');
    setConvId(undefined);
    setSummaryData(null);
    setShowSummary(false);
    setSubmitted(false);
    setError(null);
  }, [navigate]);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading your session…</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (error && !convId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center px-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={() => navigate("/claim/new", { replace: true })}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Start New Claim
          </button>
        </div>
      </div>
    );
  }

  // ── Main ────────────────────────────────────────────────────────────────
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
          <div className="ml-auto flex items-center gap-3">
            {submitted && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Submitted
              </span>
            )}
            {convId && (
              <span className="text-[11px] font-mono text-muted-foreground">
                Conv: {convId.slice(0, 8)}…
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col lg:flex-row gap-4 md:gap-6">

        {/* Chat */}
        <div
          className="flex-1 flex flex-col bg-card rounded-2xl shadow-card border border-border overflow-hidden min-h-0"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            onDeleteAttachment={handleDeleteAttachment}
            onNoteChange={handleNoteChange}
          />

          {/* Bottom bar */}
          {submitted && summaryData ? (
            // ── Submitted / locked state ──────────────────────────────────
            <div className="border-t border-border bg-success/5 px-6 py-5 flex flex-col items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-semibold">FNOL successfully submitted</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                This conversation is locked. No further updates are allowed.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowSummary(true)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  View Summary
                </button>
                <button
                  onClick={handleStartNew}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Start New Claim
                </button>
              </div>
            </div>
          ) : (
            // ── Active composer ───────────────────────────────────────────
            <Composer
              onSend={handleSend}
              onAttach={handleAttach}
              disabled={isTyping || !convId || submitted}
              placeholder="Describe what happened…"
            />
          )}
        </div>

        {/* Side Panel */}
        <aside className="lg:w-80 flex-shrink-0">
          <button
            className="lg:hidden w-full flex items-center justify-between p-3 rounded-xl bg-card shadow-card border border-border mb-3"
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
          >
            <span className="text-sm font-medium">Claim Progress & Attachments</span>
            {sidePanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className={`space-y-4 ${sidePanelOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-card rounded-2xl shadow-card border border-border p-5">
              <h3 className="text-sm font-heading font-semibold mb-4">Claim Progress</h3>
              <ProgressPanel currentStep={currentStep} />
            </div>

            {/* Lock notice when submitted */}
            {submitted && (
              <div className="bg-success/5 rounded-2xl border border-success/20 p-4 flex items-start gap-3">
                <Lock className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-success">Claim Locked</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This FNOL has been submitted. No further edits or messages are allowed.
                  </p>
                </div>
              </div>
            )}

            {/* Attachments — read only when submitted */}
            <div className="bg-card rounded-2xl shadow-card border border-border p-5">
              <h3 className="text-sm font-heading font-semibold mb-3">
                Attachments{" "}
                {attachments.length > 0 && (
                  <span className="text-muted-foreground font-normal">({attachments.length})</span>
                )}
              </h3>
              {attachments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No files attached.</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((a) => (
                    <AttachmentCard
                      key={a.id}
                      attachment={a}
                      onDelete={submitted ? () => {} : handleDeleteAttachment}
                      onNoteChange={handleNoteChange}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tips — hide when submitted */}
            {!submitted && (
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
            )}
          </div>
        </aside>
      </main>

      {/* Summary Modal */}
      {showSummary && summaryData && convId && (
        <SummaryScreen
          data={summaryData}
          attachments={attachments}
          convId={convId}
          onClose={handleSummaryClose}
          onStartNew={handleStartNew}
        />
      )}
    </div>
  );
};

export default Index;