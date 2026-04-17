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
  useCreateTruck,
  type CreateTruckInput,
} from "@/hooks/use-trucks";

interface AddTruckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddTruckDialog({ open, onOpenChange, onSuccess }: AddTruckDialogProps) {
  const { createTruck, isLoading: creating } = useCreateTruck();

  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  function reset() {
    setPlateNumber("");
    setModel("");
    setYear("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: CreateTruckInput = { plateNumber, model };
    if (year) input.year = Number.parseInt(year, 10);
    try {
      await createTruck(input);
      toast.success("Truck added");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add truck");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Truck</DialogTitle>
            <DialogDescription>
              Register another truck in your Zendak fleet roster.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="mb-4 space-y-1.5">
              <Label htmlFor="truck-plateNumber">Plate Number</Label>
              <Input
                id="truck-plateNumber"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="ABC-1234"
                required
              />
            </div>
            <div className="mb-4 space-y-1.5">
              <Label htmlFor="truck-model">Model</Label>
              <Input
                id="truck-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Volvo FH16"
                required
              />
            </div>
            <div className="mb-4 space-y-1.5">
              <Label htmlFor="truck-year">Year (optional)</Label>
              <Input
                id="truck-year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                min={1900}
                max={2100}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <DialogClose>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={creating}>
              {creating ? "Adding…" : "Add Truck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
