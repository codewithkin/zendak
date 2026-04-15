import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import type { AuthEnv } from "../../types";
import { authController } from "./auth.controller";

const authRoutes = new Hono<AuthEnv>();

authRoutes.post("/signup", authController.signup);
authRoutes.post("/login", authController.login);
authRoutes.get("/me", authMiddleware, authController.me);

export { authRoutes };
