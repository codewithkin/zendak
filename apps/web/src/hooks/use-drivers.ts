"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";

export interface Driver {
  id: string;
  userId: string;
  licenseNo: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    active: boolean;
  };
}

export interface CreateDriverInput {
  email: string;
  password: string;
  name: string;
  licenseNo: string;
  phone?: string;
}

export interface UpdateDriverInput {
  licenseNo?: string;
  phone?: string;
  name?: string;
}

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<Driver[]>("/api/drivers")
      .then((data) => {
        setDrivers(data);
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

  return { drivers, isLoading, error, refetch };
}

export function useCreateDriver() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createDriver = useCallback(async (input: CreateDriverInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<Driver>("/api/drivers", input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createDriver, isLoading, error };
}

export function useUpdateDriver() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateDriver = useCallback(async (id: string, input: UpdateDriverInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.patch<Driver>(`/api/drivers/${id}`, input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateDriver, isLoading, error };
}
