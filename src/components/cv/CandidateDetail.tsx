import ScoreRing from "@/components/cv/ScoreRing";
import SkillBadge from "@/components/cv/SkillBadge";
import ExperienceCard from "@/components/cv/ExperienceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICandidateBase, ICandidate_LLM_Data } from "@/interfaces/ICandidate";
import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Star, Award, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

type CandidateDetailProps = {
  candidate: ICandidateBase;
};

const CandidateDetail = ({ candidate }: CandidateDetailProps) => {
  const navigate = useNavigate();
  const [selectedLLMData, setSelectedLLMData] = useState<ICandidate_LLM_Data | null>(null);

  useEffect(() => {
    setSelectedLLMData(candidate.openai ?? candidate.ollama ?? null);
  }, [candidate]);

  const initials = useMemo(() => {
    const name = (candidate?.name ?? "").trim();
    if (!name) return "??";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 3);
  }, [candidate?.name]);

  const totalExp = candidate?.total_exp ?? 0; // adjust if your ICandidateBase uses different field
  const rankingScore = selectedLLMData?.ranking_score ?? 0;

  return (
    <div className="space-y-5 overflow-y-auto">
      {/* Profile header */}
      <Card style={{ boxShadow: "var(--shadow-elevated)" }}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              {initials}
            </div>

            <div className="flex-1 space-y-2">

              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                {candidate?.name}

                {candidate?.id && (
                  <ExternalLink
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => navigate(`/profile/${candidate.id}`)}
                  />
                )}
              </h2>


              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {candidate?.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {candidate?.mobile}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Star className="h-3.5 w-3.5" /> {totalExp} years experience
              </div>
            </div>

            <ScoreRing score={rankingScore} />
          </div>
        </CardContent>
      </Card>

      {/* AI Assessment */}
      <Card>
        <CardContent className="p-5">
          {selectedLLMData?.ranking_reason ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">AI Assessment: </span>
              {selectedLLMData.ranking_reason}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No AI assessment available.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Skills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(selectedLLMData?.skills ?? []).length ? (
              (selectedLLMData?.skills ?? []).map((skill, i) => (
                <SkillBadge key={`${skill.name}-${i}`} name={skill.name} years={skill.years} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No skills available.</p>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(selectedLLMData?.certifications ?? []).length ? (
              (selectedLLMData?.certifications ?? []).map((cert, i) => (
                <div key={`${cert.name}-${i}`} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Award className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{cert.name}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No certifications available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Experience */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(selectedLLMData?.experiences ?? []).length ? (
            (selectedLLMData?.experiences ?? []).map((exp, i) => (
              <ExperienceCard key={`${exp.company}-${exp.start}-${i}`} {...exp} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">No experience available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateDetail;
