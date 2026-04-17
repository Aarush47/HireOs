import { z } from "zod";
import { sanitizeForAi } from "@/lib/sanitize";

const GEMINI_MODEL = "gemini-1.5-flash";
const BASE_SYSTEM_PROMPT =
  "You are a job search expert assistant. Respond only in valid JSON. No markdown, no preamble.";

export type GeminiClientOptions = {
  apiKey: string;
  model?: string;
};

type GeminiPart = {
  text: string;
};

type GeminiPayload = {
  contents: Array<{
    role: "user";
    parts: GeminiPart[];
  }>;
  generationConfig: {
    temperature: number;
    responseMimeType: "application/json";
  };
  systemInstruction: {
    parts: GeminiPart[];
  };
};

const candidateSchema = z.object({
  content: z.object({
    parts: z.array(z.object({ text: z.string() })),
  }),
});

const geminiResponseSchema = z.object({
  candidates: z.array(candidateSchema).min(1),
});

export async function generateJsonWithGemini<T>(params: {
  client: GeminiClientOptions;
  prompt: string;
  outputSchema: z.ZodType<T>;
  retries?: number;
}): Promise<T> {
  const retries = params.retries ?? 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await callGeminiApi(params.client, params.prompt);
      const parsedResponse = geminiResponseSchema.parse(response);
      const rawText = parsedResponse.candidates[0]?.content.parts[0]?.text ?? "{}";
      const rawJson = JSON.parse(rawText) as unknown;

      return params.outputSchema.parse(rawJson);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Gemini JSON parse failed after ${retries} retries: ${String(lastError)}`);
}

async function callGeminiApi(client: GeminiClientOptions, prompt: string): Promise<unknown> {
  const safePrompt = sanitizeForAi(prompt);
  const model = client.model ?? GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${client.apiKey}`;

  const payload: GeminiPayload = {
    contents: [{ role: "user", parts: [{ text: safePrompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
    systemInstruction: {
      parts: [{ text: BASE_SYSTEM_PROMPT }],
    },
  };

  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!result.ok) {
    const body = await result.text();
    throw new Error(`Gemini API error (${result.status}): ${body}`);
  }

  return result.json();
}
