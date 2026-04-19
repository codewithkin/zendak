"use client";

import { useState, useMemo } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@zendak/ui/components/card";
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
import { Badge } from "@zendak/ui/components/badge";
import {
  ChartUpIcon,
  CoinsDollarIcon,
  Invoice01Icon,
  PercentCircleIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@zendak/ui/components/chart";

import { useFinanceSummary, useRevenue } from "@/hooks/use-finance";
import { useExpenses, type Expense } from "@/hooks/use-expenses";

function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(num);
}

const typeVariant: Record<Expense["type"], "default" | "warning" | "secondary" | "outline" | "destructive"> = {
  FUEL: "default",
  MAINTENANCE: "warning",
  DRIVER_COST: "secondary",
  TOLL: "outline",
  INSURANCE: "secondary",
  PARKING: "outline",
  PERMITS: "secondary",
  REPAIRS: "warning",
  CLEANING: "secondary",
  MEALS: "secondary",
  EQUIPMENT: "warning",
  MISC: "destructive",
};

const revenueVsExpensesConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  expenses: { label: "Expenses", color: "var(--chart-2)" },
} satisfies ChartConfig;

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function FinanceDashboard() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { summary, isLoading: summaryLoading } = useFinanceSummary(
    dateFrom || undefined,
    dateTo || undefined,
  );
  const { revenue, isLoading: revenueLoading } = useRevenue();
  const { expenses, isLoading: expensesLoading } = useExpenses();

  // Group expenses by type for breakdown
  const expensesByType = expenses.reduce<Record<string, number>>((acc, exp) => {
    const t = exp.type;
    acc[t] = (acc[t] ?? 0) + Number.parseFloat(exp.amount);
    return acc;
  }, {});

  // Build monthly revenue vs expenses chart data
  const revenueVsExpensesData = useMemo(() => {
    const monthMap: Record<string, { month: string; revenue: number; expenses: number }> = {};

    for (const rev of revenue) {
      const month = new Date(rev.createdAt).toLocaleString("en-US", { month: "short", year: "2-digit" });
      if (!monthMap[month]) monthMap[month] = { month, revenue: 0, expenses: 0 };
      monthMap[month].revenue += Number(rev.amount);
    }

    for (const exp of expenses) {
      const month = new Date(exp.createdAt).toLocaleString("en-US", { month: "short", year: "2-digit" });
      if (!monthMap[month]) monthMap[month] = { month, revenue: 0, expenses: 0 };
      monthMap[month].expenses += Number.parseFloat(exp.amount);
    }

    return Object.values(monthMap).sort((a, b) => {
      const [am, ay] = a.month.split(" ");
      const [bm, by] = b.month.split(" ");
      return new Date(`${am} 20${ay}`).getTime() - new Date(`${bm} 20${by}`).getTime();
    });
  }, [revenue, expenses]);

  // Build pie data for expense breakdown
  const expensePieData = useMemo(() => {
    return Object.entries(expensesByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, value]) => ({ name: type.replace(/_/g, " "), value: Math.round(value) }));
  }, [expensesByType]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Finance Command</h1>
        <p className="text-sm text-muted-foreground">
          Monitor revenue capture, operating spend, and margin health across the business.
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dateFrom" className="text-xs">From</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dateTo" className="text-xs">To</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <Icon icon={CoinsDollarIcon} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-xl font-bold">
                {formatCurrency(summary?.totalRevenue ?? 0)}
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
            {summaryLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-xl font-bold">
                {formatCurrency(summary?.totalExpenses ?? 0)}
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
            {summaryLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-xl font-bold">
                {formatCurrency(summary?.totalProfit ?? 0)}
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
            {summaryLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold">
                {(summary?.margin ?? 0).toFixed(1)}%
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading || expensesLoading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : revenueVsExpensesData.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No financial data available yet.
            </p>
          ) : (
            <ChartContainer config={revenueVsExpensesConfig} className="h-[220px] w-full">
              <BarChart accessibilityLayer data={revenueVsExpensesData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={48}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        formatCurrency(value as number)
                      }
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Revenue Flow</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-full" />
                ))}
              </div>
            ) : revenue.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No revenue has been captured in Zendak yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenue.slice(0, 10).map((rev) => (
                    <TableRow key={rev.id}>
                      <TableCell>
                        {rev.trip.origin} → {rev.trip.destination}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(rev.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : expensePieData.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No operating costs have been recorded yet.
              </p>
            ) : (
              <div className="space-y-4">
                <ChartContainer
                  config={Object.fromEntries(
                    expensePieData.map((d, i) => [
                      d.name,
                      { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length] },
                    ])
                  )}
                  className="h-[180px] w-full"
                >
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      strokeWidth={2}
                    >
                      {expensePieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(value as number)}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2">
                  {expensePieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <Badge variant={typeVariant[d.name.replace(/ /g, "_") as Expense["type"]]}>
                          {d.name}
                        </Badge>
                      </div>
                      <span className="text-xs font-medium">{formatCurrency(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Averages</CardTitle>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Trips</p>
                <p className="text-lg font-semibold">{summary?.tripCount ?? 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Revenue/Trip</p>
                <p className="text-lg font-semibold">
                  {summary && summary.tripCount > 0
                    ? formatCurrency(summary.totalRevenue / summary.tripCount)
                    : "$0"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Expense/Trip</p>
                <p className="text-lg font-semibold">
                  {summary && summary.tripCount > 0
                    ? formatCurrency(summary.totalExpenses / summary.tripCount)
                    : "$0"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Profit/Trip</p>
                <p className="text-lg font-semibold">
                  {summary && summary.tripCount > 0
                    ? formatCurrency(summary.totalProfit / summary.tripCount)
                    : "$0"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
