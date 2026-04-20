"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";
import { env } from "@zendak/env/web";

// ─── Operating Costs ──────────────────────────────

export interface OperatingCostsData {
  totalCost: number;
  byTruck: {
    truckId: string;
    plateNumber: string;
    total: number;
  }[];
  expenses: {
    id: string;
    amount: number;
    type: string;
    description: string | null;
    truck: { id: string; plateNumber: string } | null;
    createdAt: string;
  }[];
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  truckId?: string;
}

export function useOperatingCosts(filters?: ReportFilters) {
  const [data, setData] = useState<OperatingCostsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    if (filters?.truckId) params.set("truckId", filters.truckId);
    const query = params.toString();
    const path = `/api/reports/operating-costs${query ? `?${query}` : ""}`;

    apiClient
      .get<OperatingCostsData>(path)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err : new ApiError("Network error", 0)))
      .finally(() => setIsLoading(false));
  }, [filters?.startDate, filters?.endDate, filters?.truckId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, isLoading, error, refetch };
}

// ─── Categorical Spending ──────────────────────────

export interface CategoricalSpendingItem {
  type: string;
  count: number;
  total: number;
  percentage: number;
}

export function useCategoricalSpending(filters?: { startDate?: string; endDate?: string }) {
  const [data, setData] = useState<CategoricalSpendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    const query = params.toString();
    const path = `/api/reports/categorical-spending${query ? `?${query}` : ""}`;

    apiClient
      .get<CategoricalSpendingItem[]>(path)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err : new ApiError("Network error", 0)))
      .finally(() => setIsLoading(false));
  }, [filters?.startDate, filters?.endDate]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, isLoading, error, refetch };
}

// ─── Saved Reports ──────────────────────────────

export interface SavedReport {
  id: string;
  name: string;
  type: "trips" | "fleet" | "operating-costs" | "categorical-spending";
  config: Record<string, unknown>;
  schedule: "daily" | "weekly" | "monthly" | null;
  lastSentAt: string | null;
  createdAt: string;
}

export interface CreateSavedReportInput {
  name: string;
  type: SavedReport["type"];
  config: Record<string, unknown>;
  schedule?: "daily" | "weekly" | "monthly";
}

export function useSavedReports() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<SavedReport[]>("/api/saved-reports")
      .then((d) => setReports(d))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { reports, isLoading, refetch };
}

export function useCreateSavedReport() {
  const [isLoading, setIsLoading] = useState(false);

  const create = useCallback(async (input: CreateSavedReportInput) => {
    setIsLoading(true);
    try {
      return await apiClient.post<SavedReport>("/api/saved-reports", input);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading };
}

export function useDeleteSavedReport() {
  const [isLoading, setIsLoading] = useState(false);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await apiClient.del(`/api/saved-reports/${id}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { remove, isLoading };
}

// ─── Download Helpers ──────────────────────────────

export async function downloadReport(
  type: "trip" | "fleet" | "operating-costs" | "categorical-spending",
  format: "pdf" | "csv",
  filters?: ReportFilters,
) {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  if (filters?.truckId) params.set("truckId", filters.truckId);
  params.set("format", format);

  let endpoint: string;
  switch (type) {
    case "trip":
      endpoint = "/api/reports/trip";
      break;
    case "fleet":
      endpoint = "/api/reports/fleet";
      break;
    case "operating-costs":
      endpoint = "/api/reports/operating-costs";
      break;
    case "categorical-spending":
      endpoint = "/api/reports/categorical-spending";
      break;
  }

  const query = params.toString();
  const url = `${endpoint}${query ? `?${query}` : ""}`;

  const token = apiClient.getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}${url}`, { headers });
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${type}-report.${format}`;
  a.click();
  URL.revokeObjectURL(a.href);
}
