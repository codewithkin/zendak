import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { tripsController } from "./trips.controller";

const tripsRoutes = new Hono<AuthEnv>();

tripsRoutes.use("/*", authMiddleware);

tripsRoutes.post("/", requireRole("ADMIN", "OPERATIONS"), tripsController.create);
tripsRoutes.get("/", requireRole("ADMIN", "OPERATIONS", "ACCOUNTANT", "DRIVER"), tripsController.findAll);
tripsRoutes.get("/:id", requireRole("ADMIN", "OPERATIONS", "ACCOUNTANT", "DRIVER"), tripsController.findById);
tripsRoutes.patch("/:id", requireRole("ADMIN", "OPERATIONS"), tripsController.update);
tripsRoutes.post("/:id/start", requireRole("ADMIN", "OPERATIONS", "DRIVER"), tripsController.start);
tripsRoutes.post("/:id/complete", requireRole("ADMIN", "OPERATIONS", "DRIVER"), tripsController.complete);
tripsRoutes.post("/:id/settle", requireRole("ADMIN", "ACCOUNTANT"), tripsController.settle);

export { tripsRoutes };
