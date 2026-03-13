import { loadEnv } from "./config";

const env = loadEnv();

export interface OcrProvider {
  extractText(imageUrl: string): Promise<string>;
}

class OcrSpaceProvider implements OcrProvider {
  constructor() {}

  async extractText(imageUrl: string): Promise<string> {
    const body = new URLSearchParams({
      isOverlayRequired: "true",
      url: imageUrl,
      language: "eng"
    });

    const response = await fetch(env.OCR_SPACE_BASE_URL, {
      method: "POST",
      headers: {
        apikey: env.OCR_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    if (!response.ok) {
      throw new Error(`OCR.space request failed with ${response.status}`);
    }

    const payload = await response.json() as {
      IsErroredOnProcessing?: boolean;
      ErrorMessage?: string | string[];
      ParsedResults?: Array<{ ParsedText?: string }>;
    };

    if (payload.IsErroredOnProcessing) {
      const message = Array.isArray(payload.ErrorMessage)
        ? payload.ErrorMessage.join(", ")
        : payload.ErrorMessage ?? "Unknown OCR.space error";
      throw new Error(message);
    }

    return (payload.ParsedResults ?? []).map((entry) => entry.ParsedText ?? "").join("\n").trim();
  }
}

export function createOcrProvider(): OcrProvider {
  return new OcrSpaceProvider();
}