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

export function useDashboardStats() {
  const [stats, setStats] = useState<ProfitSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<ProfitSummary>("/api/profit/summary")
      .then((data) => {
        setStats(data);
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

  return { stats, isLoading, error, refetch };
}
