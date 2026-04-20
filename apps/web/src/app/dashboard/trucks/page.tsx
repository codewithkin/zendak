"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  CheckmarkCircle02Icon,
  Delete02Icon,
  DeliveryTruck02Icon,
  MapsLocation01Icon,
  PencilEdit02Icon,
  ToolboxIcon,
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
  const router = useRouter();
  const { trucks, isLoading, refetch } = useTrucks();
  const { updateTruck, isLoading: updating } = useUpdateTruck();
  const { deleteTruck, isLoading: deleting } = useDeleteTruck();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [filterStatus, setFilterStatus] = useState<Truck["status"] | "">("");
  const [search, setSearch] = useState("");

  const available = trucks.filter((t) => t.status === "AVAILABLE").length;
  const inTransit = trucks.filter((t) => t.status === "IN_TRANSIT").length;
  const maintenance = trucks.filter((t) => t.status === "MAINTENANCE").length;

  const filteredTrucks = trucks.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.plateNumber.toLowerCase().includes(q) && !t.model.toLowerCase().includes(q)) return false;
    }
    return true;
  });

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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update truck");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTruck(id);
      toast.success("Truck retired");
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to retire truck");
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Fleet
            </CardTitle>
            <Icon icon={DeliveryTruck02Icon} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
            {isLoading ? (
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
            {isLoading ? (
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
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold">{maintenance}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search & Status Filter */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by plate or model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-64 text-xs"
        />
        <div className="w-48">
          <Select
            value={filterStatus}
            onValueChange={(v: string | null) => setFilterStatus((v ?? "") as Truck["status"] | "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : filteredTrucks.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              {filterStatus
                ? `No trucks with status "${filterStatus.replace("_", " ")}".`
                : "No trucks are in your Zendak fleet yet. Add your first unit to start dispatching."}
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
                {filteredTrucks.map((truck) => (
                  <TableRow
                    key={truck.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/trucks/${truck.id}`)}
                  >
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
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
            <div className="mt-6 space-y-4">
              <div className="mb-4 space-y-1.5">
                <Label htmlFor="editPlateNumber">Plate Number</Label>
                <Input
                  id="editPlateNumber"
                  value={editPlateNumber}
                  onChange={(e) => setEditPlateNumber(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 space-y-1.5">
                <Label htmlFor="editModel">Model</Label>
                <Input
                  id="editModel"
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 space-y-1.5">
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
              <div className="mb-4 space-y-1.5">
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
