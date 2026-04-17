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

import { SearchSelect } from "@/components/search-select";
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create trip");
    }
  }

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
          <div className="mt-6 space-y-4">
            <div className="mb-4 space-y-1.5">
              <Label htmlFor="trip-origin">Origin</Label>
              <Input
                id="trip-origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="City A"
                required
              />
            </div>
            <div className="mb-4 space-y-1.5">
              <Label htmlFor="trip-destination">Destination</Label>
              <Input
                id="trip-destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="City B"
                required
              />
            </div>
            <div className="mb-4 space-y-1.5">
              <Label>Driver</Label>
              <SearchSelect<{ id: string; user: { name: string } }>
                value={driverId}
                onChange={setDriverId}
                endpoint="/api/drivers/search"
                placeholder="Select a driver"
                getLabel={(d) => d.user.name}
                getValue={(d) => d.id}
                required
              />
            </div>
            <div className="mb-4 space-y-1.5">
              <Label>Truck</Label>
              <SearchSelect<{ id: string; plateNumber: string; model: string }>
                value={truckId}
                onChange={setTruckId}
                endpoint="/api/trucks/search"
                placeholder="Select a truck"
                getLabel={(t) => `${t.plateNumber} — ${t.model}`}
                getValue={(t) => t.id}
                extraParams={{ status: "AVAILABLE" }}
                required
              />
            </div>
            <div className="mb-4 space-y-1.5">
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
            <div className="mb-4 space-y-1.5">
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
