"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@zendak/ui/components/card";
import { Badge } from "@zendak/ui/components/badge";
import { Skeleton } from "@zendak/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@zendak/ui/components/table";
import { MapIcon, PlayIcon, CheckIcon, ClockIcon } from "lucide-react";

import { useTrips, type Trip } from "@/hooks/use-trips";

const tripStatusVariant: Record<Trip["status"], "secondary" | "default" | "success" | "outline"> = {
  PLANNED: "secondary",
  ACTIVE: "default",
  COMPLETED: "success",
  SETTLED: "outline",
};

export default function DriverDashboard() {
  const { trips, isLoading } = useTrips();

  const active = trips.filter((t) => t.status === "ACTIVE").length;
  const planned = trips.filter((t) => t.status === "PLANNED").length;
  const completed = trips.filter(
    (t) => t.status === "COMPLETED" || t.status === "SETTLED",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Driver Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Your assigned trips, truck status, and activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Trips
            </CardTitle>
            <MapIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{trips.length}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active
            </CardTitle>
            <PlayIcon className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{active}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Planned
            </CardTitle>
            <ClockIcon className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{planned}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckIcon className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{completed}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Trips</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No trips assigned
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.origin}</TableCell>
                    <TableCell>{trip.destination}</TableCell>
                    <TableCell>{trip.truck.plateNumber}</TableCell>
                    <TableCell>
                      <Badge variant={tripStatusVariant[trip.status]}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(trip.createdAt).toLocaleDateString()}
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
