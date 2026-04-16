"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "ACCOUNTANT" | "OPERATIONS" | "DRIVER";
  active: boolean;
  onboardedAt: string | null;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export function useMe() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      setIsLoading(false);
      setError(new ApiError("Not authenticated", 401));
      return;
    }

    let cancelled = false;
    apiClient
      .get<User>("/api/auth/me")
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err : new ApiError("Network error", 0));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, isLoading, error };
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const login = useCallback(async (input: LoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<AuthResponse>("/api/auth/login", input);
      apiClient.setToken(data.token);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { login, isLoading, error };
}

export function useLogout() {
  return useCallback(() => {
    apiClient.clearToken();
  }, []);
}

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const signup = useCallback(async (input: SignupInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<AuthResponse>("/api/auth/signup", input);
      apiClient.setToken(data.token);
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { signup, isLoading, error };
}
