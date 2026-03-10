import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Flag, Download, Upload, Check, ChevronRight, ChevronLeft, BookOpen, Eye, FlagOff, Pencil, Save, X, Menu, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Option {
  id: string;
  option: string;
}

interface Question {
  id: number;
  question: string;
  attended: boolean;
  flagged: boolean;
  options: Option[];
  answer: string[];
  userAnswer?: string[];
}

/* Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Quiz = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [hideAttended, setHideAttended] = useState(false);
  const [editing, setEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState("");
  const [editOptions, setEditOptions] = useState<Option[]>([]);
  const [editAnswers, setEditAnswers] = useState<string[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("exam-questions");
    if (!raw) { navigate("/questions"); return; }
    try {
      const data: Question[] = JSON.parse(raw);
      setQuestions(shuffle(data));
    } catch { navigate("/questions"); }
  }, [navigate]);

  const displayList = useMemo(() => {
    let list = questions;
    if (showFlaggedOnly) list = list.filter((q) => q.flagged);
    if (hideAttended) list = list.filter((q) => !q.attended);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.options.some((o) => o.option.toLowerCase().includes(q))
      );
    }
    return list;
  }, [questions, showFlaggedOnly, hideAttended, searchQuery]);

  const current = displayList[currentIdx] || null;

  const shuffledOptions = useMemo(
    () => (current ? shuffle(current.options) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.id]
  );

  const isMulti = current ? current.answer.length > 1 : false;

  const updateQuestion = useCallback(
    (id: number, patch: Partial<Question>) => {
      setQuestions((prev) => {
        const next = prev.map((q) => (q.id === id ? { ...q, ...patch } : q));
        sessionStorage.setItem("exam-questions", JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const toggleSelect = (optId: string) => {
    if (revealed || editing) return;
    setSelected((prev) =>
      isMulti
        ? prev.includes(optId) ? prev.filter((s) => s !== optId) : [...prev, optId]
        : prev.includes(optId) ? [] : [optId]
    );
  };

  const handleReveal = () => {
    if (!current) return;
    setRevealed(true);
    updateQuestion(current.id, { attended: true, userAnswer: [...selected] });
  };

  const handleNext = () => {
    if (currentIdx < displayList.length - 1) {
      setCurrentIdx((i) => i + 1);
      setEditing(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setEditing(false);
    }
  };

  // Restore user answers when navigating to a previously answered question
  useEffect(() => {
    if (current?.attended && current.userAnswer?.length) {
      setSelected(current.userAnswer);
      setRevealed(true);
    } else {
      setSelected([]);
      setRevealed(false);
    }
  }, [current?.id]);

  const goTo = (idx: number) => {
    setCurrentIdx(idx);
    setEditing(false);
    setDrawerOpen(false);
  };

  const toggleFlag = () => {
    if (!current) return;
    updateQuestion(current.id, { flagged: !current.flagged });
  };

  const resetAll = () => {
    setQuestions((prev) => {
      const next = prev.map((q) => ({ ...q, attended: false, flagged: false, userAnswer: undefined }));
      sessionStorage.setItem("exam-questions", JSON.stringify(next));
      return next;
    });
    setCurrentIdx(0); setSelected([]); setRevealed(false); setShowFlaggedOnly(false); setHideAttended(false); setEditing(false);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "questions.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          sessionStorage.setItem("exam-questions", JSON.stringify(data));
          setQuestions(shuffle(data));
          setCurrentIdx(0); setSelected([]); setRevealed(false); setShowFlaggedOnly(false); setEditing(false);
        }
      } catch { alert("Invalid JSON file"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const toggleShowFlagged = () => {
    setShowFlaggedOnly((v) => !v);
    setCurrentIdx(0); setSelected([]); setRevealed(false); setEditing(false);
  };

  // Edit handlers
  const startEdit = () => {
    if (!current) return;
    setEditQuestion(current.question);
    setEditOptions(current.options.map((o) => ({ ...o })));
    setEditAnswers([...current.answer]);
    setEditing(true);
    setRevealed(false);
    setSelected([]);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    if (!current) return;
    updateQuestion(current.id, {
      question: editQuestion,
      options: editOptions,
      answer: editAnswers,
    });
    setEditing(false);
  };

  const toggleEditAnswer = (optId: string) => {
    setEditAnswers((prev) =>
      prev.includes(optId) ? prev.filter((a) => a !== optId) : [...prev, optId]
    );
  };

  if (!questions.length) return null;

  const attendedCount = questions.filter((q) => q.attended).length;
  const correctCount = questions.filter((q) => q.attended && q.userAnswer && q.userAnswer.length > 0 && q.answer.length === q.userAnswer.length && q.answer.every((a) => q.userAnswer!.includes(a))).length;
  const incorrectCount = attendedCount - correctCount;
  const unattendedCount = questions.length - attendedCount;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <button onClick={() => navigate("/questions")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </button>
        <h2 className="text-sm font-heading font-bold text-foreground mt-2">Questions</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {attendedCount}/{questions.length} attended
        </p>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentIdx(0); setSelected([]); setRevealed(false); setEditing(false); }}
          placeholder="Search questions…"
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {displayList.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => goTo(idx)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors",
              idx === currentIdx ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"
            )}
          >
            <span className="shrink-0 w-5 text-center font-mono">{idx + 1}</span>
            <span className="truncate flex-1">{q.question.substring(0, 50)}{q.question.length > 50 ? "…" : ""}</span>
            {q.attended && q.userAnswer && q.answer.length === q.userAnswer.length && q.answer.every((a) => q.userAnswer!.includes(a)) && <Check className="w-3.5 h-3.5 text-success shrink-0" />}
            {q.attended && q.userAnswer && !(q.answer.length === q.userAnswer.length && q.answer.every((a) => q.userAnswer!.includes(a))) && <X className="w-3.5 h-3.5 text-destructive shrink-0" />}
            {q.flagged && <Flag className="w-3.5 h-3.5 text-accent shrink-0 fill-accent" />}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex-col shrink-0 hidden md:flex overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen min-w-0">
        {/* Toolbar */}
        <header className="flex items-center gap-2 p-3 border-b border-border bg-card flex-wrap">
          {/* Mobile drawer trigger */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors">
                <Menu className="w-4 h-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>

          <button onClick={resetAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset All</span>
          </button>
          <button onClick={toggleShowFlagged} className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
            showFlaggedOnly ? "border-accent bg-accent/10 text-accent" : "border-border bg-background text-foreground hover:bg-muted"
          )}>
            <Flag className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{showFlaggedOnly ? "Show All" : "Show Flagged"}</span>
          </button>
          <button onClick={downloadJson} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors">
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Download</span>
          </button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors">
            <Upload className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Upload</span>
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors">
            <Save className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Save State</span>
          </button>
          <button onClick={() => { setHideAttended((v) => !v); setCurrentIdx(0); setEditing(false); }} className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
            hideAttended ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"
          )}>
            <EyeOff className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{hideAttended ? "Show All" : "Hide Attended"}</span>
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleUpload} />

          <div className="ml-auto flex items-center gap-3 text-xs">
            <span className="text-success font-medium">✓ {correctCount}</span>
            <span className="text-destructive font-medium">✗ {incorrectCount}</span>
            <span className="text-muted-foreground">{unattendedCount} left</span>
            <span className="text-muted-foreground border-l border-border pl-3">{currentIdx + 1}/{displayList.length}</span>
          </div>
        </header>

        {/* Question Area */}
        <div className="flex-1 flex items-start justify-center p-4 md:p-8 overflow-y-auto">
          {current ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-2xl"
              >
                {editing ? (
                  /* ── Edit Mode ── */
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-muted-foreground">Editing Question {currentIdx + 1}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={cancelEdit} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button onClick={saveEdit} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                      </div>
                    </div>

                    {/* Editable question text */}
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Question</label>
                    <textarea
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring mb-5"
                      rows={3}
                    />

                    {/* Editable options */}
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Options</label>
                    <div className="space-y-2.5 mb-5">
                      {editOptions.map((opt, i) => (
                        <div key={opt.id} className="flex items-start gap-3">
                          <span className="shrink-0 w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground mt-1">
                            {opt.id}
                          </span>
                          <input
                            type="text"
                            value={opt.option}
                            onChange={(e) => {
                              const next = [...editOptions];
                              next[i] = { ...next[i], option: e.target.value };
                              setEditOptions(next);
                            }}
                            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Answer selection */}
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Correct Answer(s) — click to toggle</label>
                    <div className="flex flex-wrap gap-2">
                      {editOptions.map((opt) => {
                        const isAnswer = editAnswers.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => toggleEditAnswer(opt.id)}
                            className={cn(
                              "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                              isAnswer
                                ? "border-success bg-success/10 text-success"
                                : "border-border bg-card text-foreground hover:bg-muted"
                            )}
                          >
                            {opt.id}
                            {isAnswer && <Check className="w-3.5 h-3.5 inline ml-1.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* ── Quiz Mode ── */
                  <>
                    {/* Question header */}
                    <div className="flex items-start justify-between gap-3 mb-6">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Question {currentIdx + 1}</span>
                        {isMulti && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                            Select {current.answer.length}
                          </span>
                        )}
                        <h2 className="text-base md:text-lg font-heading font-bold text-foreground mt-1 leading-snug whitespace-pre-wrap break-words">
                          {current.question}
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={startEdit}
                          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Edit question"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={toggleFlag}
                          className={cn(
                            "p-2 rounded-lg border transition-colors",
                            current.flagged
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                          title={current.flagged ? "Unflag" : "Flag this question"}
                        >
                          {current.flagged ? <FlagOff className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5 mb-8">
                      {shuffledOptions.map((opt) => {
                        const isSelected = selected.includes(opt.id);
                        const isCorrect = current.answer.includes(opt.id);
                        const isWrong = revealed && isSelected && !isCorrect;
                        const isRight = revealed && isCorrect;

                        return (
                          <button
                            key={opt.id}
                            onClick={() => toggleSelect(opt.id)}
                            disabled={revealed}
                            className={cn(
                              "w-full flex items-start gap-3 p-4 rounded-xl border text-left text-sm transition-all",
                              !revealed && isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20",
                              !revealed && !isSelected && "border-border bg-card hover:bg-muted",
                              isRight && "border-success bg-success/10 ring-1 ring-success/30",
                              isWrong && "border-destructive bg-destructive/10 ring-1 ring-destructive/30",
                              revealed && !isRight && !isWrong && "border-border bg-card opacity-60"
                            )}
                          >
                            <span className={cn(
                              "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                              !revealed && isSelected && "bg-primary text-primary-foreground",
                              !revealed && !isSelected && "bg-muted text-muted-foreground",
                              isRight && "bg-success text-success-foreground",
                              isWrong && "bg-destructive text-destructive-foreground",
                              revealed && !isRight && !isWrong && "bg-muted text-muted-foreground"
                            )}>
                              {opt.id}
                            </span>
                            <span className="flex-1 pt-0.5 whitespace-pre-wrap break-words">{opt.option}</span>
                            {isRight && <Check className="w-4 h-4 text-success shrink-0 mt-1" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePrev}
                        disabled={currentIdx === 0}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>

                      {!revealed ? (
                        <button
                          onClick={handleReveal}
                          disabled={selected.length === 0}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Eye className="w-4 h-4" /> Reveal Answer
                        </button>
                      ) : (
                        <button
                          onClick={handleNext}
                          disabled={currentIdx >= displayList.length - 1}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-sm text-muted-foreground">No flagged questions found.</p>
              <button onClick={toggleShowFlagged} className="mt-3 text-xs text-primary hover:underline">Show all questions</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;
