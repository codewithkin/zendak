import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@zendak/env/server";

const s3 = new S3Client({
	region: env.AWS_S3_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
});

export async function generatePresignedUploadUrl(opts: {
	key: string;
	contentType: string;
	maxSizeBytes: number;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
	const command = new PutObjectCommand({
		Bucket: env.AWS_S3_BUCKET,
		Key: opts.key,
		ContentType: opts.contentType,
		ContentLength: opts.maxSizeBytes,
	});

	const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
	const publicUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_S3_REGION}.amazonaws.com/${opts.key}`;

	return { uploadUrl, publicUrl, key: opts.key };
}

export async function deleteS3Object(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: env.AWS_S3_BUCKET,
		Key: key,
	});
	await s3.send(command);
}
