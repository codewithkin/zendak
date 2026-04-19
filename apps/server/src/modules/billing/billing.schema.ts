import { z } from "zod";

export const createCheckoutSchema = z.object({
	planName: z.enum(["FOUNDATION", "CONTROL", "COMMAND", "ENTERPRISE"]),
});

export const activatePlanSchema = z.object({
	intermediatePaymentId: z.string().min(1),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type ActivatePlanInput = z.infer<typeof activatePlanSchema>;
