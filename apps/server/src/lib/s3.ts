import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@zendak/env/server";

const r2 = new S3Client({
	region: "auto",
	endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
	},
});

export async function generatePresignedUploadUrl(opts: {
	key: string;
	contentType: string;
	maxSizeBytes: number;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
	const command = new PutObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: opts.key,
		ContentType: opts.contentType,
		ContentLength: opts.maxSizeBytes,
	});

	const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 600 });
	const publicUrl = `${env.R2_PUBLIC_URL}/${opts.key}`;

	return { uploadUrl, publicUrl, key: opts.key };
}

export async function deleteR2Object(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: key,
	});
	await r2.send(command);
}
