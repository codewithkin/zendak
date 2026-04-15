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
  MapIcon,
  DollarSignIcon,
  ReceiptIcon,
  TrendingUpIcon,
} from "lucide-react";

import { useDashboardStats } from "@/hooks/use-dashboard";
import { useTrips, type Trip } from "@/hooks/use-trips";

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

  const recentTrips = trips.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Full system access — trucks, drivers, trips, finances, and user management.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Trips
            </CardTitle>
            <MapIcon className="size-4 text-muted-foreground" />
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
            <DollarSignIcon className="size-4 text-muted-foreground" />
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
            <ReceiptIcon className="size-4 text-muted-foreground" />
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
            <TrendingUpIcon className="size-4 text-muted-foreground" />
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
          <CardTitle>Recent Trips</CardTitle>
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
              No trips yet
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
    </div>
  );
}
