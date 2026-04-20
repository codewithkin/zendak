import { z } from "zod";

export const createCrashReportSchema = z.object({
	truckId: z.string().min(1),
	tripId: z.string().optional(),
	description: z.string().min(10).max(2000),
	severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
	location: z.string().max(255).optional(),
	photos: z.array(
		z.object({
			key: z.string().min(1),
			url: z.string().url(),
			sizeBytes: z.number().int().positive(),
		}),
	).max(10).default([]),
});

export const updateCrashReportStatusSchema = z.object({
	status: z.enum(["UNDER_REVIEW", "RESOLVED", "DISMISSED"]),
});

export const listCrashReportsSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(50).default(20),
	status: z.enum(["SUBMITTED", "UNDER_REVIEW", "RESOLVED", "DISMISSED"]).optional(),
	severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});
