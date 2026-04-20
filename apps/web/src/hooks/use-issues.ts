"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";

export type IssueSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  truckId: string | null;
  driverId: string | null;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  truck: { id: string; plateNumber: string } | null;
  driver: { id: string; user: { name: string } } | null;
  reporter: { id: string; name: string };
}

export interface IssueStats {
  OPEN: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  CLOSED: number;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  severity: IssueSeverity;
  truckId?: string;
  driverId?: string;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  severity?: IssueSeverity;
  status?: IssueStatus;
  truckId?: string | null;
  driverId?: string | null;
}

export interface IssueFilters {
  status?: string;
  severity?: string;
  truckId?: string;
  driverId?: string;
}

export function useIssues(filters?: IssueFilters) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.severity) params.set("severity", filters.severity);
    if (filters?.truckId) params.set("truckId", filters.truckId);
    if (filters?.driverId) params.set("driverId", filters.driverId);
    const query = params.toString();
    const path = `/api/issues${query ? `?${query}` : ""}`;

    apiClient
      .get<Issue[]>(path)
      .then((data) => {
        setIssues(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err : new ApiError("Network error", 0));
      })
      .finally(() => setIsLoading(false));
  }, [filters?.status, filters?.severity, filters?.truckId, filters?.driverId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { issues, isLoading, error, refetch };
}

export function useIssueStats() {
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<IssueStats>("/api/issues/stats")
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, isLoading, refetch };
}

export function useCreateIssue() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createIssue = useCallback(async (input: CreateIssueInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<Issue>("/api/issues", input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createIssue, isLoading, error };
}

export function useUpdateIssue() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateIssue = useCallback(async (id: string, input: UpdateIssueInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.patch<Issue>(`/api/issues/${id}`, input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateIssue, isLoading, error };
}

export function useDeleteIssue() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const deleteIssue = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.del(`/api/issues/${id}`);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteIssue, isLoading, error };
}
