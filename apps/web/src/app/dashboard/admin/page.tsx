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
  CheckmarkCircle02Icon,
  CoinsDollarIcon,
  DeliveryTruck02Icon,
  Invoice01Icon,
  MapsLocation01Icon,
  PercentCircleIcon,
  ToolboxIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import { useDashboardStats } from "@/hooks/use-dashboard";
import { useTrips, type Trip } from "@/hooks/use-trips";
import { useTrucks } from "@/hooks/use-trucks";
import { useExpenses, type Expense } from "@/hooks/use-expenses";
import { AddDriverDialog } from "@/components/dialogs/add-driver-dialog";
import { AddTruckDialog } from "@/components/dialogs/add-truck-dialog";
import { CreateTripDialog } from "@/components/dialogs/create-trip-dialog";

const tripStatusVariant: Record<Trip["status"], "secondary" | "default" | "success" | "outline"> = {
  PLANNED: "secondary",
  ACTIVE: "default",
  COMPLETED: "success",
  SETTLED: "outline",
};

const typeVariant: Record<Expense["type"], "default" | "warning" | "secondary" | "outline" | "destructive"> = {
  FUEL: "default",
  MAINTENANCE: "warning",
  DRIVER_COST: "secondary",
  TOLL: "outline",
  MISC: "destructive",
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
  const { trucks, isLoading: trucksLoading } = useTrucks();
  const { expenses, isLoading: expensesLoading } = useExpenses();

  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [addTruckOpen, setAddTruckOpen] = useState(false);
  const [createTripOpen, setCreateTripOpen] = useState(false);

  const recentTrips = trips.slice(0, 5);
  const activeTrips = trips.filter((t) => t.status === "ACTIVE").length;
  const availableTrucks = trucks.filter((t) => t.status === "AVAILABLE").length;
  const maintenanceTrucks = trucks.filter((t) => t.status === "MAINTENANCE").length;
  const inTransitTrucks = trucks.filter((t) => t.status === "IN_TRANSIT").length;

  // Expense breakdown by type
  const expensesByType = expenses.reduce<Record<string, number>>((acc, exp) => {
    const t = exp.type;
    acc[t] = (acc[t] ?? 0) + Number.parseFloat(exp.amount);
    return acc;
  }, {});
  const totalExpenseAmount = Object.values(expensesByType).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Executive Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Track the fleet, trip flow, and operating margin from one Zendak workspace.
          </p>
        </div>

        {/* Quick Actions */}
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
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Margin
            </CardTitle>
            <Icon icon={PercentCircleIcon} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold">
                {(stats?.margin ?? 0).toFixed(1)}%
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Trips
            </CardTitle>
            <Icon icon={MapsLocation01Icon} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            {tripsLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{activeTrips}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Trips Table */}
        <Card className="lg:col-span-2">
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
                    <TableHead>Route</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTrips.map((trip) => (
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Fleet Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            {trucksLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-full" />
                ))}
              </div>
            ) : trucks.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No trucks in fleet yet.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon={CheckmarkCircle02Icon} className="text-emerald-500" />
                    <span className="text-sm">Available</span>
                  </div>
                  <span className="text-sm font-semibold">{availableTrucks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon={MapsLocation01Icon} className="text-blue-500" />
                    <span className="text-sm">In Transit</span>
                  </div>
                  <span className="text-sm font-semibold">{inTransitTrucks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon={ToolboxIcon} className="text-amber-500" />
                    <span className="text-sm">Maintenance</span>
                  </div>
                  <span className="text-sm font-semibold">{maintenanceTrucks}</span>
                </div>
                <div className="mt-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Fleet</span>
                    <span className="text-sm font-bold">{trucks.length}</span>
                  </div>
                  {trucks.length > 0 && (
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="flex h-full">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${(availableTrucks / trucks.length) * 100}%` }}
                        />
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(inTransitTrucks / trucks.length) * 100}%` }}
                        />
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${(maintenanceTrucks / trucks.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {expensesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </div>
          ) : Object.keys(expensesByType).length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No operating costs recorded yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(expensesByType)
                .sort(([, a], [, b]) => b - a)
                .map(([expType, total]) => {
                  const pct = totalExpenseAmount > 0 ? (total / totalExpenseAmount) * 100 : 0;
                  return (
                    <div key={expType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={typeVariant[expType as Expense["type"]]}>
                          {expType.replace("_", " ")}
                        </Badge>
                        <span className="text-xs font-medium">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(total)}</p>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddDriverDialog open={addDriverOpen} onOpenChange={setAddDriverOpen} />
      <AddTruckDialog open={addTruckOpen} onOpenChange={setAddTruckOpen} />
      <CreateTripDialog open={createTripOpen} onOpenChange={setCreateTripOpen} />
    </div>
  );
}
