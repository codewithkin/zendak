import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { inviteUserSchema } from "./users.schema";
import { usersService } from "./users.service";

export const usersController = {
	async findAll(c: Context<AuthEnv>) {
		const user = c.get("user");
		const users = await usersService.findAll(user.id);
		return c.json(users);
	},

	async invite(c: Context<AuthEnv>) {
		const user = c.get("user");
		const body = await c.req.json();
		const parsed = inviteUserSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const newUser = await usersService.invite(user.id, parsed.data);
		return c.json(newUser, 201);
	},
};
