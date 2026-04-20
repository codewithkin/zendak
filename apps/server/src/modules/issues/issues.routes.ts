import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { issuesController } from "./issues.controller";

const issuesRoutes = new Hono<AuthEnv>();

issuesRoutes.use("/*", authMiddleware);

issuesRoutes.post("/", requireRole("ADMIN", "OPERATIONS", "DRIVER"), issuesController.create);
issuesRoutes.get("/stats", requireRole("ADMIN", "OPERATIONS"), issuesController.stats);
issuesRoutes.get("/", requireRole("ADMIN", "OPERATIONS", "DRIVER"), issuesController.findAll);
issuesRoutes.get("/:id", requireRole("ADMIN", "OPERATIONS", "DRIVER"), issuesController.findById);
issuesRoutes.patch("/:id", requireRole("ADMIN", "OPERATIONS"), issuesController.update);
issuesRoutes.delete("/:id", requireRole("ADMIN"), issuesController.delete);

export { issuesRoutes };
