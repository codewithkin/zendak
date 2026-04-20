import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { createInspectionSchema } from "./inspections.schema";
import { inspectionsService } from "./inspections.service";

export const inspectionsController = {
	async create(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const body = await c.req.json();
		const parsed = createInspectionSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const inspection = await inspectionsService.create(parsed.data, user.id);
		return c.json(inspection, 201);
	},

	async findAll(c: Context<AuthEnv>) {
		const filters = {
			truckId: c.req.query("truckId"),
			driverId: c.req.query("driverId"),
		};
		const inspections = await inspectionsService.findAll(filters);
		return c.json(inspections);
	},

	async findById(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		const inspection = await inspectionsService.findById(id);
		return c.json(inspection);
	},
};
