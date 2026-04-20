import { PLANS, type PlanName } from "@zendak/plans";
import { env } from "@zendak/env/server";

import { AppError } from "../../lib/errors";
import { sendSubscriptionEmail } from "../../lib/mailer";
import { notificationsService } from "../notifications/notifications.service";
import type { CreateCheckoutInput, ActivatePlanInput } from "./billing.schema";
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

		// Create intermediate payment record
		const payment = await billingRepository.createIntermediatePayment({
			userId,
			businessId,
			planName: input.planName as PlanName,
			amount: plan.price,
		});

		// Build checkout URL for Polar
		const successUrl = `${env.CORS_ORIGIN}/payments/success?intermediatePayment=${payment.id}`;

		return {
			paymentId: payment.id,
			amount: plan.price,
			planName: plan.name,
			planLabel: plan.label,
			successUrl,
		};
	},

	async activatePlan(userId: string, input: ActivatePlanInput) {
		const payment = await billingRepository.findIntermediatePayment(input.intermediatePaymentId);
		if (!payment) {
			throw AppError.notFound("Payment record not found");
		}

		if (payment.processed) {
			throw AppError.conflict("Payment has already been processed");
		}

		if (!payment.paid) {
			throw AppError.badRequest("Payment has not been completed yet");
		}

		// Activate the plan for the business
		const business = await billingRepository.activateBusinessPlan(
			payment.businessId,
			payment.planName as PlanName,
		);

		// Mark payment as processed
		await billingRepository.markPaymentProcessed(payment.id);

		// Fire-and-forget: notify admins about plan activation
		const plan = PLANS[payment.planName as PlanName];
		notificationsService.notifyByRole({
			businessId: payment.businessId,
			roles: ["ADMIN"],
			title: "Plan Activated",
			message: `Your plan has been upgraded to ${plan.label}`,
			type: "PLAN_ACTIVATED",
			metadata: { planName: payment.planName },
		}).catch(() => {});

		// Send subscription confirmation email (fire-and-forget)
		const user = await billingRepository.getUserById(userId);
		if (user) {
			sendSubscriptionEmail({
				to: user.email,
				recipientName: user.name,
				planName: payment.planName as PlanName,
			}).catch(() => {
				// Email failure should not block activation
			});
		}

		return {
			business,
			plan: PLANS[payment.planName as PlanName],
		};
	},

	async markPaymentPaid(paymentId: string) {
		const payment = await billingRepository.findIntermediatePayment(paymentId);
		if (!payment) {
			throw AppError.notFound("Payment record not found");
		}

		if (payment.paid) {
			throw AppError.conflict("Payment is already marked as paid");
		}

		return billingRepository.markPaymentPaid(paymentId);
	},

	async getPaymentStatus(paymentId: string) {
		const payment = await billingRepository.findIntermediatePayment(paymentId);
		if (!payment) {
			throw AppError.notFound("Payment record not found");
		}

		return {
			id: payment.id,
			planName: payment.planName,
			amount: payment.amount,
			paid: payment.paid,
			processed: payment.processed,
			plan: PLANS[payment.planName as PlanName],
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
