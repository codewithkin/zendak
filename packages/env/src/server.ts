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
    R2_BUCKET: z.string().min(1),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
