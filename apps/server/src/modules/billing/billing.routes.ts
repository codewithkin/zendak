import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { billingController } from "./billing.controller";

const billingRoutes = new Hono<AuthEnv>();

// Create checkout session
billingRoutes.post(
	"/checkout",
	authMiddleware,
	requireRole("ADMIN"),
	billingController.createCheckout,
);

// Activate plan after successful payment
billingRoutes.post(
	"/activate-plan",
	authMiddleware,
	requireRole("ADMIN"),
	billingController.activatePlan,
);

// Mark payment as paid (webhook or manual confirmation)
billingRoutes.post(
	"/payments/:id/mark-paid",
	authMiddleware,
	requireRole("ADMIN"),
	billingController.markPaid,
);

// Get payment status
billingRoutes.get(
	"/payments/:id",
	authMiddleware,
	billingController.getPaymentStatus,
);

// Get current subscription
billingRoutes.get(
	"/subscription",
	authMiddleware,
	billingController.getSubscription,
);

export { billingRoutes };
