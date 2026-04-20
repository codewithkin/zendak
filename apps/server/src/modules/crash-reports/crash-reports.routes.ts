import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { requireActiveSubscription } from "../../middleware/plan-limits";
import type { AuthEnv } from "../../types";
import { crashReportsController } from "./crash-reports.controller";

const crashReportsRoutes = new Hono<AuthEnv>();

// Create a crash report (drivers only)
crashReportsRoutes.post(
	"/",
	authMiddleware,
	requireActiveSubscription(),
	requireRole("DRIVER"),
	crashReportsController.create,
);

// List crash reports (admins see all, drivers see own)
crashReportsRoutes.get(
	"/",
	authMiddleware,
	requireActiveSubscription(),
	crashReportsController.list,
);

// Get single crash report
crashReportsRoutes.get(
	"/:id",
	authMiddleware,
	requireActiveSubscription(),
	crashReportsController.getById,
);

// Update crash report status (admin/operations only)
crashReportsRoutes.patch(
	"/:id/status",
	authMiddleware,
	requireActiveSubscription(),
	requireRole("ADMIN", "OPERATIONS"),
	crashReportsController.updateStatus,
);

export { crashReportsRoutes };
