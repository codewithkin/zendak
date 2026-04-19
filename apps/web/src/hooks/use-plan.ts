"use client";

import { useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api";
import type { PlanName, PlanDefinition, Feature } from "@zendak/plans";
import { hasFeature, isWithinLimit, type PlanLimits } from "@zendak/plans";

export interface BusinessPlan {
	plan: PlanDefinition | null;
	planName: PlanName | null;
	subscriptionStatus: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
	trialEndsAt: string | null;
	isTrialExpired: boolean;
}

export function usePlan(businessId: string | null | undefined) {
	const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!businessId) {
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		apiClient
			.get<BusinessPlan>(`/api/billing/subscription?businessId=${businessId}`)
			.then((data) => {
				if (!cancelled) {
					setBusinessPlan(data);
					setIsLoading(false);
				}
			})
			.catch(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [businessId]);

	const canUseFeature = (feature: Feature): boolean => {
		if (!businessPlan) return true; // No plan info yet, allow optimistically
		if (businessPlan.subscriptionStatus === "CANCELLED") return false;
		if (businessPlan.isTrialExpired && !businessPlan.planName) return false;
		if (!businessPlan.planName) return true; // Trial — allow basic
		return hasFeature(businessPlan.planName, feature);
	};

	const isActive =
		businessPlan?.subscriptionStatus === "ACTIVE" ||
		(businessPlan?.subscriptionStatus === "TRIAL" && !businessPlan.isTrialExpired);

	const trialDaysLeft = businessPlan?.trialEndsAt
		? Math.max(
				0,
				Math.ceil(
					(new Date(businessPlan.trialEndsAt).getTime() - Date.now()) /
						(1000 * 60 * 60 * 24),
				),
			)
		: 0;

	return {
		businessPlan,
		isLoading,
		canUseFeature,
		isActive,
		trialDaysLeft,
		isTrialExpired: businessPlan?.isTrialExpired ?? false,
		planName: businessPlan?.planName ?? null,
	};
}
