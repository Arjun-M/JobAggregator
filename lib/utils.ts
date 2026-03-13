import crypto from "node:crypto";
import { z } from "zod";
import { extractionSchema, type Extraction } from "./schemas";

export function generateImageHash(imageUrl: string): string {
  const digest = crypto.createHash("sha256").update(imageUrl, "utf8").digest("hex");
  return `sha256:${digest}`;
}

export function extractJsonFromResponse(input: string): any {
  // Simple parse or extraction from markdown block
  let cleaned = input.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1").trim();
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Last resort: extract everything between { and }
    const match = cleaned.match(/({[\s\S]*})/);
    if (match && match[1]) return JSON.parse(match[1]);
    throw new Error("Could not find valid JSON in LLM response");
  }
}

export function validateExtraction(flatData: any, imageUrl: string, uploadedAt: string): Extraction {
  const now = new Date().toISOString();
  
  const extraction: Extraction = {
    source: {
      type: "image",
      image_url: imageUrl,
      uploaded_at: uploadedAt,
      ocr_text: "[Visual Extraction]"
    },
    job: {
      title: flatData.title ?? null,
      organization: flatData.organization ?? null,
      location: flatData.location ?? null,
      employment_type: flatData.employment_type ?? null,
      salary: flatData.salary ?? null,
      validity_date: flatData.validity_date ?? null,
      about: flatData.about ?? null,
      description: flatData.description ?? null,
      tags: Array.isArray(flatData.tags) ? flatData.tags : [],
      application_url: flatData.application_url ?? null,
      website: flatData.website ?? null,
      email: flatData.email ?? null,
      phone: flatData.phone ?? null
    },
    meta: {
      is_relevant: flatData.is_relevant !== false, // Default to true if not present
      confidence: Number(flatData.confidence ?? 0.5),
      ocr_hash: generateImageHash(imageUrl),
      extracted_at: now,
      llm_raw: JSON.stringify(flatData).slice(0, 1500)
    }
  };

  // For irrelevant items, we don't need to validate the job details strictly.
  if (extraction.meta.is_relevant === false) {
    return extractionSchema.parse({
      ...extraction,
      job: {
        title: null, organization: null, location: null, employment_type: null,
        salary: null, validity_date: null, about: null, description: 'Irrelevant content',
        tags: [], application_url: null, website: null, email: null, phone: null,
      },
    });
  }
  
  try {
    return extractionSchema.parse(extraction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn("Validation failed for some fields. Nullifying them and retrying.", error.flatten().fieldErrors);
      const cleanedExtraction = JSON.parse(JSON.stringify(extraction)); // Deep copy to avoid mutation issues

      for (const issue of error.issues) {
        if (issue.path.length > 1 && issue.path[0] === 'job') {
          const field = issue.path[1] as keyof Extraction['job'];
          if (Object.prototype.hasOwnProperty.call(cleanedExtraction.job, field)) {
            (cleanedExtraction.job as any)[field] = null;
          }
        }
      }
      
      // Retry parsing with the nullified fields. This should now pass.
      return extractionSchema.parse(cleanedExtraction);
    }
    // For non-validation errors, we should still fail.
    throw error;
  }
}

export function redactLlmOutput(input: string, limit = 1500): string {
  return input.slice(0, limit);
}
