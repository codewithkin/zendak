import { z } from "zod";

export const createDriverSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8, "Password must be at least 8 characters"),
	name: z.string().min(1, "Name is required"),
	licenseNo: z.string().min(1, "License number is required"),
	phone: z.string().optional(),
});

export const updateDriverSchema = z.object({
	licenseNo: z.string().min(1).optional(),
	phone: z.string().optional(),
	name: z.string().min(1).optional(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
