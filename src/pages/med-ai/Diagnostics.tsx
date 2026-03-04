import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, ArrowLeft, ArrowRight, Upload, X, FileText, Image as ImageIcon,
  Send, Paperclip, Bot, User, Loader2, ClipboardList
} from "lucide-react";
import { PatientIntake, MedCategory, Gender, CATEGORIES, MedMessage, MedAttachment } from "@/types/medai";
import { medaiApi } from "@/services/medaiApi";

const genId = () => Math.random().toString(36).slice(2, 10);

type IntakeStep = 'category' | 'gender' | 'metrics' | 'problem';

const Diagnostics = () => {
  const navigate = useNavigate();

  // Intake flow
  const [intakeStep, setIntakeStep] = useState<IntakeStep>('category');
  const [category, setCategory] = useState<MedCategory | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [problem, setProblem] = useState('');
  const [intakeFiles, setIntakeFiles] = useState<File[]>([]);
  const [intakeComplete, setIntakeComplete] = useState(false);

  // Chat
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MedMessage[]>([]);
  const [chatText, setChatText] = useState('');
  const [chatFiles, setChatFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [diagnosisReady, setDiagnosisReady] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // ── Intake file handling ──
  const handleIntakeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIntakeFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      e.target.value = '';
    }
  };
  const removeIntakeFile = (idx: number) => setIntakeFiles(prev => prev.filter((_, i) => i !== idx));

  // ── Start diagnosis ──
  const handleStartDiagnosis = useCallback(async () => {
    if (!category || !gender || !age || !problem) return;
    setIsStarting(true);
    setError(null);

    const intake: PatientIntake = {
      category, gender,
      age: parseInt(age),
      height: parseFloat(height) || 0,
      weight: parseFloat(weight) || 0,
      problem,
    };

    try {
      const res = await medaiApi.startDiagnosis(intake, intakeFiles);
      setConvId(res.conv_id);
      setIntakeComplete(true);
      setMessages([
        { id: genId(), role: 'user', content: problem, timestamp: new Date() },
        { id: genId(), role: 'ai', content: res.reply, timestamp: new Date() },
      ]);
      scrollToBottom();
    } catch (err: any) {
      setError(err.message || "Failed to start diagnosis");
    } finally {
      setIsStarting(false);
    }
  }, [category, gender, age, height, weight, problem, intakeFiles]);

  // ── Chat send ──
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

  // ── Intake step navigation ──
  const canGoNext = () => {
    if (intakeStep === 'category') return !!category;
    if (intakeStep === 'gender') return !!gender;
    if (intakeStep === 'metrics') return !!age;
    return false;
  };

  const nextStep = () => {
    if (intakeStep === 'category') setIntakeStep('gender');
    else if (intakeStep === 'gender') setIntakeStep('metrics');
    else if (intakeStep === 'metrics') setIntakeStep('problem');
  };

  const prevStep = () => {
    if (intakeStep === 'gender') setIntakeStep('category');
    else if (intakeStep === 'metrics') setIntakeStep('gender');
    else if (intakeStep === 'problem') setIntakeStep('metrics');
  };

  const stepIndex = ['category', 'gender', 'metrics', 'problem'].indexOf(intakeStep);

  // ── Render intake form ──
  if (!intakeComplete) {
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
            <div>
              <h1 className="text-base font-heading font-bold leading-tight">Medical AI Diagnostics</h1>
              <p className="text-[11px] text-muted-foreground">Step {stepIndex + 1} of 4</p>
            </div>
          </div>
        </header>

        {/* Progress bar */}
        <div className="max-w-3xl mx-auto w-full px-4 pt-4">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-info rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((stepIndex + 1) / 4) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {/* Category step */}
              {intakeStep === 'category' && (
                <motion.div key="cat" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-heading font-bold mb-2">What type of specialist do you need?</h2>
                    <p className="text-sm text-muted-foreground">Choose a medical category for your diagnosis</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CATEGORIES.map(cat => (
                      <motion.button
                        key={cat.value}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setCategory(cat.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                          category === cat.value
                            ? 'border-info bg-info/5 shadow-card'
                            : 'border-border bg-card hover:border-info/40'
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-xs font-medium">{cat.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Gender step */}
              {intakeStep === 'gender' && (
                <motion.div key="gen" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-heading font-bold mb-2">What's your gender?</h2>
                    <p className="text-sm text-muted-foreground">This helps provide more accurate insights</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-w-sm">
                    {([['male', '👨', 'Male'], ['female', '👩', 'Female'], ['other', '🧑', 'Other']] as const).map(([val, icon, label]) => (
                      <motion.button
                        key={val}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setGender(val)}
                        className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                          gender === val ? 'border-info bg-info/5 shadow-card' : 'border-border bg-card hover:border-info/40'
                        }`}
                      >
                        <span className="text-3xl">{icon}</span>
                        <span className="text-sm font-medium">{label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Metrics step */}
              {intakeStep === 'metrics' && (
                <motion.div key="met" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-heading font-bold mb-2">Tell us about yourself</h2>
                    <p className="text-sm text-muted-foreground">Age is required. Height & weight are optional but helpful.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Age *</label>
                      <input
                        type="number" value={age} onChange={e => setAge(e.target.value)}
                        placeholder="e.g. 32"
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Height (cm)</label>
                      <input
                        type="number" value={height} onChange={e => setHeight(e.target.value)}
                        placeholder="e.g. 170"
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Weight (kg)</label>
                      <input
                        type="number" value={weight} onChange={e => setWeight(e.target.value)}
                        placeholder="e.g. 70"
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Problem step */}
              {intakeStep === 'problem' && (
                <motion.div key="prob" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-heading font-bold mb-2">Describe your health concern</h2>
                    <p className="text-sm text-muted-foreground">Be as detailed as possible — duration, severity, triggers, etc.</p>
                  </div>
                  <textarea
                    value={problem} onChange={e => setProblem(e.target.value)}
                    placeholder="e.g. I've been experiencing sharp pain in my lower back for about 2 weeks now, especially when I bend forward. It started after I lifted something heavy..."
                    rows={6}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info transition-all leading-relaxed"
                  />

                  {/* File upload */}
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-info/40 text-sm text-info hover:bg-info/5 transition-colors"
                    >
                      <Upload className="w-4 h-4" /> Attach reports / images
                    </button>
                    <input ref={fileInputRef} type="file" multiple onChange={handleIntakeFiles} className="hidden" accept="image/*,.pdf,.doc,.docx" />

                    {intakeFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {intakeFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
                            {f.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-info" /> : <FileText className="w-4 h-4 text-info" />}
                            <span className="flex-1 truncate">{f.name}</span>
                            <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                            <button onClick={() => removeIntakeFile(i)} className="text-muted-foreground hover:text-destructive">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  {/* Start button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartDiagnosis}
                    disabled={!problem.trim() || isStarting}
                    className="w-full py-4 rounded-2xl bg-info text-info-foreground font-heading font-bold text-base shadow-elevated hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isStarting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Starting Diagnosis...</>
                    ) : (
                      <><Stethoscope className="w-5 h-5" /> Start Diagnosis</>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav buttons */}
            {intakeStep !== 'problem' && (
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={prevStep}
                  disabled={intakeStep === 'category'}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={nextStep}
                  disabled={!canGoNext()}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-info text-info-foreground text-sm font-medium disabled:opacity-40 transition-opacity"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Chat view ──
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
          <div>
            <h1 className="text-base font-heading font-bold leading-tight">Diagnosis Session</h1>
            <p className="text-[11px] text-muted-foreground capitalize">
              {CATEGORIES.find(c => c.value === category)?.label} • {gender} • Age {age}
            </p>
          </div>
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
                  ? 'bg-bubble-user text-bubble-user-foreground rounded-br-md'
                  : 'bg-card border border-border shadow-card rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'text-bubble-user-foreground/60' : 'text-muted-foreground'}`}>
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
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse-dot-1" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse-dot-2" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse-dot-3" />
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
              {/* Attached chat files preview */}
              {chatFiles.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {chatFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted text-xs">
                      <FileText className="w-3 h-3 text-info" />
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
                  onClick={() => chatFileInputRef.current?.click()}
                  className="flex-shrink-0 p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  ref={chatFileInputRef} type="file" multiple className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={e => { if (e.target.files) { setChatFiles(prev => [...prev, ...Array.from(e.target.files!)]); e.target.value = ''; } }}
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
                    {CATEGORIES.find(c => c.value === category)?.label} • {gender} • Age {age}
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

export default Diagnostics;
