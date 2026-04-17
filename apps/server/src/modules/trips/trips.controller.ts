import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { createTripSchema, updateTripSchema } from "./trips.schema";
import { tripsService } from "./trips.service";

export const tripsController = {
	async create(c: Context<AuthEnv>) {
		const body = await c.req.json();
		const parsed = createTripSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const trip = await tripsService.create(parsed.data);
		return c.json(trip, 201);
	},

	async findAll(c: Context<AuthEnv>) {
		const user = c.get("user");
		const trips = await tripsService.findAll(user);
		return c.json(trips);
	},

	async findById(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		const user = c.get("user");
		const trip = await tripsService.findById(id, user);
		return c.json(trip);
	},

	async update(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		const body = await c.req.json();
		const parsed = updateTripSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const trip = await tripsService.update(id, parsed.data);
		return c.json(trip);
	},

	async start(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		const trip = await tripsService.start(id);
		return c.json(trip);
	},

	async complete(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		const trip = await tripsService.complete(id);
		return c.json(trip);
	},

	async settle(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		const trip = await tripsService.settle(id);
		return c.json(trip);
	},

	async search(c: Context) {
		const q = c.req.query("q") ?? "";
		const page = Math.max(1, Number(c.req.query("page") ?? 1));
		const limit = Math.min(50, Math.max(1, Number(c.req.query("limit") ?? 10)));
		const result = await tripsService.search(q, page, limit);
		return c.json(result);
	},
};
