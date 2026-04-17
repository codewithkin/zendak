"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@zendak/ui/components/button";
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
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import {
  useDrivers,
  useUpdateDriver,
  type Driver,
  type UpdateDriverInput,
} from "@/hooks/use-drivers";
import { AddDriverDialog } from "@/components/dialogs/add-driver-dialog";

export default function DriversPage() {
  const { drivers, isLoading, refetch } = useDrivers();
  const { updateDriver, isLoading: updating } = useUpdateDriver();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

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
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="editName">Full Name</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editLicenseNo">License Number</Label>
                <Input
                  id="editLicenseNo"
                  value={editLicenseNo}
                  onChange={(e) => setEditLicenseNo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
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
