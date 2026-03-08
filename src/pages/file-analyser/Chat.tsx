import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, FileSearch, Bot, User, FileText } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: { page?: number; section?: string; file?: string }[];
  timestamp: Date;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const dummyResponses: { answer: string; references: ChatMessage["references"] }[] = [
  {
    answer:
      "Based on the uploaded documents, the main topic discussed is **data processing pipelines** and their role in modern software architecture. The document outlines three core stages: ingestion, transformation, and output.",
    references: [
      { page: 3, section: "Introduction", file: "document.pdf" },
      { page: 7, section: "Architecture Overview", file: "document.pdf" },
    ],
  },
  {
    answer:
      "The document mentions several key benefits:\n\n1. **Scalability** — horizontal scaling through partitioning\n2. **Fault tolerance** — automatic retry mechanisms\n3. **Real-time processing** — sub-second latency for streaming data\n\nThese are covered extensively in Chapter 4.",
    references: [
      { page: 12, section: "Chapter 4 - Benefits", file: "document.pdf" },
      { page: 15, section: "4.3 Performance Metrics", file: "document.pdf" },
    ],
  },
  {
    answer:
      "According to the uploaded file, the recommended approach is to use a **message queue** (such as RabbitMQ or Kafka) between the ingestion and transformation layers. This decouples the components and improves reliability.",
    references: [
      { page: 22, section: "5.2 Decoupling Strategies", file: "technical-guide.pdf" },
    ],
  },
  {
    answer:
      "The document doesn't explicitly cover that topic. However, in the **appendix**, there's a brief mention of security considerations including:\n\n- Encryption at rest\n- TLS for data in transit\n- Role-based access control\n\nYou may want to consult the referenced external resources for more detail.",
    references: [
      { page: 45, section: "Appendix B - Security", file: "document.pdf" },
    ],
  },
  {
    answer:
      "Great question! The comparison table on **page 30** shows the performance benchmarks across different configurations. The optimized setup achieved **3x throughput** compared to the baseline, with the tradeoff being slightly higher memory usage.",
    references: [
      { page: 30, section: "6.1 Benchmark Results", file: "document.pdf" },
      { page: 31, section: "Table 6.2", file: "document.pdf" },
    ],
  },
];

const FileAnalyserChat = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Your files have been vectorised and are ready for analysis. Ask me anything about the content — I'll provide answers with exact page references and citations.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  let responseIndex = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

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

    // Try real API, fallback to dummy
    try {
      const res = await fetch(`${BASE_URL}/file-analyser/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer || data.content || "I couldn't find relevant information.",
          references: data.references || [],
          timestamp: new Date(),
        },
      ]);
    } catch {
      // Fallback
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
      const dummy = dummyResponses[responseIndex.current % dummyResponses.length];
      responseIndex.current++;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: dummy.answer,
          references: dummy.references,
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
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[11px] text-muted-foreground"
                    >
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {ref.file && <span className="font-medium">{ref.file}</span>}
                        {ref.page && <span> — Page {ref.page}</span>}
                        {ref.section && <span> — {ref.section}</span>}
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
