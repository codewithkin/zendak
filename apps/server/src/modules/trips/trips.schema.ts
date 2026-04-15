import { z } from "zod";

export const createTripSchema = z.object({
	origin: z.string().min(1, "Origin is required"),
	destination: z.string().min(1, "Destination is required"),
	driverId: z.string().min(1, "Driver ID is required"),
	truckId: z.string().min(1, "Truck ID is required"),
	distance: z.number().positive().optional(),
	notes: z.string().optional(),
});

export const updateTripSchema = z.object({
	origin: z.string().min(1).optional(),
	destination: z.string().min(1).optional(),
	distance: z.number().positive().optional(),
	notes: z.string().optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
