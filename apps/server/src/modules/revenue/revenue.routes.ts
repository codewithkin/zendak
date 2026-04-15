import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { revenueController } from "./revenue.controller";

const revenueRoutes = new Hono<AuthEnv>();

revenueRoutes.use("/*", authMiddleware);

revenueRoutes.post("/", requireRole("ADMIN", "ACCOUNTANT"), revenueController.create);
revenueRoutes.get("/", requireRole("ADMIN", "ACCOUNTANT"), revenueController.findAll);
revenueRoutes.get("/:id", requireRole("ADMIN", "ACCOUNTANT"), revenueController.findById);
revenueRoutes.patch("/:id", requireRole("ADMIN", "ACCOUNTANT"), revenueController.update);

export { revenueRoutes };
