"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@zendak/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@zendak/ui/components/dialog";
import { Input } from "@zendak/ui/components/input";
import { Label } from "@zendak/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zendak/ui/components/select";

import { useInviteUser, type InviteUserInput } from "@/hooks/use-users";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ROLE_OPTIONS: { value: InviteUserInput["role"]; label: string; description: string }[] = [
  { value: "ADMIN", label: "Admin", description: "Full workspace access" },
  { value: "OPERATIONS", label: "Operations", description: "Manage trucks, drivers and trips" },
  { value: "ACCOUNTANT", label: "Accountant", description: "View expenses and finance" },
  { value: "DRIVER", label: "Driver", description: "View own trips" },
];

export function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
  const { inviteUser, isLoading: inviting } = useInviteUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteUserInput["role"] | "">("");

  function reset() {
    setName("");
    setEmail("");
    setRole("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    const input: InviteUserInput = { name, email, role };
    try {
      await inviteUser(input);
      toast.success(`Invite sent to ${email}`);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send invite";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invite to your Zendak workspace. They'll receive an email with their login credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="mb-4 space-y-1.5">
              <Label htmlFor="invite-name">Full Name</Label>
              <Input
                id="invite-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                required
              />
            </div>
            <div className="mb-4 space-y-1.5">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
              />
            </div>
            <div className="mb-4 space-y-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as InviteUserInput["role"])}
                required
              >
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="font-medium">{opt.label}</span>
                      <span className="ml-1.5 text-muted-foreground text-xs">— {opt.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <DialogClose>
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={inviting}>
              {inviting ? "Sending invite…" : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
