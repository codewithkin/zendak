"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";

export interface Expense {
  id: string;
  amount: string;
  type: "FUEL" | "MAINTENANCE" | "DRIVER_COST" | "TOLL" | "INSURANCE" | "PARKING" | "PERMITS" | "REPAIRS" | "CLEANING" | "MEALS" | "EQUIPMENT" | "MISC";
  description: string | null;
  tripId: string | null;
  truckId: string | null;
  driverId: string | null;
  createdAt: string;
  updatedAt: string;
  trip: { id: string; origin: string; destination: string } | null;
  truck: { id: string; plateNumber: string } | null;
  driver: { id: string; user: { name: string } } | null;
}

export interface CreateExpenseInput {
  amount: number;
  type: Expense["type"];
  description?: string;
  tripId?: string;
  truckId?: string;
  driverId?: string;
}

export interface UpdateExpenseInput {
  amount?: number;
  type?: Expense["type"];
  description?: string;
}

export interface ExpenseFilters {
  tripId?: string;
  truckId?: string;
  type?: Expense["type"];
}

export function useExpenses(filters?: ExpenseFilters) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters?.tripId) params.set("tripId", filters.tripId);
    if (filters?.truckId) params.set("truckId", filters.truckId);
    if (filters?.type) params.set("type", filters.type);
    const query = params.toString();
    const path = `/api/expenses${query ? `?${query}` : ""}`;

    apiClient
      .get<Expense[]>(path)
      .then((data) => {
        setExpenses(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err : new ApiError("Network error", 0));
      })
      .finally(() => setIsLoading(false));
  }, [filters?.tripId, filters?.truckId, filters?.type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { expenses, isLoading, error, refetch };
}

export function useCreateExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createExpense = useCallback(async (input: CreateExpenseInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<Expense>("/api/expenses", input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createExpense, isLoading, error };
}

export function useUpdateExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateExpense = useCallback(async (id: string, input: UpdateExpenseInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.patch<Expense>(`/api/expenses/${id}`, input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateExpense, isLoading, error };
}

export function useDeleteExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const deleteExpense = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.del<{ message: string }>(`/api/expenses/${id}`);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteExpense, isLoading, error };
}
