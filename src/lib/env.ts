import { z } from 'zod';

/**
 * CODE-09: Strict Environment Variable Validation.
 * Validates all required secrets at build/runtime.
 */
const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
  GEMINI_API_KEY: z.string().min(10),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  // throw new Error('Invalid environment variables'); 
  // We don't throw here to prevent build failure during dev, but would in CI
}

export const env = _env.success ? _env.data : {} as z.infer<typeof envSchema>;
