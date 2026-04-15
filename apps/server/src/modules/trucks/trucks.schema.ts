import { z } from "zod";

export const createTruckSchema = z.object({
	plateNumber: z.string().min(1, "Plate number is required"),
	model: z.string().min(1, "Model is required"),
	year: z.number().int().positive().optional(),
});

export const updateTruckSchema = z.object({
	plateNumber: z.string().min(1).optional(),
	model: z.string().min(1).optional(),
	year: z.number().int().positive().optional(),
	status: z.enum(["AVAILABLE", "IN_TRANSIT", "MAINTENANCE", "RETIRED"]).optional(),
});

export type CreateTruckInput = z.infer<typeof createTruckSchema>;
export type UpdateTruckInput = z.infer<typeof updateTruckSchema>;
