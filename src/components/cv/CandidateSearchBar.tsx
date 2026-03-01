import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { mockCandidates } from "@/services/CandidatesAPI";

const CandidateSearchBar = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filtered = query.trim()
    ? mockCandidates.filter((c) =>
        (c.name ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search candidates..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          className="pl-9 h-9"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg overflow-hidden">
          {filtered.map((c, i) => (
            <button
              key={i}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-3"
              onClick={() => {
                const idx = mockCandidates.indexOf(c);
                navigate(`/cv/profile/${idx}`);
                setQuery("");
                setOpen(false);
              }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                {(c.name ?? "").split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg p-4 text-sm text-muted-foreground text-center">
          No candidates found
        </div>
      )}
    </div>
  );
};

export default CandidateSearchBar;
