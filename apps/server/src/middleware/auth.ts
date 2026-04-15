import type { Context, Next } from "hono";

import { AppError } from "../lib/errors";
import { verifyToken } from "../lib/jwt";
import type { AuthEnv } from "../types";

export async function authMiddleware(
	c: Context<AuthEnv>,
	next: Next,
) {
	const header = c.req.header("Authorization");
	if (!header?.startsWith("Bearer ")) {
		throw AppError.unauthorized("Missing or invalid authorization header");
	}

	const token = header.slice(7);
	try {
		const payload = await verifyToken(token);
		c.set("user", {
			id: payload.sub,
			email: payload.email,
			role: payload.role,
		});
	} catch {
		throw AppError.unauthorized("Invalid or expired token");
	}

	await next();
}
