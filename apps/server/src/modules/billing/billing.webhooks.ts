import { Webhooks } from "@polar-sh/hono";
import { PLANS, TRIAL_DAYS, type PlanName } from "@zendak/plans";
import { env } from "@zendak/env/server";

import { sendSubscriptionEmail } from "../../lib/mailer";
import { notificationsService } from "../notifications/notifications.service";
import { billingRepository } from "./billing.repository";
import { POLAR_PRODUCT_IDS } from "../../lib/polar";

/** Reverse lookup: Polar product ID → PlanName */
function resolvePlanFromProductId(productId: string): PlanName | null {
	for (const [name, id] of Object.entries(POLAR_PRODUCT_IDS)) {
		if (id === productId) return name as PlanName;
	}
	return null;
}

export const polarWebhookHandler = Webhooks({
	webhookSecret: env.POLAR_WEBHOOK_SECRET,

	onSubscriptionCreated: async (payload) => {
		const sub = payload.data;
		const metadata = sub.metadata as Record<string, string> | null;
		const businessId = metadata?.businessId;
		if (!businessId) return;

		const productId = sub.product.id;
		const planName = resolvePlanFromProductId(productId);
		if (!planName) return;

		const trialEndsAt = new Date();
		trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

		await billingRepository.updateBusinessSubscription(businessId, {
			plan: planName,
			subscriptionStatus: "TRIAL",
			trialEndsAt,
			planActivatedAt: new Date(),
			polarSubscriptionId: sub.id,
		});

		if (sub.customer?.id) {
			await billingRepository.updateBusinessPolarIds(businessId, {
				polarCustomerId: sub.customer.id,
			});
		}

		// Notify admins
		const plan = PLANS[planName];
		notificationsService
			.notifyByRole({
				businessId,
				roles: ["ADMIN"],
				title: "Trial Started",
				message: `Your ${plan.label} trial has started — ${TRIAL_DAYS} days free`,
				type: "PLAN_ACTIVATED",
				metadata: { planName },
			})
			.catch(() => {});

		// Email confirmation
		const userId = metadata?.userId;
		if (userId) {
			const user = await billingRepository.getUserById(userId);
			if (user) {
				sendSubscriptionEmail({
					to: user.email,
					recipientName: user.name,
					planName,
				}).catch(() => {});
			}
		}
	},

	onSubscriptionActive: async (payload) => {
		const sub = payload.data;
		const business = await billingRepository.findBusinessByPolarSubscriptionId(sub.id);
		if (!business) return;

		await billingRepository.updateBusinessSubscription(business.id, {
			subscriptionStatus: "ACTIVE",
		});
	},

	onSubscriptionCanceled: async (payload) => {
		const sub = payload.data;
		const business = await billingRepository.findBusinessByPolarSubscriptionId(sub.id);
		if (!business) return;

		await billingRepository.updateBusinessSubscription(business.id, {
			subscriptionStatus: "CANCELLED",
		});

		notificationsService
			.notifyByRole({
				businessId: business.id,
				roles: ["ADMIN"],
				title: "Subscription Cancelled",
				message: "Your subscription has been cancelled.",
				type: "PLAN_ACTIVATED",
				metadata: {},
			})
			.catch(() => {});
	},

	onSubscriptionRevoked: async (payload) => {
		const sub = payload.data;
		const business = await billingRepository.findBusinessByPolarSubscriptionId(sub.id);
		if (!business) return;

		await billingRepository.updateBusinessSubscription(business.id, {
			subscriptionStatus: "CANCELLED",
			plan: undefined,
		});
	},

	onSubscriptionUncanceled: async (payload) => {
		const sub = payload.data;
		const business = await billingRepository.findBusinessByPolarSubscriptionId(sub.id);
		if (!business) return;

		await billingRepository.updateBusinessSubscription(business.id, {
			subscriptionStatus: "ACTIVE",
		});
	},
});
