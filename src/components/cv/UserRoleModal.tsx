import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type UserRole = "HR" | "Manager" | "Technical Lead";

interface UserRoleModalProps {
  open: boolean;
  onClose: () => void;
  currentRole: UserRole | null;
  onSelect: (role: UserRole) => void;
}

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: "HR", label: "HR", description: "Human Resources — manage hiring pipeline" },
  { value: "Manager", label: "Manager", description: "Hiring Manager — review & approve candidates" },
  { value: "Technical Lead", label: "Technical Lead", description: "Tech Lead — evaluate technical skills" },
];

const UserRoleModal = ({ open, onClose, currentRole, onSelect }: UserRoleModalProps) => {
  const [selected, setSelected] = useState<UserRole | null>(currentRole);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Your Role</DialogTitle>
          <DialogDescription>Choose the role you're reviewing this candidate as.</DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selected ?? ""}
          onValueChange={(v) => setSelected(v as UserRole)}
          className="space-y-3 mt-2"
        >
          {roles.map((r) => (
            <Label
              key={r.value}
              htmlFor={r.value}
              className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value={r.value} id={r.value} />
              <div>
                <p className="font-medium text-foreground">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selected}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserRoleModal;
