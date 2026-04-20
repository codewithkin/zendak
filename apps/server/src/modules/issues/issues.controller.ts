import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { createIssueSchema, updateIssueSchema } from "./issues.schema";
import { issuesService } from "./issues.service";

export const issuesController = {
	async create(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const body = await c.req.json();
		const parsed = createIssueSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const issue = await issuesService.create(parsed.data, user.id);
		return c.json(issue, 201);
	},

	async findAll(c: Context<AuthEnv>) {
		const filters = {
			status: c.req.query("status"),
			severity: c.req.query("severity"),
			truckId: c.req.query("truckId"),
			driverId: c.req.query("driverId"),
		};
		const issues = await issuesService.findAll(filters);
		return c.json(issues);
	},

	async findById(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		const issue = await issuesService.findById(id);
		return c.json(issue);
	},

	async update(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		const body = await c.req.json();
		const parsed = updateIssueSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const issue = await issuesService.update(id, parsed.data);
		return c.json(issue);
	},

	async delete(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		await issuesService.delete(id);
		return c.json({ success: true });
	},

	async stats(c: Context<AuthEnv>) {
		const counts = await issuesService.countByStatus();
		return c.json(counts);
	},
};
