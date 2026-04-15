import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { loginSchema, signupSchema } from "./auth.schema";
import { authService } from "./auth.service";

export const authController = {
	async signup(c: Context) {
		const body = await c.req.json();
		const parsed = signupSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}

		const result = await authService.signup(parsed.data);
		return c.json(result, 201);
	},

	async login(c: Context) {
		const body = await c.req.json();
		const parsed = loginSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}

		const result = await authService.login(parsed.data);
		return c.json(result);
	},

	async me(c: Context<AuthEnv>) {
		const user = c.get("user");
		const result = await authService.me(user.id);
		return c.json(result);
	},
};
