import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import { generateCsv } from "../../lib/csv";
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

	async operatingCosts(c: Context<AuthEnv>) {
		const businessId = c.get("businessId");
		if (!businessId) throw AppError.badRequest("No business context");

		const filters = {
			startDate: c.req.query("startDate"),
			endDate: c.req.query("endDate"),
			truckId: c.req.query("truckId"),
		};

		const format = c.req.query("format");

		if (format === "pdf") {
			const pdf = await reportsService.generateOperatingCostsPdf(businessId, filters);
			c.header("Content-Type", "application/pdf");
			c.header("Content-Disposition", 'attachment; filename="operating-costs.pdf"');
			return c.body(pdf);
		}

		if (format === "csv") {
			const data = await reportsService.getOperatingCosts(businessId, filters);
			const csv = generateCsv(
				["Type", "Amount", "Description", "Truck", "Date"],
				data.expenses.map((e) => [
					e.type,
					e.amount.toFixed(2),
					e.description ?? "",
					e.truck?.plateNumber ?? "",
					new Date(e.createdAt).toLocaleDateString(),
				]),
			);
			c.header("Content-Type", "text/csv");
			c.header("Content-Disposition", 'attachment; filename="operating-costs.csv"');
			return c.body(csv);
		}

		const data = await reportsService.getOperatingCosts(businessId, filters);
		return c.json(data);
	},

	async categoricalSpending(c: Context<AuthEnv>) {
		const businessId = c.get("businessId");
		if (!businessId) throw AppError.badRequest("No business context");

		const filters = {
			startDate: c.req.query("startDate"),
			endDate: c.req.query("endDate"),
		};

		const format = c.req.query("format");

		if (format === "pdf") {
			const pdf = await reportsService.generateCategoricalSpendingPdf(businessId, filters);
			c.header("Content-Type", "application/pdf");
			c.header("Content-Disposition", 'attachment; filename="categorical-spending.pdf"');
			return c.body(pdf);
		}

		if (format === "csv") {
			const data = await reportsService.getCategoricalSpending(businessId, filters);
			const csv = generateCsv(
				["Category", "Count", "Total", "Percentage"],
				data.map((d) => [d.type, d.count.toString(), d.total.toFixed(2), `${d.percentage.toFixed(1)}%`]),
			);
			c.header("Content-Type", "text/csv");
			c.header("Content-Disposition", 'attachment; filename="categorical-spending.csv"');
			return c.body(csv);
		}

		const data = await reportsService.getCategoricalSpending(businessId, filters);
		return c.json(data);
	},
};
