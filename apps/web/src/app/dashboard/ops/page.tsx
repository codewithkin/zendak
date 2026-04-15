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
import {
  TruckIcon,
  CheckCircleIcon,
  NavigationIcon,
  WrenchIcon,
} from "lucide-react";

import { useTrucks } from "@/hooks/use-trucks";
import { useTrips, type Trip } from "@/hooks/use-trips";

const tripStatusVariant: Record<Trip["status"], "secondary" | "default" | "success" | "outline"> = {
  PLANNED: "secondary",
  ACTIVE: "default",
  COMPLETED: "success",
  SETTLED: "outline",
};

export default function OpsDashboard() {
  const { trucks, isLoading: trucksLoading } = useTrucks();
  const { trips, isLoading: tripsLoading } = useTrips();

  const available = trucks.filter((t) => t.status === "AVAILABLE").length;
  const inTransit = trucks.filter((t) => t.status === "IN_TRANSIT").length;
  const maintenance = trucks.filter((t) => t.status === "MAINTENANCE").length;
  const activeTrips = trips.filter((t) => t.status === "ACTIVE" || t.status === "PLANNED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Operations Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Fleet management, trip scheduling, and driver assignments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Trucks
            </CardTitle>
            <TruckIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {trucksLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{trucks.length}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Available
            </CardTitle>
            <CheckCircleIcon className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {trucksLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{available}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              In Transit
            </CardTitle>
            <NavigationIcon className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {trucksLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{inTransit}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Maintenance
            </CardTitle>
            <WrenchIcon className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {trucksLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{maintenance}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active &amp; Planned Trips</CardTitle>
        </CardHeader>
        <CardContent>
          {tripsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : activeTrips.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No active or planned trips
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTrips.map((trip) => (
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
