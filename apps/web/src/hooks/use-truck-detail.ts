"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";

export interface TruckDetail {
  id: string;
  plateNumber: string;
  model: string;
  year: number;
  type: string;
  status: "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE" | "RETIRED";
  mileage: number;
  acquiredAt: string | null;
  disposedAt: string | null;
  createdAt: string;
  updatedAt: string;
  summary: {
    totalExpenses: number;
    totalRevenue: number;
    totalProfit: number;
    totalTrips: number;
  };
  driverHistory: {
    id: string;
    name: string;
    tripCount: number;
    lastTrip: string;
  }[];
  upcomingReminders: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    completed: boolean;
  }[];
  trips: {
    id: string;
    origin: string;
    destination: string;
    status: string;
    distance: string;
    driverId: string;
    driver: { id: string; user: { name: string } };
    revenue: { amount: string } | null;
    expenses: { amount: string }[];
    createdAt: string;
  }[];
  expenses: {
    id: string;
    amount: string;
    type: string;
    description: string | null;
    createdAt: string;
  }[];
  serviceReminders: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    completed: boolean;
  }[];
  issues: {
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
  }[];
  crashReports: {
    id: string;
    description: string;
    severity: string;
    status: string;
    createdAt: string;
  }[];
}

export function useTruckDetail(id: string) {
  const [truck, setTruck] = useState<TruckDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<TruckDetail>(`/api/trucks/${id}/detail`)
      .then((data) => {
        setTruck(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err : new ApiError("Network error", 0));
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { truck, isLoading, error, refetch };
}
