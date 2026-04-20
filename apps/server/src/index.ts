import { env } from "@zendak/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { AppError } from "./lib/errors";
import { authRoutes } from "./modules/auth/auth.routes";
import { billingRoutes } from "./modules/billing/billing.routes";
import { crashReportsRoutes } from "./modules/crash-reports/crash-reports.routes";
import { driversRoutes } from "./modules/drivers/drivers.routes";
import { expensesRoutes } from "./modules/expenses/expenses.routes";
import { inspectionsRoutes } from "./modules/inspections/inspections.routes";
import { issuesRoutes } from "./modules/issues/issues.routes";
import { notificationsRoutes } from "./modules/notifications/notifications.routes";
import { onboardingRoutes } from "./modules/onboarding/onboarding.routes";
import { profitRoutes } from "./modules/profit/profit.routes";
import { reportsRoutes } from "./modules/reports/reports.routes";
import { revenueRoutes } from "./modules/revenue/revenue.routes";
import { tripsRoutes } from "./modules/trips/trips.routes";
import { trucksRoutes } from "./modules/trucks/trucks.routes";
import { uploadsRoutes } from "./modules/uploads/uploads.routes";
import { usersRoutes } from "./modules/users/users.routes";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
	}),
);

app.get("/", (c) => {
	return c.json({ status: "ok" });
});

// ─── Module Routes ──────────────────────────────────────
app.route("/api/auth", authRoutes);
app.route("/api/onboarding", onboardingRoutes);
app.route("/api/billing", billingRoutes);
app.route("/api/reports", reportsRoutes);
app.route("/api/trucks", trucksRoutes);
app.route("/api/drivers", driversRoutes);
app.route("/api/trips", tripsRoutes);
app.route("/api/expenses", expensesRoutes);
app.route("/api/inspections", inspectionsRoutes);
app.route("/api/issues", issuesRoutes);
app.route("/api/revenue", revenueRoutes);
app.route("/api/profit", profitRoutes);
app.route("/api/users", usersRoutes);
app.route("/api/uploads", uploadsRoutes);
app.route("/api/notifications", notificationsRoutes);
app.route("/api/crash-reports", crashReportsRoutes);

// ─── Global Error Handler ───────────────────────────────
app.onError((err, c) => {
	if (err instanceof AppError) {
		return c.json({ error: err.message }, err.statusCode as 400);
	}
	console.error("Unhandled error:", err);
	return c.json({ error: "Internal server error" }, 500);
});

export default app;
