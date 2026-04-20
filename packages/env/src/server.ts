import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.url(),
    JWT_SECRET: z.string().min(32),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    NOREPLY_SMTP_HOST: z.string().min(1),
    NOREPLY_SMTP_PORT: z.coerce.number().int().positive(),
    NOREPLY_SMTP_USER: z.string().min(1),
    NOREPLY_SMTP_PASS: z.string().min(1),
    NOREPLY_SMTP_FROM: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_PUBLIC_URL: z.string().url(),
    POLAR_ACCESS_TOKEN: z.string().min(1),
    POLAR_WEBHOOK_SECRET: z.string().min(1),
    POLAR_ORGANIZATION_ID: z.string().min(1),
    POLAR_SERVER: z.enum(["sandbox", "production"]).default("sandbox"),
    POLAR_PRODUCT_FOUNDATION: z.string().min(1),
    POLAR_PRODUCT_CONTROL: z.string().min(1),
    POLAR_PRODUCT_COMMAND: z.string().min(1),
    POLAR_PRODUCT_ENTERPRISE: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
