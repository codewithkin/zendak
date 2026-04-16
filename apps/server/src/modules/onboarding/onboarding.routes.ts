import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { onboardingController } from "./onboarding.controller";

const onboardingRoutes = new Hono<AuthEnv>();

onboardingRoutes.post("/", authMiddleware, requireRole("ADMIN"), onboardingController.onboard);

export { onboardingRoutes };
