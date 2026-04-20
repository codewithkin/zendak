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
  AnalyticsUpIcon,
  Delete02Icon,
  Download04Icon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@zendak/ui/components/chart";

import {
  useOperatingCosts,
  useCategoricalSpending,
  useSavedReports,
  useCreateSavedReport,
  useDeleteSavedReport,
  downloadReport,
  type ReportFilters,
  type SavedReport,
} from "@/hooks/use-reports";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

const REPORT_TYPES: { value: SavedReport["type"]; label: string }[] = [
  { value: "trips", label: "Trip Report" },
  { value: "fleet", label: "Fleet Report" },
  { value: "operating-costs", label: "Operating Costs" },
  { value: "categorical-spending", label: "Categorical Spending" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filters: ReportFilters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  const { data: opCosts, isLoading: opLoading } = useOperatingCosts(filters);
  const { data: catSpending, isLoading: catLoading } = useCategoricalSpending(filters);
  const { reports: savedReports, isLoading: savedLoading, refetch: refetchSaved } = useSavedReports();
  const { create: createSaved, isLoading: creatingReport } = useCreateSavedReport();
  const { remove: deleteSaved } = useDeleteSavedReport();

  // Save report dialog state
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveType, setSaveType] = useState<SavedReport["type"]>("operating-costs");
  const [saveSchedule, setSaveSchedule] = useState<string>("");

  async function handleSaveReport(e: React.FormEvent) {
    e.preventDefault();
    try {
      const input: Parameters<typeof createSaved>[0] = {
        name: saveName,
        type: saveType,
        config: { startDate, endDate },
      };
      if (saveSchedule) input.schedule = saveSchedule as "daily" | "weekly" | "monthly";
      await createSaved(input);
      toast.success("Report saved");
      setSaveOpen(false);
      setSaveName("");
      refetchSaved();
    } catch {
      toast.error("Failed to save report");
    }
  }

  async function handleDeleteSaved(id: string) {
    try {
      await deleteSaved(id);
      toast.success("Report deleted");
      refetchSaved();
    } catch {
      toast.error("Failed to delete report");
    }
  }

  async function handleDownload(
    type: "trip" | "fleet" | "operating-costs" | "categorical-spending",
    format: "pdf" | "csv",
  ) {
    try {
      await downloadReport(type, format, filters);
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch {
      toast.error("Download failed");
    }
  }

  // Categorical spending chart config
  const catChartConfig: ChartConfig = {};
  for (const item of catSpending) {
    catChartConfig[item.type] = { label: item.type.replace(/_/g, " "), color: CHART_COLORS[0] };
  }

  // Operating costs by truck chart config
  const truckChartConfig: ChartConfig = {};
  for (const item of opCosts?.byTruck ?? []) {
    truckChartConfig[item.plateNumber] = { label: item.plateNumber, color: CHART_COLORS[0] };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon icon={AnalyticsUpIcon} size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Reports</h1>
            <p className="text-xs text-muted-foreground">
              Customizable reports with PDF/CSV export.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
            <DialogTrigger>
              <Button size="sm" variant="outline">
                <Icon icon={AddCircleIcon} className="size-3.5" />
                Save Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSaveReport}>
                <DialogHeader>
                  <DialogTitle>Save Report Configuration</DialogTitle>
                  <DialogDescription>
                    Save current filters as a reusable report preset. Optionally schedule auto-generation.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sr-name">Name</Label>
                    <Input
                      id="sr-name"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Monthly fleet overview"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Report Type</Label>
                    <Select value={saveType} onValueChange={(v) => setSaveType((v ?? "operating-costs") as SavedReport["type"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TYPES.map((rt) => (
                          <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Auto-Send Schedule (optional)</Label>
                    <Select value={saveSchedule} onValueChange={(v) => setSaveSchedule(v ?? "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="No schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose>
                    <Button variant="outline" type="button">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={creatingReport}>
                    {creatingReport ? "Saving…" : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Date Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 w-40 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 w-40 text-xs"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => { setStartDate(""); setEndDate(""); }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Operating Costs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Operating Costs</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => handleDownload("operating-costs", "pdf")}>
              <Icon icon={Download04Icon} size={12} /> PDF
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => handleDownload("operating-costs", "csv")}>
              <Icon icon={Download04Icon} size={12} /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {opLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : opCosts ? (
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Total Operating Cost</p>
                  <p className="text-2xl font-bold">{formatCurrency(opCosts.totalCost)}</p>
                </div>
                <Badge variant="outline" className="text-xs">{opCosts.expenses.length} records</Badge>
              </div>

              {opCosts.byTruck.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Cost by Truck</p>
                  <ChartContainer config={truckChartConfig} className="h-48 w-full">
                    <BarChart data={opCosts.byTruck}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="plateNumber" className="text-[10px]" />
                      <YAxis className="text-[10px]" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No operating cost data.</p>
          )}
        </CardContent>
      </Card>

      {/* Categorical Spending */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Categorical Spending</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => handleDownload("categorical-spending", "pdf")}>
              <Icon icon={Download04Icon} size={12} /> PDF
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => handleDownload("categorical-spending", "csv")}>
              <Icon icon={Download04Icon} size={12} /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {catLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : catSpending.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <ChartContainer config={catChartConfig} className="h-48">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={catSpending} dataKey="total" nameKey="type" cx="50%" cy="50%" outerRadius={70}>
                    {catSpending.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="space-y-2">
                {catSpending.map((item, i) => (
                  <div key={item.type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span>{item.type.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatCurrency(item.total)}</span>
                      <Badge variant="outline" className="text-[10px]">{item.percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No spending data.</p>
          )}
        </CardContent>
      </Card>

      {/* Fleet & Trip Report Download */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Trip Report</CardTitle>
            <Icon icon={Invoice01Icon} size={14} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              Generate a comprehensive trip-by-trip report for the selected period.
            </p>
            <Button size="sm" className="text-xs" onClick={() => handleDownload("trip", "pdf")}>
              <Icon icon={Download04Icon} size={12} />
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Fleet Report</CardTitle>
            <Icon icon={Invoice01Icon} size={14} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              Full fleet overview with truck utilization, expenses, and revenue.
            </p>
            <Button size="sm" className="text-xs" onClick={() => handleDownload("fleet", "pdf")}>
              <Icon icon={Download04Icon} size={12} />
              Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Saved Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {savedLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : savedReports.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No saved reports yet. Save a report configuration to quickly regenerate it later.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedReports.map((sr) => (
                  <TableRow key={sr.id}>
                    <TableCell className="font-medium">{sr.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {REPORT_TYPES.find((r) => r.value === sr.type)?.label ?? sr.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{sr.schedule ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {sr.lastSentAt ? new Date(sr.lastSentAt).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleDeleteSaved(sr.id)}
                      >
                        <Icon icon={Delete02Icon} size={14} className="text-destructive" />
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
