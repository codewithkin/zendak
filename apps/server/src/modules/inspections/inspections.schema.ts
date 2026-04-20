import { z } from "zod";

export const createInspectionSchema = z.object({
	truckId: z.string().min(1, "Truck is required"),
	tires: z.enum(["PASS", "FAIL", "NEEDS_ATTENTION"]),
	brakes: z.enum(["PASS", "FAIL", "NEEDS_ATTENTION"]),
	lights: z.enum(["PASS", "FAIL", "NEEDS_ATTENTION"]),
	fluids: z.enum(["PASS", "FAIL", "NEEDS_ATTENTION"]),
	body: z.enum(["PASS", "FAIL", "NEEDS_ATTENTION"]),
	overall: z.enum(["PASS", "FAIL", "NEEDS_ATTENTION"]),
	notes: z.string().optional(),
	mileage: z.number().int().positive().optional(),
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
