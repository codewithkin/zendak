import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import { createTruckSchema, updateTruckSchema } from "./trucks.schema";
import { trucksService } from "./trucks.service";

export const trucksController = {
	async create(c: Context) {
		const body = await c.req.json();
		const parsed = createTruckSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const truck = await trucksService.create(parsed.data);
		return c.json(truck, 201);
	},

	async findAll(c: Context) {
		const trucks = await trucksService.findAll();
		return c.json(trucks);
	},

	async findById(c: Context) {
		const id = c.req.param("id");
		const truck = await trucksService.findById(id);
		return c.json(truck);
	},

	async update(c: Context) {
		const id = c.req.param("id");
		const body = await c.req.json();
		const parsed = updateTruckSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const truck = await trucksService.update(id, parsed.data);
		return c.json(truck);
	},

	async retire(c: Context) {
		const id = c.req.param("id");
		const truck = await trucksService.retire(id);
		return c.json(truck);
	},

	async search(c: Context) {
		const q = c.req.query("q") ?? "";
		const page = Math.max(1, Number(c.req.query("page") ?? 1));
		const limit = Math.min(50, Math.max(1, Number(c.req.query("limit") ?? 10)));
		const status = c.req.query("status");
		const result = await trucksService.search(q, page, limit, status);
		return c.json(result);
	},
};
