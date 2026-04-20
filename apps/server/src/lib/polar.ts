import { Polar } from "@polar-sh/sdk";
import { env } from "@zendak/env/server";
import type { PlanName } from "@zendak/plans";

export const polar = new Polar({
	accessToken: env.POLAR_ACCESS_TOKEN,
	server: env.POLAR_SERVER as "sandbox" | "production",
});

/** Map plan names to Polar product IDs from env */
export const POLAR_PRODUCT_IDS: Record<PlanName, string> = {
	FOUNDATION: env.POLAR_PRODUCT_FOUNDATION,
	CONTROL: env.POLAR_PRODUCT_CONTROL,
	COMMAND: env.POLAR_PRODUCT_COMMAND,
	ENTERPRISE: env.POLAR_PRODUCT_ENTERPRISE,
};
