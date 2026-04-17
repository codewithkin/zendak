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

import { useDrivers } from "@/hooks/use-drivers";
import { useTrucks } from "@/hooks/use-trucks";
import {
  useCreateTrip,
  type CreateTripInput,
} from "@/hooks/use-trips";

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateTripDialog({ open, onOpenChange, onSuccess }: CreateTripDialogProps) {
  const { createTrip, isLoading: creating } = useCreateTrip();
  const { drivers } = useDrivers();
  const { trucks } = useTrucks();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [driverId, setDriverId] = useState("");
  const [truckId, setTruckId] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setOrigin("");
    setDestination("");
    setDriverId("");
    setTruckId("");
    setDistance("");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: CreateTripInput = { origin, destination, driverId, truckId };
    if (distance) input.distance = Number.parseFloat(distance);
    if (notes) input.notes = notes;
    try {
      await createTrip(input);
      toast.success("Trip created");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to create trip");
    }
  }

  const availableTrucks = trucks.filter((t) => t.status === "AVAILABLE");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Trip</DialogTitle>
            <DialogDescription>
              Build a new route with the right driver, truck, and delivery context.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="trip-origin">Origin</Label>
              <Input
                id="trip-origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="City A"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-destination">Destination</Label>
              <Input
                id="trip-destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="City B"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Driver</Label>
              <Select value={driverId} onValueChange={(v: string | null) => setDriverId(v ?? "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Truck</Label>
              <Select value={truckId} onValueChange={(v: string | null) => setTruckId(v ?? "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a truck" />
                </SelectTrigger>
                <SelectContent>
                  {availableTrucks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.plateNumber} — {t.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-distance">Distance (km, optional)</Label>
              <Input
                id="trip-distance"
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="500"
                min={0}
                step="0.1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-notes">Notes (optional)</Label>
              <Input
                id="trip-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <DialogClose>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
