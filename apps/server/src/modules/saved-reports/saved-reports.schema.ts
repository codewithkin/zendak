import { z } from "zod";

export const createSavedReportSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	type: z.enum(["trips", "fleet", "operating-costs", "categorical-spending"]),
	config: z.record(z.unknown()),
	schedule: z.enum(["daily", "weekly", "monthly"]).optional(),
});

export const updateSavedReportSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	config: z.record(z.unknown()).optional(),
	schedule: z.enum(["daily", "weekly", "monthly"]).nullable().optional(),
});

export type CreateSavedReportInput = z.infer<typeof createSavedReportSchema>;
export type UpdateSavedReportInput = z.infer<typeof updateSavedReportSchema>;
