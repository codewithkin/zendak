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
  ChartUpIcon,
  CoinsDollarIcon,
  DeliveryTruck02Icon,
  Invoice01Icon,
  MapsLocation01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import { useDashboardStats } from "@/hooks/use-dashboard";
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function AdminDashboard() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { trips, isLoading: tripsLoading } = useTrips();

  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [addTruckOpen, setAddTruckOpen] = useState(false);
  const [createTripOpen, setCreateTripOpen] = useState(false);

  const recentTrips = trips.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Executive Command Center</h1>
        <p className="text-xs text-muted-foreground">
          Track the fleet, trip flow, and operating margin from one Zendak workspace.
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Trips
            </CardTitle>
            <Icon icon={MapsLocation01Icon} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold">{stats?.tripCount ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <Icon icon={CoinsDollarIcon} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-xl font-bold">
                {formatCurrency(stats?.totalRevenue ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <Icon icon={Invoice01Icon} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-xl font-bold">
                {formatCurrency(stats?.totalExpenses ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            <Icon icon={ChartUpIcon} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-xl font-bold">
                {formatCurrency(stats?.totalProfit ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Freight Movement</CardTitle>
        </CardHeader>
        <CardContent>
          {tripsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : recentTrips.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No trips are flowing through your Zendak network yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Truck</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.origin}</TableCell>
                    <TableCell>{trip.destination}</TableCell>
                    <TableCell>{trip.driver.user.name}</TableCell>
                    <TableCell>
                      <Badge variant={tripStatusVariant[trip.status]}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{trip.truck.plateNumber}</TableCell>
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
