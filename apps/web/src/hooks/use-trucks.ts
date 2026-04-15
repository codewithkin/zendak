"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";

export interface Truck {
  id: string;
  plateNumber: string;
  model: string;
  year: number | null;
  status: "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE" | "RETIRED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateTruckInput {
  plateNumber: string;
  model: string;
  year?: number;
}

export interface UpdateTruckInput {
  plateNumber?: string;
  model?: string;
  year?: number;
  status?: Truck["status"];
}

export function useTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<Truck[]>("/api/trucks")
      .then((data) => {
        setTrucks(data);
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

  return { trucks, isLoading, error, refetch };
}

export function useCreateTruck() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createTruck = useCallback(async (input: CreateTruckInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<Truck>("/api/trucks", input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createTruck, isLoading, error };
}

export function useUpdateTruck() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateTruck = useCallback(async (id: string, input: UpdateTruckInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.patch<Truck>(`/api/trucks/${id}`, input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateTruck, isLoading, error };
}

export function useDeleteTruck() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const deleteTruck = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.del<Truck>(`/api/trucks/${id}`);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteTruck, isLoading, error };
}
