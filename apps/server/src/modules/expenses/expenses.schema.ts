import { z } from "zod";

export const createExpenseSchema = z.object({
	amount: z.number().positive("Amount must be positive"),
	type: z.enum(["FUEL", "MAINTENANCE", "DRIVER_COST", "TOLL", "MISC"]),
	description: z.string().optional(),
	tripId: z.string().optional(),
	truckId: z.string().optional(),
	driverId: z.string().optional(),
}).refine(
	(data) => data.tripId || data.truckId,
	{ message: "Expense must be linked to a trip or truck" },
);

export const updateExpenseSchema = z.object({
	amount: z.number().positive().optional(),
	type: z.enum(["FUEL", "MAINTENANCE", "DRIVER_COST", "TOLL", "MISC"]).optional(),
	description: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
