import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { reportsService } from "./reports.service";

export const reportsController = {
	async tripReport(c: Context<AuthEnv>) {
		const businessId = c.get("businessId");
		if (!businessId) throw AppError.badRequest("No business context");

		const filters = {
			startDate: c.req.query("startDate"),
			endDate: c.req.query("endDate"),
			driverId: c.req.query("driverId"),
			truckId: c.req.query("truckId"),
		};

		const pdf = await reportsService.generateTripReport(businessId, filters);

		c.header("Content-Type", "application/pdf");
		c.header("Content-Disposition", 'attachment; filename="trip-report.pdf"');
		return c.body(pdf);
	},

	async fleetReport(c: Context<AuthEnv>) {
		const businessId = c.get("businessId");
		if (!businessId) throw AppError.badRequest("No business context");

		const filters = {
			startDate: c.req.query("startDate"),
			endDate: c.req.query("endDate"),
		};

		const pdf = await reportsService.generateFleetReport(businessId, filters);

		c.header("Content-Type", "application/pdf");
		c.header("Content-Disposition", 'attachment; filename="fleet-report.pdf"');
		return c.body(pdf);
	},
};
