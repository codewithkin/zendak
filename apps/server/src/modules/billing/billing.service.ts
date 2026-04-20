import { PLANS, type PlanName } from "@zendak/plans";
import { env } from "@zendak/env/server";

import { AppError } from "../../lib/errors";
import { polar, POLAR_PRODUCT_IDS } from "../../lib/polar";
import type { CreateCheckoutInput } from "./billing.schema";
import { billingRepository } from "./billing.repository";

export const billingService = {
	async createCheckout(userId: string, businessId: string, input: CreateCheckoutInput) {
		const plan = PLANS[input.planName as PlanName];
		if (!plan) {
			throw AppError.badRequest("Invalid plan name");
		}

		const business = await billingRepository.getBusinessById(businessId);
		if (!business) {
			throw AppError.notFound("Business not found");
		}

		const user = await billingRepository.getUserById(userId);
		if (!user) {
			throw AppError.notFound("User not found");
		}

		const productId = POLAR_PRODUCT_IDS[input.planName as PlanName];

		// Create Polar checkout session
		const checkout = await polar.checkouts.create({
			products: [productId],
			successUrl: `${env.CORS_ORIGIN}/payments/success`,
			customerEmail: user.email,
			customerName: user.name,
			metadata: {
				businessId,
				userId,
				planName: input.planName,
			},
		});

		return {
			checkoutUrl: checkout.url,
			planName: plan.name,
			planLabel: plan.label,
		};
	},

	async getBusinessSubscription(businessId: string) {
		const business = await billingRepository.getBusinessById(businessId);
		if (!business) {
			throw AppError.notFound("Business not found");
		}

		const plan = business.plan ? PLANS[business.plan as PlanName] : null;
		const isTrialExpired = business.trialEndsAt
			? new Date() > new Date(business.trialEndsAt)
			: false;

		return {
			plan,
			planName: business.plan,
			subscriptionStatus: business.subscriptionStatus,
			trialEndsAt: business.trialEndsAt,
			planActivatedAt: business.planActivatedAt,
			isTrialExpired,
		};
	},
};
