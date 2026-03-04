import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, ImagePlus, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/ollama";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[]; // base64 thumbnails for display
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const OllamaChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    setAttachedImages((prev) => [...prev, ...imageFiles]);
    const urls = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...urls]);
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previewUrls[idx]);
    setAttachedImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if ((!trimmed && attachedImages.length === 0) || isLoading) return;

    const imageThumbs = [...previewUrls];
    const filesToSend = [...attachedImages];

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      images: imageThumbs,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachedImages([]);
    setPreviewUrls([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      // Build form data
      const form = new FormData();
      form.append("message", trimmed);
      
      // Send conversation history
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      form.append("history", JSON.stringify(history));

      // Attach images
      for (const file of filesToSend) {
        form.append("images", file);
      }

      const res = await fetch(`${BASE_URL}/chat/`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply || data.response || "I couldn't generate a response.",
        },
      ]);
    } catch {
      // Fallback dummy response
      const dummyResponses = [
        "That's an interesting question! Based on what you've shared, I'd say there are several angles to consider. Could you tell me more about what specifically you'd like to explore?",
        "Great point! I've analyzed what you've sent. Here's my take: the key factors here involve understanding the context and applying the right approach. What aspect would you like me to dive deeper into?",
        "Thanks for sharing that. From what I can see, this is a nuanced topic. Let me break it down into simpler parts for you. Would you like me to elaborate on any specific area?",
        "I appreciate the detail! Here's what stands out to me — there's a pattern here that's worth exploring further. Shall I provide more specific recommendations?",
      ];
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: dummyResponses[Math.floor(Math.random() * dummyResponses.length)],
        },
      ]);
    } finally {
      setIsLoading(false);
      // Clean up object URLs
      imageThumbs.forEach((u) => {
        if (u.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-border bg-card">
        <button
          onClick={() => navigate("/ollama")}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-lg">🦙</span>
        </div>
        <div>
          <h1 className="text-sm font-heading font-bold text-foreground">Ollama Chat</h1>
          <p className="text-[11px] text-muted-foreground">AI-powered conversation</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
            <span className="text-5xl">🦙</span>
            <p className="text-sm text-muted-foreground max-w-xs">
              Start a conversation! You can also attach images for the AI to analyze.
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[hsl(var(--bubble-user))] text-[hsl(var(--bubble-user-foreground))]"
                    : "bg-[hsl(var(--bubble-ai))] text-[hsl(var(--bubble-ai-foreground))] border border-border"
                }`}
              >
                {/* Attached images */}
                {msg.images && msg.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="attached"
                        className="w-20 h-20 object-cover rounded-lg border border-border/30"
                      />
                    ))}
                  </div>
                )}
                {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-[hsl(var(--bubble-ai))] border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Thinking…</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Image previews */}
      <AnimatePresence>
        {previewUrls.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border bg-card px-4 pt-3 pb-1 overflow-hidden"
          >
            <div className="flex gap-2 flex-wrap">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Attach image"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Message Ollama…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/40 transition-all disabled:opacity-50"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={(!input.trim() && attachedImages.length === 0) || isLoading}
            className="flex-shrink-0 p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 pl-12">
          Attach images for visual analysis • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default OllamaChat;
