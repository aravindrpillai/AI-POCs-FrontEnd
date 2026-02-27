const TypingIndicator = () => (
  <div className="flex gap-3 animate-fade-in">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    </div>
    <div className="bg-bubble-ai shadow-card rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse-dot-1" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse-dot-2" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse-dot-3" />
    </div>
  </div>
);

export default TypingIndicator;
