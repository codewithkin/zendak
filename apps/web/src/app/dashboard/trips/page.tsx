"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@zendak/ui/components/button";
import { Badge } from "@zendak/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@zendak/ui/components/card";
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
  MapsLocation01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import {
  useTrips,
  useStartTrip,
  useCompleteTrip,
  useSettleTrip,
  type Trip,
} from "@/hooks/use-trips";
import { CreateTripDialog } from "@/components/dialogs/create-trip-dialog";

const TRIP_STATUSES: Trip["status"][] = ["PLANNED", "ACTIVE", "COMPLETED", "SETTLED"];

const tripStatusVariant: Record<Trip["status"], "secondary" | "default" | "success" | "outline"> = {
  PLANNED: "secondary",
  ACTIVE: "default",
  COMPLETED: "success",
  SETTLED: "outline",
};

export default function TripsPage() {
  const { trips, isLoading, refetch } = useTrips();
  const { startTrip } = useStartTrip();
  const { completeTrip } = useCompleteTrip();
  const { settleTrip } = useSettleTrip();

  const [addOpen, setAddOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Trip["status"] | "">("");

  const planned = trips.filter((t) => t.status === "PLANNED").length;
  const active = trips.filter((t) => t.status === "ACTIVE").length;
  const completed = trips.filter((t) => t.status === "COMPLETED").length;
  const settled = trips.filter((t) => t.status === "SETTLED").length;

  const filteredTrips = filterStatus
    ? trips.filter((t) => t.status === filterStatus)
    : trips;

  async function handleStart(id: string) {
    try {
      await startTrip(id);
      toast.success("Trip started");
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start trip");
    }
  }

  async function handleComplete(id: string) {
    try {
      await completeTrip(id);
      toast.success("Trip completed");
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to complete trip");
    }
  }

  async function handleSettle(id: string) {
    try {
      await settleTrip(id);
      toast.success("Trip settled");
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to settle trip");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Trips</h1>
          <p className="text-sm text-muted-foreground">
            Schedule routes, track movement, and close each delivery cleanly.
          </p>
        </div>

        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Icon icon={AddCircleIcon} className="size-3.5" />
          Create Trip
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Planned
            </CardTitle>
            <Icon icon={MapsLocation01Icon} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{planned}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{active}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{completed}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Settled
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{settled}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-3">
        <div className="w-48">
          <Select
            value={filterStatus}
            onValueChange={(v: string | null) => setFilterStatus((v ?? "") as Trip["status"] | "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {TRIP_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : filteredTrips.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              {filterStatus
                ? `No trips with status "${filterStatus}".`
                : "No trips are scheduled yet. Create your first route to start moving freight."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">
                      {trip.origin} → {trip.destination}
                    </TableCell>
                    <TableCell>{trip.driver.user.name}</TableCell>
                    <TableCell>{trip.truck.plateNumber}</TableCell>
                    <TableCell>
                      <Badge variant={tripStatusVariant[trip.status]}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(trip.createdAt).toLocaleDateString()}
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

      {/* Create Trip Dialog (shared with dashboard quick actions) */}
      <CreateTripDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
