"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@zendak/ui/components/button";
import { Badge } from "@zendak/ui/components/badge";
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
  DialogTrigger,
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
import { AddCircleIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import {
  useExpenses,
  useCreateExpense,
  useDeleteExpense,
  type Expense,
  type CreateExpenseInput,
  type ExpenseFilters,
} from "@/hooks/use-expenses";
import { useTrips } from "@/hooks/use-trips";
import { useTrucks } from "@/hooks/use-trucks";

const EXPENSE_TYPES: Expense["type"][] = [
  "FUEL",
  "MAINTENANCE",
  "DRIVER_COST",
  "TOLL",
  "MISC",
];

const typeVariant: Record<Expense["type"], "default" | "warning" | "secondary" | "outline" | "destructive"> = {
  FUEL: "default",
  MAINTENANCE: "warning",
  DRIVER_COST: "secondary",
  TOLL: "outline",
  MISC: "destructive",
};

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(num);
}

export default function ExpensesPage() {
  const [filterType, setFilterType] = useState<Expense["type"] | "">("");

  const filters: ExpenseFilters = {};
  if (filterType) filters.type = filterType;

  const { expenses, isLoading, refetch } = useExpenses(filters);
  const { createExpense, isLoading: creating } = useCreateExpense();
  const { deleteExpense, isLoading: deleting } = useDeleteExpense();
  const { trips } = useTrips();
  const { trucks } = useTrucks();

  const [addOpen, setAddOpen] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<Expense["type"]>("FUEL");
  const [description, setDescription] = useState("");
  const [tripId, setTripId] = useState("");
  const [truckId, setTruckId] = useState("");

  function resetForm() {
    setAmount("");
    setType("FUEL");
    setDescription("");
    setTripId("");
    setTruckId("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const input: CreateExpenseInput = {
      amount: Number.parseFloat(amount),
      type,
    };
    if (description) input.description = description;
    if (tripId) input.tripId = tripId;
    if (truckId) input.truckId = truckId;
    try {
      await createExpense(input);
      toast.success("Expense added");
      resetForm();
      setAddOpen(false);
      refetch();
    } catch {
      toast.error("Failed to add expense");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      refetch();
    } catch {
      toast.error("Failed to delete expense");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Record operating costs tied to trips, trucks, and margin control.
          </p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger>
            <Button size="sm">
              <Icon icon={AddCircleIcon} className="size-3.5" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
                <DialogDescription>
                  Capture a new operating cost for the fleet or a specific trip.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min={0}
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v: string | null) => { if (v) setType(v as Expense["type"]); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Fuel refill at station X"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Trip (optional)</Label>
                  <Select value={tripId} onValueChange={(v: string | null) => setTripId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trip" />
                    </SelectTrigger>
                    <SelectContent>
                      {trips.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.origin} → {t.destination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Truck (optional)</Label>
                  <Select value={truckId} onValueChange={(v: string | null) => setTruckId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a truck" />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.plateNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={creating}>
                  {creating ? "Adding…" : "Add Expense"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="w-48">
          <Select
            value={filterType}
            onValueChange={(v: string | null) => setFilterType((v ?? "") as Expense["type"] | "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {EXPENSE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace("_", " ")}
                </SelectItem>
              ))}
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
          ) : expenses.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No expenses are recorded yet. Log your first cost to track real margins.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeVariant[expense.type]}>
                        {expense.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{expense.description ?? "—"}</TableCell>
                    <TableCell>
                      {expense.trip
                        ? `${expense.trip.origin} → ${expense.trip.destination}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {expense.truck?.plateNumber ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(expense.id)}
                        disabled={deleting}
                      >
                        <Icon icon={Delete02Icon} className="size-3" />
                      </Button>
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
