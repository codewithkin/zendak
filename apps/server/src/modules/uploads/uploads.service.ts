import { randomUUID } from "node:crypto";

import { generatePresignedUploadUrl } from "../../lib/s3";

export const uploadsService = {
	async requestUpload(opts: {
		businessId: string;
		filename: string;
		contentType: string;
		sizeBytes: number;
	}) {
		const ext = opts.filename.split(".").pop() ?? "jpg";
		const key = `uploads/${opts.businessId}/${randomUUID()}.${ext}`;

		const result = await generatePresignedUploadUrl({
			key,
			contentType: opts.contentType,
			maxSizeBytes: opts.sizeBytes,
		});

		return result;
	},
};
