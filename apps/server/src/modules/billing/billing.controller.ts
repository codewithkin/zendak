import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { activatePlanSchema, createCheckoutSchema } from "./billing.schema";
import { billingService } from "./billing.service";

export const billingController = {
	async createCheckout(c: Context<AuthEnv>) {
		const user = c.get("user");
		const body = await c.req.json();
		const parsed = createCheckoutSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}

		// Need businessId from user context — fetch from DB
		const result = await billingService.createCheckout(
			user.id,
			c.req.header("x-business-id") ?? "",
			parsed.data,
		);
		return c.json(result, 201);
	},

	async activatePlan(c: Context<AuthEnv>) {
		const user = c.get("user");
		const body = await c.req.json();
		const parsed = activatePlanSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}

		const result = await billingService.activatePlan(user.id, parsed.data);
		return c.json(result);
	},

	async markPaid(c: Context<AuthEnv>) {
		const paymentId = c.req.param("id");
		const result = await billingService.markPaymentPaid(paymentId);
		return c.json(result);
	},

	async getPaymentStatus(c: Context<AuthEnv>) {
		const paymentId = c.req.param("id");
		const result = await billingService.getPaymentStatus(paymentId);
		return c.json(result);
	},

	async getSubscription(c: Context<AuthEnv>) {
		const businessId = c.req.query("businessId");
		if (!businessId) {
			throw AppError.badRequest("businessId is required");
		}

		const result = await billingService.getBusinessSubscription(businessId);
		return c.json(result);
	},
};
