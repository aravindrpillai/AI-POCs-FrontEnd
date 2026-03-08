import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, FileSearch, Bot, User, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { fetchConversation, sendMessage } from "@/services/fileAnalyserApi";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: { file?: string; chunk?: number }[];
  timestamp: Date;
}

const FileAnalyserChat = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams(); // conv_id
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history on mount
  useEffect(() => {
    if (!sessionId) return;
    fetchConversation(sessionId)
      .then((msgs) => {
        if (msgs.length === 0) {
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: "Your files have been analysed and are ready. Ask me anything about the content.",
            timestamp: new Date(),
          }]);
        } else {
          setMessages(msgs.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            references: m.references ?? [],
            timestamp: new Date(m.created_at),
          })));
        }
      })
      .catch(() => {
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "Your files are ready. Ask me anything about the content.",
          timestamp: new Date(),
        }]);
      })
      .finally(() => setIsLoadingHistory(false));
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping || !sessionId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    try {
      const data = await sendMessage(sessionId, text);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          references: data.references ?? [],
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  if (isLoadingHistory) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button
          onClick={() => navigate("/file-analyser")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <FileSearch className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-heading font-bold text-foreground">File Analyser</h2>
          <p className="text-[11px] text-muted-foreground">Ask questions about your documents</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-bubble-user text-bubble-user-foreground rounded-br-md"
                  : "bg-bubble-ai text-bubble-ai-foreground shadow-card rounded-bl-md"
              }`}
            >
              <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {/* References */}
              {msg.references && msg.references.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border/40 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    📌 References
                  </p>
                  {msg.references.map((ref, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {ref.file && <span className="font-medium">{ref.file}</span>}
                        {ref.chunk !== undefined && <span> — Chunk {ref.chunk + 1}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <span
                className={`text-[10px] mt-1 block ${
                  msg.role === "user" ? "text-bubble-user-foreground/60" : "text-muted-foreground"
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-bubble-ai shadow-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted-foreground/40"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-3 md:p-4">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileAnalyserChat;
