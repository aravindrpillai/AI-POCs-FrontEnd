import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, ArrowLeft, ArrowRight, Upload, X, FileText, Image as ImageIcon, Loader2
} from "lucide-react";
import { PatientIntake, MedCategory, Gender, CATEGORIES } from "@/types/medai";
import { medaiApi } from "@/services/medaiApi";

type IntakeStep = 'category' | 'gender' | 'metrics' | 'problem';

const Diagnostics = () => {
  const navigate = useNavigate();

  const [intakeStep, setIntakeStep] = useState<IntakeStep>('category');
  const [category, setCategory] = useState<MedCategory | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [problem, setProblem] = useState('');
  const [intakeFiles, setIntakeFiles] = useState<File[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIntakeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIntakeFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const removeIntakeFile = (idx: number) => setIntakeFiles(prev => prev.filter((_, i) => i !== idx));

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
      // Store intake context for conversation page
      sessionStorage.setItem(`medai-intake-${res.conv_id}`, JSON.stringify({
        category, gender, age, problem,
        initialReply: res.reply,
      }));
      // Navigate to conversation
      navigate(`/med-ai/diagnose/${res.conv_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to start diagnosis");
    } finally {
      setIsStarting(false);
    }
  }, [category, gender, age, height, weight, problem, intakeFiles, navigate]);

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
                  placeholder="e.g. I've been experiencing sharp pain in my lower back for about 2 weeks now, especially when I bend forward..."
                  rows={6}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-info/30 focus:border-info transition-all leading-relaxed"
                />

                {/* File upload */}
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-info/40 text-sm text-info hover:bg-info/5 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Attach reports / images
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleIntakeFiles}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />

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
};

export default Diagnostics;
