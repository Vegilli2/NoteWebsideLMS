import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/notewebside_lms?schema=public"),
  NEXT_PUBLIC_API_BASE_URL: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().default("notev2-ba7a2"),
  FIREBASE_ADMIN_CREDENTIALS_JSON: z.string().optional(),
  FIREBASE_ADMIN_CREDENTIALS_PATH: z
    .string()
    .default("/Users/vegillito/Documents/NoteWebsideLMS/FirebaseAdminSDKKey/notev2-ba7a2-firebase-adminsdk-fbsvc-3821f45ab1.json"),
  FIREBASE_SESSION_COOKIE_NAME: z.string().default("notewebside_session"),
  FIREBASE_SESSION_MAX_AGE_MS: z.coerce.number().int().positive().default(1000 * 60 * 60 * 24 * 5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment: ${parsed.error.message}`);
}

export const appConfig = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  publicApiBaseUrl: parsed.data.NEXT_PUBLIC_API_BASE_URL,
  firebaseProjectId: parsed.data.FIREBASE_PROJECT_ID,
  firebaseAdminCredentialsJson: parsed.data.FIREBASE_ADMIN_CREDENTIALS_JSON,
  firebaseAdminCredentialsPath: parsed.data.FIREBASE_ADMIN_CREDENTIALS_PATH,
  firebaseSessionCookieName: parsed.data.FIREBASE_SESSION_COOKIE_NAME,
  firebaseSessionMaxAgeMs: parsed.data.FIREBASE_SESSION_MAX_AGE_MS,
} as const;
