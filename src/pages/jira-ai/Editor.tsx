import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Settings, Plus, Loader2, CheckCircle2, Video, FileText, Mic, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

/* ── mock AI extraction ── */
const MOCK_CONTENT = `## Overview

As a product owner, I need a comprehensive dashboard that displays real-time analytics data for our e-commerce platform.

## Acceptance Criteria

1. **Sales Overview Widget**
   - Display total revenue for the selected time period
   - Show comparison with previous period (% change)
   - Include a sparkline chart showing daily trends

2. **Order Management Section**
   - List of recent orders with status indicators
   - Quick filters: Pending, Processing, Shipped, Delivered
   - Search by order ID or customer name

3. **Customer Insights**
   - New vs returning customer ratio (pie chart)
   - Top 10 customers by lifetime value
   - Geographic distribution heat map

## Technical Notes

- Use WebSocket for real-time data updates
- Implement lazy loading for the order list
- Cache dashboard data with a 5-minute TTL
- Responsive design: must work on tablet and desktop

## Dependencies

- Analytics API v2 must be deployed first
- Requires access to the customer segmentation service
- Design mockups available in Figma (link: #12345)`;

type IssueType = "epic" | "story" | "task";

const issueLabels: Record<IssueType, string> = {
  epic: "Epic",
  story: "User Story",
  task: "Task",
};

interface ProjectConfig {
  projectName: string;
  projectKey: string;
  assignee: string;
  sprint: string;
  priority: string;
}

const JiraAIEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── state ── */
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [issueType, setIssueType] = useState<IssueType>("story");
  const [configOpen, setConfigOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const [config, setConfig] = useState<ProjectConfig>({
    projectName: "",
    projectKey: "",
    assignee: "",
    sprint: "",
    priority: "Medium",
  });

  /* ── file handling ── */
  const acceptTypes = "video/*,audio/*,.txt,.md,.pdf,.doc,.docx";

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return <Video className="w-5 h-5" />;
    if (file.type.startsWith("audio/")) return <Mic className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const handleFile = useCallback((file: File) => {
    setUploadedFile(file);
    setCreated(false);
    setIsExtracting(true);

    // Mock extraction delay
    setTimeout(() => {
      setContent(MOCK_CONTENT);
      setTitle("E-Commerce Analytics Dashboard");
      setIsExtracting(false);
      toast({ title: "Content extracted", description: "AI has processed your file. You can now edit the content." });
    }, 2000);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setContent("");
    setTitle("");
    setCreated(false);
  };

  /* ── create ticket ── */
  const handleCreate = () => {
    if (!content.trim()) {
      toast({ title: "No content", description: "Please upload a file or write content first.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      setCreated(true);
      toast({ title: "Ticket Created! ✅", description: `${issueLabels[issueType]} "${title}" has been created successfully.` });
    }, 2000);
  };

  /* ── config save ── */
  const saveConfig = () => {
    setConfigOpen(false);
    toast({ title: "Configuration saved", description: `Project: ${config.projectName || "(unnamed)"}` });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── header ── */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/jira-ai")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-heading font-bold text-foreground flex-1">Jira AI Editor</h1>

          <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)} className="gap-1.5">
            <Settings className="w-4 h-4" /> Config
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={isCreating || !content.trim()}
            className="gap-1.5 min-w-[110px]"
          >
            {isCreating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
            ) : created ? (
              <><CheckCircle2 className="w-4 h-4" /> Created!</>
            ) : (
              <><Plus className="w-4 h-4" /> Create Ticket</>
            )}
          </Button>
        </div>
      </header>

      {/* ── body ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {!uploadedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Drop a file here or click to browse</p>
              <p className="text-xs text-muted-foreground">Video, Audio, or Text files supported</p>
            </div>
          ) : (
            <div className="border border-border rounded-2xl p-4 flex items-center gap-3 bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {getFileIcon(uploadedFile)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(uploadedFile.size)}</p>
              </div>
              {isExtracting && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              <button onClick={removeFile} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept={acceptTypes} className="hidden" onChange={handleFileInput} />
        </motion.div>

        {/* extracting indicator */}
        <AnimatePresence>
          {isExtracting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-sm text-primary"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Extracting content from your file…
            </motion.div>
          )}
        </AnimatePresence>

        {/* issue type + title row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="w-full sm:w-44">
            <Select value={issueType} onValueChange={(v) => setIssueType(v as IssueType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="epic">🟣 Epic</SelectItem>
                <SelectItem value="story">🟢 User Story</SelectItem>
                <SelectItem value="task">🔵 Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Ticket title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 text-base font-medium"
          />
        </motion.div>

        {/* text editor */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <Textarea
            placeholder="Your extracted content will appear here. You can also type or paste directly…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[400px] resize-none rounded-2xl text-sm leading-relaxed font-mono whitespace-pre-wrap"
          />
        </motion.div>
      </main>

      {/* ── config modal ── */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Project Configuration</DialogTitle>
            <DialogDescription>Configure the target project details for ticket creation.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="projName">Project Name</Label>
              <Input id="projName" value={config.projectName} onChange={(e) => setConfig((c) => ({ ...c, projectName: e.target.value }))} placeholder="My Project" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="projKey">Project Key</Label>
              <Input id="projKey" value={config.projectKey} onChange={(e) => setConfig((c) => ({ ...c, projectKey: e.target.value }))} placeholder="PROJ" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="assignee">Default Assignee</Label>
              <Input id="assignee" value={config.assignee} onChange={(e) => setConfig((c) => ({ ...c, assignee: e.target.value }))} placeholder="john.doe@company.com" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sprint">Sprint</Label>
              <Input id="sprint" value={config.sprint} onChange={(e) => setConfig((c) => ({ ...c, sprint: e.target.value }))} placeholder="Sprint 14" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select value={config.priority} onValueChange={(v) => setConfig((c) => ({ ...c, priority: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Highest">🔴 Highest</SelectItem>
                  <SelectItem value="High">🟠 High</SelectItem>
                  <SelectItem value="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="Low">🟢 Low</SelectItem>
                  <SelectItem value="Lowest">⚪ Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>Cancel</Button>
            <Button onClick={saveConfig}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JiraAIEditor;
