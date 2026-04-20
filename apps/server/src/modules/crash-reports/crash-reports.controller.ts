import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import {
	createCrashReportSchema,
	listCrashReportsSchema,
	updateCrashReportStatusSchema,
} from "./crash-reports.schema";
import { crashReportsService } from "./crash-reports.service";

export const crashReportsController = {
	async create(c: Context<AuthEnv>) {
		const user = c.get("user");
		const businessId = c.get("businessId");
		if (!user || !businessId) throw AppError.unauthorized();

		const body = await c.req.json();
		const parsed = createCrashReportSchema.safeParse(body);
		if (!parsed.success) throw AppError.badRequest(parsed.error.errors[0].message);

		const report = await crashReportsService.create(user, businessId, parsed.data);
		return c.json(report, 201);
	},

	async list(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const query = c.req.query();
		const parsed = listCrashReportsSchema.safeParse(query);
		if (!parsed.success) throw AppError.badRequest(parsed.error.errors[0].message);

		const result = await crashReportsService.list(user, parsed.data);
		return c.json(result, 200);
	},

	async getById(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const { id } = c.req.param();
		const report = await crashReportsService.getById(id);
		return c.json(report, 200);
	},

	async updateStatus(c: Context<AuthEnv>) {
		const user = c.get("user");
		const businessId = c.get("businessId");
		if (!user || !businessId) throw AppError.unauthorized();

		const { id } = c.req.param();
		const body = await c.req.json();
		const parsed = updateCrashReportStatusSchema.safeParse(body);
		if (!parsed.success) throw AppError.badRequest(parsed.error.errors[0].message);

		const report = await crashReportsService.updateStatus(id, parsed.data.status, businessId);
		return c.json(report, 200);
	},
};
