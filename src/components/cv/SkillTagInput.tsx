import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SkillTagInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

const SkillTagInput = ({ skills, onChange }: SkillTagInputProps) => {
  const [input, setInput] = useState("");

  const addSkill = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === "Backspace" && !input && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
      {skills.map((skill, i) => (
        <span
          key={skill}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
        >
          {skill}
          <button
            onClick={() => removeSkill(i)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={skills.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
        className="flex-1 min-w-[120px] border-0 p-0 shadow-none focus-visible:ring-0 h-8"
      />
    </div>
  );
};

export default SkillTagInput;
