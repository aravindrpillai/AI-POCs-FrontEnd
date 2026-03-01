interface SkillBadgeProps {
  name: string;
  years: number | null;
}

const SkillBadge = ({ name, years }: SkillBadgeProps) => (
  <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground cursor-default">
    <span>{name}</span>
    {years !== null && (
      <span className="rounded-full bg-background/60 px-2 py-0.5 text-xs font-semibold">
        {years}y
      </span>
    )}
  </div>
);

export default SkillBadge;
