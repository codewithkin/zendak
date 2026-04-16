"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@zendak/ui/components/button";
import { Badge } from "@zendak/ui/components/badge";
import {
  Card,
  CardContent,
} from "@zendak/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Skeleton } from "@zendak/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@zendak/ui/components/table";
import {
  AddCircleIcon,
  CheckmarkCircle02Icon,
  Invoice01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import {
  useTrips,
  useCreateTrip,
  useStartTrip,
  useCompleteTrip,
  useSettleTrip,
  type Trip,
  type CreateTripInput,
} from "@/hooks/use-trips";
import { useDrivers } from "@/hooks/use-drivers";
import { useTrucks } from "@/hooks/use-trucks";

const tripStatusVariant: Record<Trip["status"], "secondary" | "default" | "success" | "outline"> = {
  PLANNED: "secondary",
  ACTIVE: "default",
  COMPLETED: "success",
  SETTLED: "outline",
};

export default function TripsPage() {
  const { trips, isLoading, refetch } = useTrips();
  const { createTrip, isLoading: creating } = useCreateTrip();
  const { startTrip } = useStartTrip();
  const { completeTrip } = useCompleteTrip();
  const { settleTrip } = useSettleTrip();
  const { drivers } = useDrivers();
  const { trucks } = useTrucks();

  const [addOpen, setAddOpen] = useState(false);

  // Form state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [driverId, setDriverId] = useState("");
  const [truckId, setTruckId] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");

  function resetForm() {
    setOrigin("");
    setDestination("");
    setDriverId("");
    setTruckId("");
    setDistance("");
    setNotes("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const input: CreateTripInput = { origin, destination, driverId, truckId };
    if (distance) input.distance = Number.parseFloat(distance);
    if (notes) input.notes = notes;
    try {
      await createTrip(input);
      toast.success("Trip created");
      resetForm();
      setAddOpen(false);
      refetch();
    } catch {
      toast.error("Failed to create trip");
    }
  }

  async function handleStart(id: string) {
    try {
      await startTrip(id);
      toast.success("Trip started");
      refetch();
    } catch {
      toast.error("Failed to start trip");
    }
  }

  async function handleComplete(id: string) {
    try {
      await completeTrip(id);
      toast.success("Trip completed");
      refetch();
    } catch {
      toast.error("Failed to complete trip");
    }
  }

  async function handleSettle(id: string) {
    try {
      await settleTrip(id);
      toast.success("Trip settled");
      refetch();
    } catch {
      toast.error("Failed to settle trip");
    }
  }

  const availableTrucks = trucks.filter((t) => t.status === "AVAILABLE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Trips</h1>
          <p className="text-xs text-muted-foreground">
            Schedule routes, track movement, and close each delivery cleanly.
          </p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger>
            <Button size="sm">
              <Icon icon={AddCircleIcon} className="size-3.5" />
              Create Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Trip</DialogTitle>
                <DialogDescription>
                  Build a new route with the right driver, truck, and delivery context.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="City A"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
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
                  <Label htmlFor="distance">Distance (km, optional)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="500"
                    min={0}
                    step="0.1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
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
      </div>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No trips are scheduled yet. Create your first route to start moving freight.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.origin}</TableCell>
                    <TableCell>{trip.destination}</TableCell>
                    <TableCell>{trip.driver.user.name}</TableCell>
                    <TableCell>{trip.truck.plateNumber}</TableCell>
                    <TableCell>
                      <Badge variant={tripStatusVariant[trip.status]}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {trip.status === "PLANNED" && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleStart(trip.id)}
                            title="Start trip"
                          >
                            <Icon icon={PlayIcon} className="size-3" />
                          </Button>
                        )}
                        {trip.status === "ACTIVE" && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleComplete(trip.id)}
                            title="Complete trip"
                          >
                            <Icon icon={CheckmarkCircle02Icon} className="size-3" />
                          </Button>
                        )}
                        {trip.status === "COMPLETED" && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleSettle(trip.id)}
                            title="Settle trip"
                          >
                            <Icon icon={Invoice01Icon} className="size-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
