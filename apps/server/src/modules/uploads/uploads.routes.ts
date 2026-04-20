import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireActiveSubscription, requireStorageAvailable } from "../../middleware/plan-limits";
import type { AuthEnv } from "../../types";
import { uploadsController } from "./uploads.controller";

const uploadsRoutes = new Hono<AuthEnv>();

uploadsRoutes.post(
	"/",
	authMiddleware,
	requireActiveSubscription(),
	requireStorageAvailable(),
	uploadsController.requestUpload,
);

export { uploadsRoutes };
