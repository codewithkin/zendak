import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { requestUploadSchema } from "./uploads.schema";
import { uploadsService } from "./uploads.service";

export const uploadsController = {
	async requestUpload(c: Context<AuthEnv>) {
		const businessId = c.get("businessId");
		if (!businessId) throw AppError.forbidden("No active business");

		const body = await c.req.json();
		const parsed = requestUploadSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.errors[0].message);
		}

		const result = await uploadsService.requestUpload({
			businessId,
			filename: parsed.data.filename,
			contentType: parsed.data.contentType,
			sizeBytes: parsed.data.sizeBytes,
		});

		return c.json(result, 200);
	},
};
