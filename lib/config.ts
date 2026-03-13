import { z } from "zod";

const envSchema = z.object({
  MONGO_URI: z.string().min(1),
  CLOUDINARY_URL: z.string().min(1),
  OCR_PROVIDER: z.enum(["ocrspace"]).default("ocrspace"),
  OCR_API_KEY: z.string().default("helloworld"),
  OCR_SPACE_BASE_URL: z.string().url().default("https://api.ocr.space/Parse/Image"),
  LLM_PROVIDER: z.enum(["openai", "anthropic", "claude"]).default("openai"),
  LLM_API_KEY: z.string().min(1),
  LLM_BASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().optional(),

  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  ADMIN_USERNAME: z.string().default("admin"),
  ADMIN_PASSWORD: z.string().default("changeme"),
  LOCK_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  CONFIDENCE_APPROVE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.85),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(3000),
  LLM_MODEL: z.string().default("gpt-4.1-mini"),
  ANTHROPIC_MODEL: z.string().default("claude-3-5-sonnet-latest"),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  TESSERACT_LANG: z.string().default("eng"),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  NODE_ENV: z.string().optional()
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(overrides?: Partial<Record<keyof AppEnv, string>>) {
  const parsed = envSchema.parse({
    ...process.env,
    ...overrides
  });

  return {
    ...parsed,
    NEXT_PUBLIC_API_BASE_URL: parsed.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
    JWT_SECRET: parsed.JWT_SECRET ?? `${parsed.ADMIN_USERNAME}:${parsed.ADMIN_PASSWORD}:dev-secret`
  } satisfies AppEnv & { JWT_SECRET: string; NEXT_PUBLIC_API_BASE_URL: string };
}
