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
  useCreateDriver,
  type CreateDriverInput,
} from "@/hooks/use-drivers";

interface AddDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddDriverDialog({ open, onOpenChange, onSuccess }: AddDriverDialogProps) {
  const { createDriver, isLoading: creating } = useCreateDriver();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [phone, setPhone] = useState("");

  function reset() {
    setName("");
    setEmail("");
    setLicenseNo("");
    setPhone("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: CreateDriverInput = { name, email, licenseNo };
    if (phone) input.phone = phone;
    try {
      await createDriver(input);
      toast.success("Driver created");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create driver");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Driver</DialogTitle>
            <DialogDescription>
              Create a new driver profile. A secure password will be auto-generated and sent to their email.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="driver-name">Full Name</Label>
              <Input
                id="driver-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="driver-email">Email</Label>
              <Input
                id="driver-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="driver-licenseNo">License Number</Label>
              <Input
                id="driver-licenseNo"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                placeholder="DL-12345"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="driver-phone">Phone (optional)</Label>
              <Input
                id="driver-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <DialogClose>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
