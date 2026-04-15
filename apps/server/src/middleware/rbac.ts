import type { Context, Next } from "hono";

import { AppError } from "../lib/errors";
import type { AuthEnv, Role } from "../types";

export function requireRole(...roles: Role[]) {
	return async (c: Context<AuthEnv>, next: Next) => {
		const user = c.get("user");
		if (!user) {
			throw AppError.unauthorized();
		}
		if (!roles.includes(user.role)) {
			throw AppError.forbidden(
				`Role '${user.role}' is not authorized for this action`,
			);
		}
		await next();
	};
}
