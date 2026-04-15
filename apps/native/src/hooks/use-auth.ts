import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "ACCOUNTANT" | "OPERATIONS" | "DRIVER";
  phone?: string;
  active: boolean;
  onboardedAt?: string | null;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface OnboardingInput {
  phone: string;
  [key: string]: string;
}

/**
 * Fetch current authenticated user
 */
export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const isAuth = await apiClient.isAuthenticated();
      if (!isAuth) {
        throw new Error("Not authenticated");
      }
      const { data } = await apiClient.http.get<User>("/api/auth/me");
      return data;
    },
    retry: false,
  });
}

/**
 * Login mutation
 */
export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await apiClient.http.post<LoginResponse>("/api/auth/login", input);
      await apiClient.setToken(data.token);
      return data;
    },
  });
}

/**
 * Complete onboarding mutation
 */
export function useOnboarding() {
  return useMutation({
    mutationFn: async (input: OnboardingInput) => {
      const { data } = await apiClient.http.post<User>("/api/auth/onboarding", input);
      return data;
    },
  });
}

/**
 * Logout helper
 */
export function useLogout() {
  return async () => {
    await apiClient.clearToken();
  };
}
