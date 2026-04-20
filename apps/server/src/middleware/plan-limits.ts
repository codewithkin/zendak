import type { Context, Next } from "hono";
import { type Feature, type PlanName, PLANS, hasFeature, isWithinLimit, formatStorage } from "@zendak/plans";

import { AppError } from "../lib/errors";
import type { AuthEnv } from "../types";
import { billingRepository } from "../modules/billing/billing.repository";

/**
 * Middleware that checks if the business subscription is active (not expired trial or cancelled).
 * Blocks mutation operations when trial is expired and no plan is active.
 */
export function requireActiveSubscription() {
	return async (c: Context<AuthEnv>, next: Next) => {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		// Fetch user's business
		const userRecord = await getUserBusiness(user.id);
		if (!userRecord?.businessId) {
			// No business yet — let onboarding proceed
			await next();
			return;
		}

		const business = await billingRepository.getBusinessById(userRecord.businessId);
		if (!business) {
			await next();
			return;
		}

		// If subscription is active, allow
		if (business.subscriptionStatus === "ACTIVE" && business.plan) {
			c.set("businessId", business.id);
			c.set("planName", business.plan);
			await next();
			return;
		}

		// If trial, check expiration
		if (business.subscriptionStatus === "TRIAL") {
			if (business.trialEndsAt && new Date() > new Date(business.trialEndsAt)) {
				throw AppError.forbidden(
					"Your trial has expired. Please subscribe to a plan to continue.",
				);
			}
			c.set("businessId", business.id);
			c.set("planName", business.plan);
			await next();
			return;
		}

		// CANCELLED or PAST_DUE
		throw AppError.forbidden(
			"Your subscription is inactive. Please subscribe to a plan to continue.",
		);
	};
}

/**
 * Middleware that checks if the business plan has a specific feature.
 */
export function requireFeature(feature: Feature) {
	return async (c: Context<AuthEnv>, next: Next) => {
		const planName = c.get("planName") as PlanName | undefined;

		// During trial (no plan), allow basic features
		if (!planName) {
			const basicFeatures: Feature[] = [
				"fleet_management",
				"driver_management",
				"trip_tracking",
				"basic_expense_logging",
				"basic_pdf_reports",
			];
			if (!basicFeatures.includes(feature)) {
				throw AppError.forbidden(
					`The "${feature}" feature requires a paid plan. Please upgrade.`,
				);
			}
			await next();
			return;
		}

		if (!hasFeature(planName, feature)) {
			throw AppError.forbidden(
				`Your current plan does not include the "${feature}" feature. Please upgrade.`,
			);
		}

		await next();
	};
}

/**
 * Middleware that checks count-based plan limits.
 */
export function requireWithinLimit(resource: "maxTrucks" | "maxUsers" | "maxTripsPerMonth") {
	return async (c: Context<AuthEnv>, next: Next) => {
		const planName = c.get("planName") as PlanName | undefined;
		const businessId = c.get("businessId") as string | undefined;

		// During trial, use Foundation limits
		const effectivePlan: PlanName = planName ?? "FOUNDATION";

		if (!businessId) {
			await next();
			return;
		}

		let currentCount: number;
		const limitLabel = {
			maxTrucks: "trucks",
			maxUsers: "users",
			maxTripsPerMonth: "trips this month",
		}[resource];

		if (resource === "maxTrucks") {
			const { truckCount } = await billingRepository.getBusinessWithCounts(businessId);
			currentCount = truckCount;
		} else if (resource === "maxUsers") {
			const { userCount } = await billingRepository.getBusinessWithCounts(businessId);
			currentCount = userCount;
		} else {
			currentCount = await billingRepository.getMonthlyTripCount(businessId);
		}

		if (!isWithinLimit(effectivePlan, resource, currentCount)) {
			const limit = PLANS[effectivePlan].limits[resource];
			const limitStr = limit === Infinity ? "unlimited" : limit.toString();
			throw AppError.forbidden(
				`You've reached your limit of ${limitStr} ${limitLabel}. Please upgrade your plan.`,
			);
		}

		await next();
	};
}

/**
 * Middleware that checks if the business has storage available for a file upload.
 */
export function requireStorageAvailable() {
	return async (c: Context<AuthEnv>, next: Next) => {
		const planName = c.get("planName") as PlanName | undefined;
		const businessId = c.get("businessId") as string | undefined;

		const effectivePlan: PlanName = planName ?? "FOUNDATION";

		if (!businessId) {
			await next();
			return;
		}

		const business = await billingRepository.getBusinessById(businessId);
		if (!business) {
			await next();
			return;
		}

		const maxBytes = PLANS[effectivePlan].limits.maxStorageBytes;
		const usedBytes = Number(business.storageUsedBytes);

		if (usedBytes >= maxBytes) {
			throw AppError.forbidden(
				`You've reached your storage limit of ${formatStorage(maxBytes)}. Please upgrade your plan.`,
			);
		}

		await next();
	};
}

// Helper to get user's businessId
import prisma from "@zendak/db";

async function getUserBusiness(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: { businessId: true },
	});
}
