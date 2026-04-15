import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { createDriverSchema, updateDriverSchema } from "./drivers.schema";
import { driversService } from "./drivers.service";

export const driversController = {
	async create(c: Context) {
		const body = await c.req.json();
		const parsed = createDriverSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const driver = await driversService.create(parsed.data);
		return c.json(driver, 201);
	},

	async findAll(c: Context) {
		const drivers = await driversService.findAll();
		return c.json(drivers);
	},

	async findById(c: Context) {
		const id = c.req.param("id");
		const driver = await driversService.findById(id);
		return c.json(driver);
	},

	async me(c: Context<AuthEnv>) {
		const user = c.get("user");
		const driver = await driversService.findByUserId(user.id);
		return c.json(driver);
	},

	async update(c: Context) {
		const id = c.req.param("id");
		const body = await c.req.json();
		const parsed = updateDriverSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const driver = await driversService.update(id, parsed.data);
		return c.json(driver);
	},
};
