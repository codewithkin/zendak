import { z } from "zod";

export const inviteUserSchema = z.object({
	email: z.string().email("Valid email is required"),
	name: z.string().min(1, "Name is required"),
	role: z.enum(["ADMIN", "ACCOUNTANT", "OPERATIONS", "DRIVER"], {
		required_error: "Role is required",
	}),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
