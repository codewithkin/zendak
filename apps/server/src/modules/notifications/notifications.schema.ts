import { z } from "zod";

export const listNotificationsSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(50).default(20),
});

export const registerPushTokenSchema = z.object({
	token: z.string().min(1),
	platform: z.enum(["IOS", "ANDROID", "WEB"]),
});

export const removePushTokenSchema = z.object({
	token: z.string().min(1),
});
