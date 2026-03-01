import { Briefcase } from "lucide-react";

interface ExperienceCardProps {
  company: string;
  role: string;
  start: string;
  end: string;
  highlights: string[];
}

const ExperienceCard = ({ company, role, start, end, highlights }: ExperienceCardProps) => (
  <div className="relative flex gap-4 pb-8 last:pb-0 group">
    {/* Timeline line */}
    <div className="flex flex-col items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-first:bg-primary group-first:text-primary-foreground">
        <Briefcase className="h-4 w-4" />
      </div>
      <div className="w-px flex-1 bg-border group-last:hidden" />
    </div>
    {/* Content */}
    <div className="flex-1 pb-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h4 className="font-semibold text-foreground">{role}</h4>
        <span className="text-sm text-muted-foreground">at {company}</span>
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">
        {start} — {end}
      </p>
      {highlights.length > 0 && (
        <ul className="mt-3 space-y-1">
          {highlights.map((h, i) => (
            <li key={i} className="text-sm text-muted-foreground leading-relaxed">
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default ExperienceCard;
