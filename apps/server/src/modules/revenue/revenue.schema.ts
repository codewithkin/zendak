import { z } from "zod";

export const createRevenueSchema = z.object({
	amount: z.number().positive("Amount must be positive"),
	tripId: z.string().min(1, "Trip ID is required"),
	notes: z.string().optional(),
});

export const updateRevenueSchema = z.object({
	amount: z.number().positive().optional(),
	notes: z.string().optional(),
});

export type CreateRevenueInput = z.infer<typeof createRevenueSchema>;
export type UpdateRevenueInput = z.infer<typeof updateRevenueSchema>;
