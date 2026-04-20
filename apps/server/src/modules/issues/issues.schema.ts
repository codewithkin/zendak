import { z } from "zod";

export const createIssueSchema = z.object({
	title: z.string().min(1, "Title is required").max(200),
	description: z.string().min(1, "Description is required"),
	severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
	truckId: z.string().optional(),
	driverId: z.string().optional(),
});

export const updateIssueSchema = z.object({
	title: z.string().min(1).max(200).optional(),
	description: z.string().min(1).optional(),
	severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
	status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
	truckId: z.string().nullable().optional(),
	driverId: z.string().nullable().optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
