import { useState, useMemo } from "react";
import { Search, ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SkillTagInput from "@/components/cv/SkillTagInput";
import CandidateListItem from "@/components/cv/CandidateListItem";
import CandidateDetail from "@/components/cv/CandidateDetail";
import { fetchCandidates } from "@/services/CandidatesAPI";
import type { ICandidateBase } from "@/interfaces/ICandidate";


const SearchCandidates = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [minExperience, setMinExperience] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState<ICandidateBase | null>(null);
  const [candidates, setCandidates] = useState<ICandidateBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = useMemo(() => {
    const hasSkills = skills.some((s) => s.trim().length > 0);
    const hasExp = minExperience.trim() !== "" && Number(minExperience) >= 0;
    return hasSkills || hasExp;
  }, [skills, minExperience]);

  const handleSearch = async () => {
    // Don't call API if no filters
    if (!hasFilters) {
      setError("Please add at least one filter (skills or min experience) before searching.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const skillParam = skills.map((s) => s.trim()).filter(Boolean).join(",");
      const expParam = minExperience.trim();

      const data = await fetchCandidates({
        skills: skillParam || undefined,
        exp: expParam || undefined,
      });

      setCandidates(data ?? []);

      setCandidates(data ?? []);
      setSelectedCandidate((data && data.length > 0) ? data[0] : null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  // Now filteredCandidates is simply what API returns
  const filteredCandidates = candidates;

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--gradient-surface)" }}>
      {/* Top bar */}
      <header className="shrink-0 border-b bg-card px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
              <Search className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Search Candidates</h1>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="shrink-0 border-b bg-card px-4 py-4 md:px-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Skills</label>
            <SkillTagInput skills={skills} onChange={setSkills} />
          </div>

          <div className="w-full md:w-48">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min. Experience (years)</label>
            <Input
              type="number"
              placeholder="e.g. 5"
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
              min={0}
              className="bg-card"
            />
          </div>

          {/* ✅ Search button at the end */}
          <div className="w-full md:w-auto flex items-end">
            <Button
              className="h-10 gap-2 w-full md:w-auto"
              onClick={handleSearch}
              disabled={loading || !hasFilters}
              title={!hasFilters ? "Add a filter to enable search" : "Search"}
            >
              <Search className="h-4 w-4" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Results */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - candidate list */}
        <div className="w-full md:w-[380px] shrink-0 border-r overflow-y-auto p-3 space-y-2">
          <div className="flex items-center gap-2 px-1 pb-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {!hasFilters && filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Add filters and click Search</p>
              <p className="text-xs text-muted-foreground/60 mt-1">We won’t call the API until you do.</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No candidates match your filters</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting skills or experience</p>
            </div>
          ) : (
            filteredCandidates.map((c) => (
              <CandidateListItem
                key={c.id}
                candidate={c}
                isSelected={selectedCandidate?.id === c.id}
                onClick={() => setSelectedCandidate(c)}
              />
            ))
          )}
        </div>

        {/* Right panel - detail */}
        <div className="hidden md:flex flex-1 overflow-y-auto p-5">
          {selectedCandidate ? (
            <div className="w-full">
              <CandidateDetail candidate={selectedCandidate} />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center">
              <div>
                <Users className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Select a candidate</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Click on a candidate from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchCandidates;
