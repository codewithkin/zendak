"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";

export interface WorkspaceUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "ACCOUNTANT" | "OPERATIONS" | "DRIVER";
  active: boolean;
  createdAt: string;
}

export interface InviteUserInput {
  email: string;
  name: string;
  role: "ADMIN" | "ACCOUNTANT" | "OPERATIONS" | "DRIVER";
}

export function useUsers() {
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<WorkspaceUser[]>("/api/users")
      .then((data) => {
        setUsers(data);
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

  return { users, isLoading, error, refetch };
}

export function useInviteUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const inviteUser = useCallback(async (input: InviteUserInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<WorkspaceUser>("/api/users/invite", input);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { inviteUser, isLoading, error };
}
