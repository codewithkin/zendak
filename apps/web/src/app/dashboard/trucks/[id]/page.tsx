"use client";

import { useParams } from "next/navigation";

import { Badge } from "@zendak/ui/components/badge";
import { Button } from "@zendak/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@zendak/ui/components/card";
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
  ArrowLeft01Icon,
  DeliveryTruck02Icon,
  Invoice01Icon,
  MapsLocation01Icon,
  UserGroupIcon,
  Alert02Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";
import Link from "next/link";

import { useTruckDetail } from "@/hooks/use-truck-detail";

const statusVariant: Record<string, "default" | "secondary" | "warning" | "destructive" | "success"> = {
  AVAILABLE: "success",
  IN_TRANSIT: "default",
  MAINTENANCE: "warning",
  RETIRED: "secondary",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function TruckDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { truck, isLoading, error } = useTruckDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !truck) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/trucks">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Icon icon={ArrowLeft01Icon} size={14} />
            Back to Trucks
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "Truck not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/trucks">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Icon icon={ArrowLeft01Icon} size={16} />
            </Button>
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon icon={DeliveryTruck02Icon} size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{truck.plateNumber}</h1>
            <p className="text-xs text-muted-foreground">
              {truck.model} &middot; {truck.year} &middot; {truck.type.replace(/_/g, " ")}
            </p>
          </div>
          <Badge variant={statusVariant[truck.status] ?? "secondary"}>
            {truck.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Revenue</CardTitle>
            <Icon icon={Invoice01Icon} size={14} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-green-600">{formatCurrency(truck.summary.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Expenses</CardTitle>
            <Icon icon={Invoice01Icon} size={14} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-red-600">{formatCurrency(truck.summary.totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold ${truck.summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(truck.summary.totalProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Trips</CardTitle>
            <Icon icon={MapsLocation01Icon} size={14} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{truck.summary.totalTrips}</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Info & Lifecycle */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vehicle Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mileage</span>
              <span>{truck.mileage.toLocaleString()} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acquired</span>
              <span>{truck.acquiredAt ? new Date(truck.acquiredAt).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Disposed</span>
              <span>{truck.disposedAt ? new Date(truck.disposedAt).toLocaleDateString() : "Active"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Added</span>
              <span>{new Date(truck.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Driver History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Driver History</CardTitle>
            <Icon icon={UserGroupIcon} size={14} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {truck.driverHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">No drivers assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {truck.driverHistory.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{driver.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{driver.tripCount} trips</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        Last: {new Date(driver.lastTrip).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Reminders */}
      {truck.upcomingReminders.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Upcoming Service Reminders</CardTitle>
            <Icon icon={Calendar03Icon} size={14} className="text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {truck.upcomingReminders.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="text-muted-foreground">{r.description ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={new Date(r.dueDate) < new Date() ? "destructive" : "outline"}
                        className="text-[10px]"
                      >
                        {new Date(r.dueDate).toLocaleDateString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Trips ({truck.trips.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {truck.trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                    No trips recorded for this truck.
                  </TableCell>
                </TableRow>
              ) : (
                truck.trips.slice(0, 20).map((trip) => {
                  const tripExpenses = trip.expenses.reduce((s, e) => s + Number(e.amount), 0);
                  return (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">
                        {trip.origin} → {trip.destination}
                      </TableCell>
                      <TableCell>{trip.driver?.user?.name ?? "—"}</TableCell>
                      <TableCell>{Number(trip.distance).toLocaleString()} km</TableCell>
                      <TableCell className="text-green-600">
                        {trip.revenue ? formatCurrency(Number(trip.revenue.amount)) : "—"}
                      </TableCell>
                      <TableCell className="text-red-600">{formatCurrency(tripExpenses)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{trip.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Expenses ({truck.expenses.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {truck.expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                    No standalone expenses recorded.
                  </TableCell>
                </TableRow>
              ) : (
                truck.expenses.slice(0, 20).map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{formatCurrency(Number(exp.amount))}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{exp.type.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{exp.description ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Issues & Crash Reports */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Issues ({truck.issues.length})</CardTitle>
            <Icon icon={Alert02Icon} size={14} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {truck.issues.length === 0 ? (
              <p className="text-xs text-muted-foreground">No issues reported.</p>
            ) : (
              <div className="space-y-2">
                {truck.issues.slice(0, 10).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between text-sm">
                    <span>{issue.title}</span>
                    <div className="flex gap-1">
                      <Badge variant={issue.severity === "CRITICAL" ? "destructive" : issue.severity === "HIGH" ? "warning" : "secondary"} className="text-[10px]">
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{issue.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Crash Reports ({truck.crashReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {truck.crashReports.length === 0 ? (
              <p className="text-xs text-muted-foreground">No crash reports.</p>
            ) : (
              <div className="space-y-2">
                {truck.crashReports.slice(0, 10).map((cr) => (
                  <div key={cr.id} className="flex items-center justify-between text-sm">
                    <span className="max-w-[200px] truncate">{cr.description}</span>
                    <div className="flex gap-1">
                      <Badge variant={cr.severity === "CRITICAL" ? "destructive" : "secondary"} className="text-[10px]">
                        {cr.severity}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{cr.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
