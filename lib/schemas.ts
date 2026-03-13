import { z } from "zod";

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const isoTimestampSchema = z.string().datetime({ offset: true });

export const extractionSchema = z
  .object({
    source: z
      .object({
        type: z.literal("image"),
        image_url: z.string().url(),
        uploaded_at: isoTimestampSchema,
        ocr_text: z.string()
      })
      .strict(),
    job: z
      .object({
        title: z.string().nullable(),
        organization: z.string().nullable(),
        location: z.string().nullable(),
        employment_type: z.string().nullable(),
        salary: z.string().nullable(),
        validity_date: isoDateSchema.nullable(),
        about: z.string().nullable(),
        description: z.string().nullable(),
        tags: z.array(z.string()),
        application_url: z.string().url().nullable(),
        website: z.string().url().nullable(),
        email: z.string().email().nullable(),
        phone: z.string().nullable()
      })
      .strict(),
    meta: z
      .object({
        is_relevant: z.boolean().default(true),
        confidence: z.number().min(0).max(1),
        ocr_hash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
        extracted_at: isoTimestampSchema,
        llm_raw: z.string()
      })
      .strict()
  })
  .strict();

export const stagingStatusSchema = z.enum([
  "pending_review",
  "approved",
  "rejected",
  "failed",
  "duplicate"
]);

export const extractJobStatusSchema = z.enum(["pending", "running", "done", "failed"]);

export type Extraction = z.infer<typeof extractionSchema>;
export type StagingStatus = z.infer<typeof stagingStatusSchema>;
export type ExtractJobStatus = z.infer<typeof extractJobStatusSchema>;

export const stagingDocumentSchema = extractionSchema.extend({
  _id: z.string().optional(),
  status: stagingStatusSchema,
  needs_manual_review: z.boolean().default(false),
  duplicate_of: z.string().nullable().default(null),
  error_reason: z.string().nullable().default(null),
  raw_llm_output: z.string().nullable().default(null),
  updated_at: isoTimestampSchema,
  verified_at: isoTimestampSchema.nullable().default(null)
});

export const userSchema = z.object({
  _id: z.string().optional(),
  username: z.string().min(3),
  roll_no: z.string().min(1),
  password_hash: z.string(),
  email: z.string().email(),
  role: z.enum(["user", "admin"]).default("user"),
  created_at: isoTimestampSchema,
  updated_at: isoTimestampSchema
});

export const userProfileSchema = z.object({
  userId: z.string(),
  personalized_filters: z.object({
    employment_types: z.array(z.string()).default([]),
    industries: z.array(z.string()).default([]),
    functional_roles: z.array(z.string()).default([]),
    seniority_levels: z.array(z.string()).default([]),
    locations: z.array(z.string()).default([]),
    min_salary: z.string().nullable().default(null)
  }),
  newsletter_subscription: z.boolean().default(false),
  saved_jobs: z.array(z.string()).default([]),
  updated_at: isoTimestampSchema
});

export type User = z.infer<typeof userSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
