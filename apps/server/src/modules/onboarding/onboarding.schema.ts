import { z } from "zod";

export const onboardingSchema = z.object({
	businessName: z.string().min(1, "Business name is required"),
	location: z.string().min(1, "Location is required"),
	truckCount: z.number().int().min(0, "Truck count must be 0 or more"),
	employeeCount: z.number().int().min(0, "Employee count must be 0 or more"),
	phone: z.string().optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
