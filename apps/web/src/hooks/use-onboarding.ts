"use client";

import { useCallback, useState } from "react";

import { apiClient, ApiError } from "@/lib/api";

export interface OnboardingInput {
  businessName: string;
  location: string;
  truckCount: number;
  employeeCount: number;
  phone?: string;
}

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const submitOnboarding = useCallback(async (input: OnboardingInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<{ user: unknown; business: unknown }>(
        "/api/onboarding",
        input,
      );
      return data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
      setError(apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { submitOnboarding, isLoading, error };
}
