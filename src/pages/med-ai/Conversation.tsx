import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, ArrowLeft, X, FileText, Image as ImageIcon,
  Send, Paperclip, Bot, User, Loader2, ClipboardList
} from "lucide-react";
import { MedMessage, CATEGORIES, MedCategory, Gender } from "@/types/medai";
import { medaiApi } from "@/services/medaiApi";

const genId = () => Math.random().toString(36).slice(2, 10);

const Conversation = () => {
  const navigate = useNavigate();
  const { convId } = useParams<{ convId: string }>();

  // Read intake context from sessionStorage
  const [meta] = useState(() => {
    try {
      const raw = sessionStorage.getItem(`medai-intake-${convId}`);
      return raw ? JSON.parse(raw) as { category: MedCategory; gender: Gender; age: string; initialReply: string; problem: string } : null;
    } catch { return null; }
  });

  const [messages, setMessages] = useState<MedMessage[]>(() => {
    if (!meta) return [];
    return [
      { id: genId(), role: 'user', content: meta.problem, timestamp: new Date() },
      { id: genId(), role: 'ai', content: meta.initialReply, timestamp: new Date() },
    ];
  });

  const [chatText, setChatText] = useState('');
  const [chatFiles, setChatFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [diagnosisReady, setDiagnosisReady] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);

  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => { scrollToBottom(); }, []);

  const handleChatSend = useCallback(async () => {
    if ((!chatText.trim() && chatFiles.length === 0) || !convId || diagnosisReady) return;
    const text = chatText.trim() || `${chatFiles.length} file(s) attached`;
    setMessages(prev => [...prev, { id: genId(), role: 'user', content: text, timestamp: new Date() }]);
    setChatText('');
    const filesToSend = [...chatFiles];
    setChatFiles([]);
    setIsTyping(true);
    scrollToBottom();

    try {
      const res = await medaiApi.sendMessage(convId, text, filesToSend.length > 0 ? filesToSend : undefined);
      setMessages(prev => [...prev, { id: genId(), role: 'ai', content: res.reply, timestamp: new Date() }]);
      if (res.diagnosis_ready) {
        setDiagnosisReady(true);
        setDiagnosisData(res.diagnosis);
      }
      scrollToBottom();
    } catch (err: any) {
      setMessages(prev => [...prev, { id: genId(), role: 'ai', content: `Error: ${err.message}`, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  }, [chatText, chatFiles, convId, diagnosisReady]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setChatFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  if (!convId || !meta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Session not found.</p>
          <button onClick={() => navigate("/med-ai/diagnose")} className="px-6 py-2 rounded-xl bg-info text-info-foreground text-sm font-medium">
            Start New Diagnosis
          </button>
        </div>
      </div>
    );
  }

  const categoryLabel = CATEGORIES.find(c => c.value === meta.category)?.label || meta.category;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/med-ai")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-info flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-info-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-heading font-bold leading-tight">Diagnosis Session</h1>
            <p className="text-[11px] text-muted-foreground capitalize truncate">
              {categoryLabel} • {meta.gender} • Age {meta.age}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono hidden sm:block">#{convId?.slice(0, 8)}</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 overflow-y-auto scrollbar-thin" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <div className="space-y-4">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-info text-info-foreground'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card border border-border shadow-card rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'opacity-60' : 'text-muted-foreground'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-info text-info-foreground flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-card">
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground/50"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-card sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {diagnosisReady ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">The AI has gathered enough information.</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowReport(true)}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-info text-info-foreground font-heading font-bold text-base shadow-elevated"
              >
                <ClipboardList className="w-5 h-5" />
                Show Diagnosis Report
              </motion.button>
            </motion.div>
          ) : (
            <>
              {chatFiles.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {chatFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted text-xs">
                      {f.type.startsWith('image/') ? <ImageIcon className="w-3 h-3 text-info" /> : <FileText className="w-3 h-3 text-info" />}
                      <span className="truncate max-w-[100px]">{f.name}</span>
                      <button onClick={() => setChatFiles(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="flex-shrink-0 p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  ref={chatFileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <textarea
                  value={chatText}
                  onChange={e => { setChatText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                  placeholder="Type your response…"
                  rows={1}
                  disabled={isTyping}
                  className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-info/20 focus:border-info/40 transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleChatSend}
                  disabled={(!chatText.trim() && chatFiles.length === 0) || isTyping}
                  className="flex-shrink-0 p-2.5 rounded-xl bg-info text-info-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Diagnosis Report Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
            onClick={() => setShowReport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-card rounded-2xl shadow-elevated border border-border p-6 scrollbar-thin"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-info flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-info-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold">Diagnosis Report</h2>
                  <p className="text-xs text-muted-foreground capitalize">
                    {categoryLabel} • {meta.gender} • Age {meta.age}
                  </p>
                </div>
                <button onClick={() => setShowReport(false)} className="ml-auto p-2 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {diagnosisData ? (
                <div className="prose prose-sm max-w-none">
                  {typeof diagnosisData === 'string' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{diagnosisData}</p>
                  ) : (
                    <pre className="text-xs bg-muted p-4 rounded-xl overflow-x-auto">
                      {JSON.stringify(diagnosisData, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">No diagnosis data available yet.</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  ⚠️ This is an AI-generated preliminary assessment. It is NOT a medical diagnosis.
                  Please consult a qualified healthcare professional for proper medical advice.
                </p>
              </div>

              <button
                onClick={() => { setShowReport(false); navigate("/med-ai"); }}
                className="mt-4 w-full py-3 rounded-xl bg-info text-info-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Conversation;
