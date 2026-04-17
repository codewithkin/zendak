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
  Delete02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import {
  useTrucks,
  useUpdateTruck,
  useDeleteTruck,
  type Truck,
  type UpdateTruckInput,
} from "@/hooks/use-trucks";
import { AddTruckDialog } from "@/components/dialogs/add-truck-dialog";

const statusVariant: Record<Truck["status"], "success" | "default" | "warning" | "destructive"> = {
  AVAILABLE: "success",
  IN_TRANSIT: "default",
  MAINTENANCE: "warning",
  RETIRED: "destructive",
};

export default function TrucksPage() {
  const { trucks, isLoading, refetch } = useTrucks();
  const { updateTruck, isLoading: updating } = useUpdateTruck();
  const { deleteTruck, isLoading: deleting } = useDeleteTruck();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);

  // Edit form state
  const [editPlateNumber, setEditPlateNumber] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editStatus, setEditStatus] = useState<Truck["status"]>("AVAILABLE");

  function openEdit(truck: Truck) {
    setEditingTruck(truck);
    setEditPlateNumber(truck.plateNumber);
    setEditModel(truck.model);
    setEditYear(truck.year?.toString() ?? "");
    setEditStatus(truck.status);
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTruck) return;
    const input: UpdateTruckInput = {
      plateNumber: editPlateNumber,
      model: editModel,
      status: editStatus,
    };
    if (editYear) input.year = Number.parseInt(editYear, 10);
    try {
      await updateTruck(editingTruck.id, input);
      toast.success("Truck updated");
      setEditOpen(false);
      refetch();
    } catch {
      toast.error("Failed to update truck");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTruck(id);
      toast.success("Truck retired");
      refetch();
    } catch {
      toast.error("Failed to retire truck");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Trucks</h1>
          <p className="text-sm text-muted-foreground">
            Keep your active fleet, equipment status, and road-ready units organized.
          </p>
        </div>

        <Button size="sm" onClick={() => setAddOpen(true)}>
              <Icon icon={AddCircleIcon} className="size-3.5" />
              Add Truck
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
          ) : trucks.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No trucks are in your Zendak fleet yet. Add your first unit to start dispatching.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trucks.map((truck) => (
                  <TableRow key={truck.id}>
                    <TableCell className="font-medium">
                      {truck.plateNumber}
                    </TableCell>
                    <TableCell>{truck.model}</TableCell>
                    <TableCell>{truck.year ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[truck.status]}>
                        {truck.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => openEdit(truck)}
                        >
                          <Icon icon={PencilEdit02Icon} className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(truck.id)}
                          disabled={deleting || truck.status === "RETIRED"}
                        >
                          <Icon icon={Delete02Icon} className="size-3" />
                        </Button>
                      </div>
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
              <DialogTitle>Edit Truck</DialogTitle>
              <DialogDescription>
                Update fleet details before the next dispatch cycle.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="editPlateNumber">Plate Number</Label>
                <Input
                  id="editPlateNumber"
                  value={editPlateNumber}
                  onChange={(e) => setEditPlateNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editModel">Model</Label>
                <Input
                  id="editModel"
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editYear">Year</Label>
                <Input
                  id="editYear"
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  min={1900}
                  max={2100}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v: string | null) => { if (v) setEditStatus(v as Truck["status"]); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Add Truck Dialog (shared with dashboard quick actions) */}
      <AddTruckDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
