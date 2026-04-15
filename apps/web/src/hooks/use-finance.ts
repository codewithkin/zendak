"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";

interface ProfitSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  margin: number;
  tripCount: number;
}

export interface Revenue {
  id: string;
  amount: string;
  tripId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  trip: {
    id: string;
    origin: string;
    destination: string;
    status: string;
  };
}

export function useFinanceSummary(dateFrom?: string, dateTo?: string) {
  const [summary, setSummary] = useState<ProfitSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const query = params.toString();
    const path = `/api/profit/summary${query ? `?${query}` : ""}`;

    apiClient
      .get<ProfitSummary>(path)
      .then((data) => {
        setSummary(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err : new ApiError("Network error", 0));
      })
      .finally(() => setIsLoading(false));
  }, [dateFrom, dateTo]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { summary, isLoading, error, refetch };
}

export function useRevenue() {
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<Revenue[]>("/api/revenue")
      .then((data) => {
        setRevenue(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err : new ApiError("Network error", 0));
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { revenue, isLoading, error, refetch };
}
