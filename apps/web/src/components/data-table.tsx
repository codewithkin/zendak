"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@zendak/ui/components/table";
import { Input } from "@zendak/ui/components/input";
import { Button } from "@zendak/ui/components/button";
import { Badge } from "@zendak/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zendak/ui/components/select";
import { Skeleton } from "@zendak/ui/components/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@zendak/ui/components/dialog";
import {
  Cancel01Icon,
  FilterIcon,
  Search01Icon,
  SortingDownIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

// ─── Types ──────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | Date;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "date" | "dateRange" | "text" | "number";
  options?: { label: string; value: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  filters?: FilterConfig[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

// ─── Component ──────────────────────────────────────────

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  filters = [],
  searchPlaceholder = "Search...",
  searchKeys = [],
  pageSize = 20,
  emptyMessage = "No data found",
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = Object.values(activeFilters).filter((v) => v && v !== "all").length;

  const setFilter = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setSearch("");
    setPage(0);
  }, []);

  // Filtering
  const filtered = useMemo(() => {
    let result = [...data];

    // Text search
    if (search && searchKeys.length > 0) {
      const lower = search.toLowerCase();
      result = result.filter((row) =>
        searchKeys.some((key) => {
          const val = row[key];
          if (typeof val === "string") return val.toLowerCase().includes(lower);
          if (typeof val === "number") return val.toString().includes(lower);
          return false;
        }),
      );
    }

    // Column/filter-based filtering
    for (const [key, value] of Object.entries(activeFilters)) {
      if (!value || value === "all") continue;
      const filterDef = filters.find((f) => f.key === key);
      if (filterDef?.type === "date") {
        result = result.filter((row) => {
          const rowDate = row[key];
          if (!rowDate) return false;
          const d = new Date(rowDate as string).toISOString().split("T")[0];
          return d >= value;
        });
      } else if (filterDef?.type === "dateRange") {
        // value format: "start|end"
        const [start, end] = value.split("|");
        result = result.filter((row) => {
          const rowDate = row[key];
          if (!rowDate) return false;
          const d = new Date(rowDate as string).toISOString().split("T")[0];
          if (start && d < start) return false;
          if (end && d > end) return false;
          return true;
        });
      } else {
        result = result.filter((row) => {
          const rowVal = row[key];
          return String(rowVal) === value;
        });
      }
    }

    return result;
  }, [data, search, searchKeys, activeFilters, filters]);

  // Sorting
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const getValue = col.sortValue;
    return [...filtered].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar: Search + Filter Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {searchKeys.length > 0 && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Icon icon={Search01Icon} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="h-8 pl-8 text-xs"
            />
          </div>
        )}

        {filters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setFiltersOpen(true)}
          >
            <Icon icon={FilterIcon} size={13} />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1 h-4 px-1 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground"
            onClick={clearFilters}
          >
            <Icon icon={Cancel01Icon} size={12} />
            Clear
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(activeFilters)
            .filter(([, v]) => v && v !== "all")
            .map(([key, value]) => {
              const filterDef = filters.find((f) => f.key === key);
              const label = filterDef?.label ?? key;
              const displayVal = filterDef?.options?.find((o) => o.value === value)?.label ?? value;
              return (
                <Badge key={key} variant="secondary" className="gap-1 text-[10px]">
                  {label}: {displayVal}
                  <button
                    type="button"
                    onClick={() => setFilter(key, "")}
                    className="ml-0.5 hover:text-foreground"
                  >
                    <Icon icon={Cancel01Icon} size={10} />
                  </button>
                </Badge>
              );
            })}
        </div>
      )}

      {/* Filter Dialog */}
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Advanced Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{filter.label}</label>
                {filter.type === "select" && filter.options && (
                  <Select
                    value={activeFilters[filter.key] ?? "all"}
                    onValueChange={(v: string | null) => setFilter(filter.key, v ?? "all")}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filter.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {filter.type === "date" && (
                  <Input
                    type="date"
                    value={activeFilters[filter.key] ?? ""}
                    onChange={(e) => setFilter(filter.key, e.target.value)}
                    className="h-8 text-xs"
                  />
                )}
                {filter.type === "dateRange" && (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      placeholder="From"
                      value={(activeFilters[filter.key] ?? "").split("|")[0] ?? ""}
                      onChange={(e) => {
                        const end = (activeFilters[filter.key] ?? "").split("|")[1] ?? "";
                        setFilter(filter.key, `${e.target.value}|${end}`);
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="date"
                      placeholder="To"
                      value={(activeFilters[filter.key] ?? "").split("|")[1] ?? ""}
                      onChange={(e) => {
                        const start = (activeFilters[filter.key] ?? "").split("|")[0] ?? "";
                        setFilter(filter.key, `${start}|${e.target.value}`);
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                )}
                {filter.type === "text" && (
                  <Input
                    value={activeFilters[filter.key] ?? ""}
                    onChange={(e) => setFilter(filter.key, e.target.value)}
                    className="h-8 text-xs"
                    placeholder={`Filter by ${filter.label.toLowerCase()}`}
                  />
                )}
                {filter.type === "number" && (
                  <Input
                    type="number"
                    value={activeFilters[filter.key] ?? ""}
                    onChange={(e) => setFilter(filter.key, e.target.value)}
                    className="h-8 text-xs"
                    placeholder={`Filter by ${filter.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" size="sm" className="text-xs" onClick={clearFilters}>
              Clear All
            </Button>
            <Button size="sm" className="text-xs" onClick={() => setFiltersOpen(false)}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>
                  {col.sortable ? (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-medium hover:text-foreground"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.header}
                      {sortKey === col.key && (
                        <Icon
                          icon={SortingDownIcon}
                          size={12}
                          className={sortDir === "desc" ? "rotate-180" : ""}
                        />
                      )}
                    </button>
                  ) : (
                    <span className="text-xs">{col.header}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, i) => (
                <TableRow
                  key={(row as Record<string, unknown>).id as string ?? i}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className="text-xs">
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {sorted.length} result{sorted.length !== 1 ? "s" : ""} &middot; Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <Icon icon={ArrowLeft01Icon} size={13} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <Icon icon={ArrowRight01Icon} size={13} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
