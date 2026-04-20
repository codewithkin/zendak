import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { billingController } from "./billing.controller";
import { polarWebhookHandler } from "./billing.webhooks";

const billingRoutes = new Hono<AuthEnv>();

// Create Polar checkout session
billingRoutes.post(
	"/checkout",
	authMiddleware,
	requireRole("ADMIN"),
	billingController.createCheckout,
);

// Get current subscription
billingRoutes.get(
	"/subscription",
	authMiddleware,
	billingController.getSubscription,
);

// Polar webhook handler (no auth — verified by webhook secret)
billingRoutes.post("/webhooks", polarWebhookHandler);

export { billingRoutes };
