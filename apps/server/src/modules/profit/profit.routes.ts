import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { profitController } from "./profit.controller";

const profitRoutes = new Hono<AuthEnv>();

profitRoutes.use("/*", authMiddleware);
profitRoutes.use("/*", requireRole("ADMIN", "ACCOUNTANT"));

profitRoutes.get("/trip/:tripId", profitController.tripProfit);
profitRoutes.get("/truck/:truckId", profitController.truckProfit);
profitRoutes.get("/summary", profitController.summary);

export { profitRoutes };
