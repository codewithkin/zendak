import { z } from "zod";

export const requestUploadSchema = z.object({
	filename: z.string().min(1).max(255),
	contentType: z.string().regex(/^image\/(jpeg|png|webp|heic|heif)$/, {
		message: "Only image files (jpeg, png, webp, heic) are allowed",
	}),
	sizeBytes: z.number().int().positive().max(20 * 1024 * 1024, {
		message: "File size must not exceed 20MB",
	}),
});

export const confirmUploadSchema = z.object({
	key: z.string().min(1),
	sizeBytes: z.number().int().positive(),
});
