import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { usersController } from "./users.controller";

const usersRoutes = new Hono<AuthEnv>();

usersRoutes.use("/*", authMiddleware);

usersRoutes.get("/", requireRole("ADMIN"), usersController.findAll);
usersRoutes.post("/invite", requireRole("ADMIN"), usersController.invite);

export { usersRoutes };
