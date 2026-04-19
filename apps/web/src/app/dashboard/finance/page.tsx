"use client";

import { useState } from "react";

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

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-full" />
                ))}
              </div>
            ) : Object.keys(expensesByType).length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No operating costs have been recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(expensesByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([expType, total]) => {
                    const totalExpenses = summary?.totalExpenses ?? 1;
                    const pct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
                    return (
                      <div key={expType} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant={typeVariant[expType as Expense["type"]]}>
                            {expType.replace("_", " ")}
                          </Badge>
                          <span className="text-xs font-medium">
                            {formatCurrency(total)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {pct.toFixed(1)}% of total expenses
                        </p>
                      </div>
                    );
                  })}
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
