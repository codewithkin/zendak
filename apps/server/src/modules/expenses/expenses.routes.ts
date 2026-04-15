import { Hono } from "hono";

import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import type { AuthEnv } from "../../types";
import { expensesController } from "./expenses.controller";

const expensesRoutes = new Hono<AuthEnv>();

expensesRoutes.use("/*", authMiddleware);

expensesRoutes.post("/", requireRole("ADMIN", "OPERATIONS", "DRIVER"), expensesController.create);
expensesRoutes.get("/", requireRole("ADMIN", "ACCOUNTANT", "OPERATIONS"), expensesController.findAll);
expensesRoutes.get("/:id", requireRole("ADMIN", "ACCOUNTANT", "OPERATIONS"), expensesController.findById);
expensesRoutes.patch("/:id", requireRole("ADMIN", "ACCOUNTANT"), expensesController.update);
expensesRoutes.delete("/:id", requireRole("ADMIN"), expensesController.delete);

export { expensesRoutes };
