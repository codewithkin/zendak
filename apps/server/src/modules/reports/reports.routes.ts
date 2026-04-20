import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireActiveSubscription } from "../../middleware/plan-limits";
import type { AuthEnv } from "../../types";
import { reportsController } from "./reports.controller";

const reportsRoutes = new Hono<AuthEnv>();

reportsRoutes.get(
	"/trips",
	authMiddleware,
	requireActiveSubscription(),
	reportsController.tripReport,
);

reportsRoutes.get(
	"/fleet",
	authMiddleware,
	requireActiveSubscription(),
	reportsController.fleetReport,
);

reportsRoutes.get(
	"/operating-costs",
	authMiddleware,
	requireActiveSubscription(),
	reportsController.operatingCosts,
);

reportsRoutes.get(
	"/categorical-spending",
	authMiddleware,
	requireActiveSubscription(),
	reportsController.categoricalSpending,
);

export { reportsRoutes };
