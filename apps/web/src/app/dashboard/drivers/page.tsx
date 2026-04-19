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
  PencilEdit02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import {
  useDrivers,
  useUpdateDriver,
  type Driver,
  type UpdateDriverInput,
} from "@/hooks/use-drivers";
import { AddDriverDialog } from "@/components/dialogs/add-driver-dialog";
import { useTrips } from "@/hooks/use-trips";

export default function DriversPage() {
  const { drivers, isLoading, refetch } = useDrivers();
  const { updateDriver, isLoading: updating } = useUpdateDriver();
  const { trips, isLoading: tripsLoading } = useTrips();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Compute trip counts per driver
  const tripCountByDriver = trips.reduce<Record<string, number>>((acc, trip) => {
    acc[trip.driverId] = (acc[trip.driverId] ?? 0) + 1;
    return acc;
  }, {});

  const activeDriverIds = new Set(
    trips.filter((t) => t.status === "ACTIVE").map((t) => t.driverId),
  );
  const activeDrivers = drivers.filter((d) => activeDriverIds.has(d.id)).length;
  const idleDrivers = drivers.length - activeDrivers;

  // Edit form
  const [editName, setEditName] = useState("");
  const [editLicenseNo, setEditLicenseNo] = useState("");
  const [editPhone, setEditPhone] = useState("");

  function openEdit(driver: Driver) {
    setEditingDriver(driver);
    setEditName(driver.user.name);
    setEditLicenseNo(driver.licenseNo);
    setEditPhone(driver.phone ?? "");
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingDriver) return;
    const input: UpdateDriverInput = {
      name: editName,
      licenseNo: editLicenseNo,
    };
    if (editPhone) input.phone = editPhone;
    try {
      await updateDriver(editingDriver.id, input);
      toast.success("Driver updated");
      setEditOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update driver");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Drivers</h1>
          <p className="text-sm text-muted-foreground">
            Maintain the people moving trips, handoffs, and delivery schedules.
          </p>
        </div>

        <Button size="sm" onClick={() => setAddOpen(true)}>
              <Icon icon={AddCircleIcon} className="size-3.5" />
              Add Driver
            </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Drivers
            </CardTitle>
            <Icon icon={UserGroupIcon} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{drivers.length}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              On Active Trip
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || tripsLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{activeDrivers}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || tripsLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{idleDrivers}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : drivers.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No drivers are assigned yet. Add your first operator to start routing work.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>License No.</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Trips</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">
                      {driver.user.name}
                    </TableCell>
                    <TableCell>{driver.user.email}</TableCell>
                    <TableCell>{driver.licenseNo}</TableCell>
                    <TableCell>{driver.phone ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={activeDriverIds.has(driver.id) ? "default" : "secondary"}>
                        {activeDriverIds.has(driver.id) ? "ON TRIP" : "AVAILABLE"}
                      </Badge>
                    </TableCell>
                    <TableCell>{tripCountByDriver[driver.id] ?? 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(driver)}
                      >
                        <Icon icon={PencilEdit02Icon} className="size-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Driver</DialogTitle>
              <DialogDescription>
                Keep driver identity and compliance details current.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-4">
              <div className="mb-4 space-y-1.5">
                <Label htmlFor="editName">Full Name</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 space-y-1.5">
                <Label htmlFor="editLicenseNo">License Number</Label>
                <Input
                  id="editLicenseNo"
                  value={editLicenseNo}
                  onChange={(e) => setEditLicenseNo(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 space-y-1.5">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <DialogClose>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={updating}>
                {updating ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Driver Dialog (shared with dashboard quick actions) */}
      <AddDriverDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
