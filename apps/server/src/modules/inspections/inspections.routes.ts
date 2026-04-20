import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { inspectionsController } from "./inspections.controller";

const inspectionsRoutes = new Hono<AuthEnv>();

inspectionsRoutes.use("/*", authMiddleware);

inspectionsRoutes.post("/", requireRole("ADMIN", "OPERATIONS", "DRIVER"), inspectionsController.create);
inspectionsRoutes.get("/", requireRole("ADMIN", "OPERATIONS"), inspectionsController.findAll);
inspectionsRoutes.get("/:id", requireRole("ADMIN", "OPERATIONS"), inspectionsController.findById);

export { inspectionsRoutes };
