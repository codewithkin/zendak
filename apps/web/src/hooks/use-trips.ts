"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "SETTLED";
  driverId: string;
  truckId: string;
  distance: string | null;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  driver: {
    id: string;
    userId: string;
    licenseNo: string;
    phone: string | null;
    user: { name: string };
  };
  truck: {
    id: string;
    plateNumber: string;
    model: string;
    year: number | null;
    status: string;
  };
}

export interface CreateTripInput {
  origin: string;
  destination: string;
  driverId: string;
  truckId: string;
  distance?: number;
  notes?: string;
}

export interface UpdateTripInput {
  origin?: string;
  destination?: string;
  distance?: number;
  notes?: string;
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<Trip[]>("/api/trips")
      .then((data) => {
        setTrips(data);
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

  return { trips, isLoading, error, refetch };
}

export function useCreateTrip() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createTrip = useCallback(async (input: CreateTripInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<Trip>("/api/trips", input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createTrip, isLoading, error };
}

export function useUpdateTrip() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateTrip = useCallback(async (id: string, input: UpdateTripInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.patch<Trip>(`/api/trips/${id}`, input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateTrip, isLoading, error };
}

export function useStartTrip() {
  const [isLoading, setIsLoading] = useState(false);

  const startTrip = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient.post<Trip>(`/api/trips/${id}/start`, {});
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { startTrip, isLoading };
}

export function useCompleteTrip() {
  const [isLoading, setIsLoading] = useState(false);

  const completeTrip = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient.post<Trip>(`/api/trips/${id}/complete`, {});
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { completeTrip, isLoading };
}

export function useSettleTrip() {
  const [isLoading, setIsLoading] = useState(false);

  const settleTrip = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient.post<Trip>(`/api/trips/${id}/settle`, {});
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { settleTrip, isLoading };
}
