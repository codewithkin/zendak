import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { onboardingSchema } from "./onboarding.schema";
import { onboardingService } from "./onboarding.service";

export const onboardingController = {
	async onboard(c: Context<AuthEnv>) {
		const user = c.get("user");
		const body = await c.req.json();
		const parsed = onboardingSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}

		const result = await onboardingService.onboard(user.id, parsed.data);
		return c.json(result, 201);
	},
};
