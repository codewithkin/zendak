"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@zendak/ui/components/badge";
import { Button } from "@zendak/ui/components/button";
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
import { AddCircleIcon, Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import {
  useIssues,
  useIssueStats,
  useCreateIssue,
  useUpdateIssue,
  useDeleteIssue,
  type Issue,
  type IssueSeverity,
  type IssueStatus,
  type CreateIssueInput,
} from "@/hooks/use-issues";
import { DataTable, type ColumnDef, type FilterConfig } from "@/components/data-table";
import { SearchSelect } from "@/components/search-select";

const SEVERITIES: IssueSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES: IssueStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const severityVariant: Record<IssueSeverity, "default" | "secondary" | "warning" | "destructive"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  CRITICAL: "destructive",
};

const statusVariant: Record<IssueStatus, "default" | "secondary" | "success" | "outline" | "destructive" | "warning"> = {
  OPEN: "destructive",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "outline",
};

const columns: ColumnDef<Issue>[] = [
  {
    key: "title",
    header: "Title",
    sortable: true,
    sortValue: (row) => row.title,
    cell: (row) => <span className="font-medium">{row.title}</span>,
  },
  {
    key: "severity",
    header: "Severity",
    sortable: true,
    sortValue: (row) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[row.severity];
    },
    cell: (row) => <Badge variant={severityVariant[row.severity]}>{row.severity}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <Badge variant={statusVariant[row.status]}>
        {row.status.replace(/_/g, " ")}
      </Badge>
    ),
  },
  {
    key: "truck",
    header: "Truck",
    cell: (row) => row.truck?.plateNumber ?? "—",
  },
  {
    key: "driver",
    header: "Driver",
    cell: (row) => row.driver?.user?.name ?? "—",
  },
  {
    key: "reporter",
    header: "Reported By",
    cell: (row) => row.reporter?.name ?? "—",
  },
  {
    key: "createdAt",
    header: "Date",
    sortable: true,
    sortValue: (row) => new Date(row.createdAt),
    cell: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

const filters: FilterConfig[] = [
  {
    key: "severity",
    label: "Severity",
    type: "select",
    options: SEVERITIES.map((s) => ({ label: s, value: s })),
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: STATUSES.map((s) => ({ label: s.replace(/_/g, " "), value: s })),
  },
  {
    key: "createdAt",
    label: "Date",
    type: "dateRange",
  },
];

export default function IssuesPage() {
  const { issues, isLoading, refetch } = useIssues();
  const { stats, isLoading: statsLoading } = useIssueStats();
  const { createIssue, isLoading: creating } = useCreateIssue();
  const { updateIssue } = useUpdateIssue();
  const { deleteIssue } = useDeleteIssue();

  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Issue | null>(null);

  // Create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("MEDIUM");
  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
    setSeverity("MEDIUM");
    setTruckId("");
    setDriverId("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const input: CreateIssueInput = { title, description, severity };
    if (truckId) input.truckId = truckId;
    if (driverId) input.driverId = driverId;
    try {
      await createIssue(input);
      toast.success("Issue reported");
      resetForm();
      setAddOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create issue");
    }
  }

  async function handleStatusChange(id: string, status: IssueStatus) {
    try {
      await updateIssue(id, { status });
      toast.success("Status updated");
      refetch();
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteIssue(id);
      toast.success("Issue deleted");
      setDetailOpen(false);
      setSelected(null);
      refetch();
    } catch {
      toast.error("Failed to delete issue");
    }
  }

  function openDetail(issue: Issue) {
    setSelected(issue);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <Icon icon={Alert02Icon} size={20} className="text-destructive" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Issues</h1>
            <p className="text-xs text-muted-foreground">
              Track and resolve fleet issues, ordered by severity.
            </p>
          </div>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger>
            <Button size="sm">
              <Icon icon={AddCircleIcon} className="size-3.5" />
              Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Report Issue</DialogTitle>
                <DialogDescription>
                  Report a new fleet issue. Critical issues will surface first.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="issue-title">Title</Label>
                  <Input
                    id="issue-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="issue-desc">Description</Label>
                  <Input
                    id="issue-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Severity</Label>
                  <Select value={severity} onValueChange={(v) => setSeverity((v ?? "MEDIUM") as IssueSeverity)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITIES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Truck (optional)</Label>
                  <SearchSelect<{ id: string; plateNumber: string }>
                    value={truckId}
                    onChange={setTruckId}
                    endpoint="/api/trucks/search"
                    placeholder="Select a truck"
                    getLabel={(t) => t.plateNumber}
                    getValue={(t) => t.id}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Driver (optional)</Label>
                  <SearchSelect<{ id: string; user: { name: string } }>
                    value={driverId}
                    onChange={setDriverId}
                    endpoint="/api/drivers/search"
                    placeholder="Select a driver"
                    getLabel={(d) => d.user.name}
                    getValue={(d) => d.id}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={creating}>
                  {creating ? "Reporting…" : "Report Issue"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as IssueStatus[]).map((status) => (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {status.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <p className="text-xl font-bold">{stats?.[status] ?? 0}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable<Issue>
            data={issues}
            columns={columns}
            isLoading={isLoading}
            filters={filters}
            searchPlaceholder="Search issues..."
            searchKeys={["title" as keyof Issue]}
            emptyMessage="No issues found. Your fleet is running clean."
            onRowClick={openDetail}
          />
        </CardContent>
      </Card>

      {/* Detail / Edit Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant={severityVariant[selected.severity]}>{selected.severity}</Badge>
                  {selected.title}
                </DialogTitle>
                <DialogDescription>{selected.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Select
                    value={selected.status}
                    onValueChange={(v) => {
                      if (v) handleStatusChange(selected.id, v as IssueStatus);
                    }}
                  >
                    <SelectTrigger className="h-7 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Truck</span>
                  <span>{selected.truck?.plateNumber ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver</span>
                  <span>{selected.driver?.user?.name ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reported By</span>
                  <span>{selected.reporter?.name ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(selected.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selected.id)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
