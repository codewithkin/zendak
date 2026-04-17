"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@zendak/ui/components/card";
import { Badge } from "@zendak/ui/components/badge";
import { Button } from "@zendak/ui/components/button";
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
  CheckmarkCircle02Icon,
  DeliveryTruck02Icon,
  MapsLocation01Icon,
  ToolboxIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import { useTrucks } from "@/hooks/use-trucks";
import { useTrips, type Trip } from "@/hooks/use-trips";
import { AddDriverDialog } from "@/components/dialogs/add-driver-dialog";
import { AddTruckDialog } from "@/components/dialogs/add-truck-dialog";
import { CreateTripDialog } from "@/components/dialogs/create-trip-dialog";

const tripStatusVariant: Record<Trip["status"], "secondary" | "default" | "success" | "outline"> = {
  PLANNED: "secondary",
  ACTIVE: "default",
  COMPLETED: "success",
  SETTLED: "outline",
};

export default function OpsDashboard() {
  const { trucks, isLoading: trucksLoading } = useTrucks();
  const { trips, isLoading: tripsLoading } = useTrips();

  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [addTruckOpen, setAddTruckOpen] = useState(false);
  const [createTripOpen, setCreateTripOpen] = useState(false);

  const available = trucks.filter((t) => t.status === "AVAILABLE").length;
  const inTransit = trucks.filter((t) => t.status === "IN_TRANSIT").length;
  const maintenance = trucks.filter((t) => t.status === "MAINTENANCE").length;
  const activeTrips = trips.filter((t) => t.status === "ACTIVE" || t.status === "PLANNED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Fleet Operations</h1>
        <p className="text-sm text-muted-foreground">
          Watch dispatch readiness, live movement, and maintenance pressure across the fleet.
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddDriverOpen(true)}
            >
              <Icon icon={UserGroupIcon} size={14} className="text-muted-foreground" />
              Add Driver
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddTruckOpen(true)}
            >
              <Icon icon={DeliveryTruck02Icon} size={14} className="text-muted-foreground" />
              Add Truck
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreateTripOpen(true)}
            >
              <Icon icon={MapsLocation01Icon} size={14} className="text-muted-foreground" />
              Create Trip
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Trucks
            </CardTitle>
            <Icon icon={DeliveryTruck02Icon} className="text-muted-foreground" />
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
            <Icon icon={CheckmarkCircle02Icon} className="text-emerald-500" />
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
            <Icon icon={MapsLocation01Icon} className="text-blue-500" />
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
            <Icon icon={ToolboxIcon} className="text-amber-500" />
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
          <CardTitle>Dispatch Queue</CardTitle>
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
              No active or planned trips are waiting in dispatch.
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

      <AddDriverDialog open={addDriverOpen} onOpenChange={setAddDriverOpen} />
      <AddTruckDialog open={addTruckOpen} onOpenChange={setAddTruckOpen} />
      <CreateTripDialog open={createTripOpen} onOpenChange={setCreateTripOpen} />
    </div>
  );
}
