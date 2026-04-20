import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { savedReportsController } from "./saved-reports.controller";

const savedReportsRoutes = new Hono<AuthEnv>();

savedReportsRoutes.use("/*", authMiddleware);

savedReportsRoutes.post("/", requireRole("ADMIN", "OPERATIONS", "ACCOUNTANT"), savedReportsController.create);
savedReportsRoutes.get("/", requireRole("ADMIN", "OPERATIONS", "ACCOUNTANT"), savedReportsController.findMine);
savedReportsRoutes.patch("/:id", requireRole("ADMIN", "OPERATIONS", "ACCOUNTANT"), savedReportsController.update);
savedReportsRoutes.delete("/:id", requireRole("ADMIN", "OPERATIONS", "ACCOUNTANT"), savedReportsController.delete);

export { savedReportsRoutes };
