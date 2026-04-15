import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { trucksController } from "./trucks.controller";

const trucksRoutes = new Hono<AuthEnv>();

trucksRoutes.use("/*", authMiddleware);

trucksRoutes.post("/", requireRole("ADMIN"), trucksController.create);
trucksRoutes.get("/", requireRole("ADMIN", "OPERATIONS", "ACCOUNTANT"), trucksController.findAll);
trucksRoutes.get("/:id", requireRole("ADMIN", "OPERATIONS", "ACCOUNTANT"), trucksController.findById);
trucksRoutes.patch("/:id", requireRole("ADMIN"), trucksController.update);
trucksRoutes.delete("/:id", requireRole("ADMIN"), trucksController.retire);

export { trucksRoutes };
