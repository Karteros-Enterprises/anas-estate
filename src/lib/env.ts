import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { resolve } from 'node:path';
import { z } from 'zod';

const envSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  FREIGHTCOM_API_KEY: z.string().min(1),
  FREIGHTCOM_API_BASE: z.url(),
  SHIPPING_MARKUP_PERCENT: z.coerce.number().min(0).default(15),
  SHIP_FROM_NAME: z.string().min(1).default("Ana's Estate"),
  SHIP_FROM_CONTACT: z.string().min(1).default('Shipping Department'),
  SHIP_FROM_PHONE: z.string().min(10).default('9050000000'),
  SHIP_FROM_EMAIL: z.email().default('anas.oliveoil@gmail.com'),
  SHIP_FROM_ADDRESS_LINE_1: z.string().min(1),
  SHIP_FROM_ADDRESS_LINE_2: z.string().optional(),
  SHIP_FROM_CITY: z.string().min(1).default('Brampton'),
  SHIP_FROM_REGION: z.string().min(1).default('ON'),
  SHIP_FROM_POSTAL_CODE: z.string().min(1),
  SITE_URL: z.url().default('https://anasestate.com'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;
let envFileLoaded = false;

function ensureEnvFileLoaded(): void {
  if (envFileLoaded) return;
  envFileLoaded = true;

  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    loadEnvFile(envPath);
  }
}

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  ensureEnvFileLoaded();

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
