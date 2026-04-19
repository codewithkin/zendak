"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";
import type { PlanDefinition, PlanName } from "@zendak/plans";

export interface Subscription {
	plan: PlanDefinition | null;
	planName: PlanName | null;
	subscriptionStatus: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
	trialEndsAt: string | null;
	planActivatedAt: string | null;
	isTrialExpired: boolean;
}

export interface PaymentStatus {
	id: string;
	planName: PlanName;
	amount: string;
	paid: boolean;
	processed: boolean;
	plan: PlanDefinition;
}

export interface CheckoutResponse {
	paymentId: string;
	amount: number;
	planName: PlanName;
	planLabel: string;
	successUrl: string;
}

export function useSubscription(businessId: string | null | undefined) {
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<ApiError | null>(null);

	useEffect(() => {
		if (!businessId) {
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		apiClient
			.get<Subscription>(`/api/billing/subscription?businessId=${businessId}`)
			.then((data) => {
				if (!cancelled) {
					setSubscription(data);
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
	}, [businessId]);

	return { subscription, isLoading, error };
}

export function useCreateCheckout() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<ApiError | null>(null);

	const createCheckout = useCallback(
		async (planName: PlanName, businessId: string) => {
			setIsLoading(true);
			setError(null);
			try {
				const data = await apiClient.post<CheckoutResponse>("/api/billing/checkout", {
					planName,
				});
				return data;
			} catch (err) {
				const apiErr = err instanceof ApiError ? err : new ApiError("Network error", 0);
				setError(apiErr);
				throw apiErr;
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	return { createCheckout, isLoading, error };
}

export function usePaymentStatus(paymentId: string | null) {
	const [payment, setPayment] = useState<PaymentStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<ApiError | null>(null);

	useEffect(() => {
		if (!paymentId) {
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		apiClient
			.get<PaymentStatus>(`/api/billing/payments/${paymentId}`)
			.then((data) => {
				if (!cancelled) {
					setPayment(data);
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
	}, [paymentId]);

	return { payment, isLoading, error };
}

export function useActivatePlan() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<ApiError | null>(null);

	const activatePlan = useCallback(async (intermediatePaymentId: string) => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await apiClient.post<{ business: unknown; plan: PlanDefinition }>(
				"/api/billing/activate-plan",
				{ intermediatePaymentId },
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

	return { activatePlan, isLoading, error };
}

export function useMarkPaymentPaid() {
	const [isLoading, setIsLoading] = useState(false);

	const markPaid = useCallback(async (paymentId: string) => {
		setIsLoading(true);
		try {
			await apiClient.post(`/api/billing/payments/${paymentId}/mark-paid`, {});
		} finally {
			setIsLoading(false);
		}
	}, []);

	return { markPaid, isLoading };
}
