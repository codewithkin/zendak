import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { createSavedReportSchema, updateSavedReportSchema } from "./saved-reports.schema";
import { savedReportsService } from "./saved-reports.service";

export const savedReportsController = {
	async create(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const body = await c.req.json();
		const parsed = createSavedReportSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const report = await savedReportsService.create(parsed.data, user.id);
		return c.json(report, 201);
	},

	async findMine(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();
		const reports = await savedReportsService.findByUser(user.id);
		return c.json(reports);
	},

	async update(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const id = c.req.param("id");
		const body = await c.req.json();
		const parsed = updateSavedReportSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const report = await savedReportsService.update(id, parsed.data, user.id);
		return c.json(report);
	},

	async delete(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const id = c.req.param("id");
		await savedReportsService.delete(id, user.id);
		return c.json({ success: true });
	},
};
