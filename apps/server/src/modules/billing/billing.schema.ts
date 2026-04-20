import { z } from "zod";

export const createCheckoutSchema = z.object({
	planName: z.enum(["FOUNDATION", "CONTROL", "COMMAND", "ENTERPRISE"]),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
