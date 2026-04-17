import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { driversController } from "./drivers.controller";

const driversRoutes = new Hono<AuthEnv>();

driversRoutes.use("/*", authMiddleware);

driversRoutes.post("/", requireRole("ADMIN"), driversController.create);
driversRoutes.get("/me", requireRole("DRIVER"), driversController.me);
driversRoutes.get("/search", requireRole("ADMIN", "OPERATIONS"), driversController.search);
driversRoutes.get("/", requireRole("ADMIN", "OPERATIONS"), driversController.findAll);
driversRoutes.get("/:id", requireRole("ADMIN", "OPERATIONS"), driversController.findById);
driversRoutes.patch("/:id", requireRole("ADMIN"), driversController.update);

export { driversRoutes };
