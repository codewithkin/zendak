import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import { createRevenueSchema, updateRevenueSchema } from "./revenue.schema";
import { revenueService } from "./revenue.service";

export const revenueController = {
	async create(c: Context) {
		const body = await c.req.json();
		const parsed = createRevenueSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const revenue = await revenueService.create(parsed.data);
		return c.json(revenue, 201);
	},

	async findAll(c: Context) {
		const revenues = await revenueService.findAll();
		return c.json(revenues);
	},

	async findById(c: Context) {
		const id = c.req.param("id");
		const revenue = await revenueService.findById(id);
		return c.json(revenue);
	},

	async update(c: Context) {
		const id = c.req.param("id");
		const body = await c.req.json();
		const parsed = updateRevenueSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const revenue = await revenueService.update(id, parsed.data);
		return c.json(revenue);
	},
};
