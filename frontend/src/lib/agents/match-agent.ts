import { z } from "zod";
import { generateJsonWithGemini, type GeminiClientOptions } from "@/lib/ai/gemini";
import { sanitizeJobDescription } from "@/lib/sanitize";
import type { MatchAgentResult, UserProfile } from "@/lib/agents/types";

const matchSchema = z.object({
  score: z.number().int().min(0).max(100),
  gaps: z.array(z.string()),
  strengths: z.array(z.string()),
  one_line_verdict: z.string(),
});

export async function runMatchAgent(params: {
  client: GeminiClientOptions;
  profile: UserProfile;
  jdRaw: string;
}): Promise<MatchAgentResult> {
  const prompt = [
    "Task: score candidate fit for the job in JSON only.",
    "Required fields: score, gaps[], strengths[], one_line_verdict.",
    "Scoring rubric: skills overlap 45, seniority 20, domain fit 15, location/work mode 10, trajectory 10.",
    "Keep gaps and strengths concise and actionable.",
    `Profile JSON: ${JSON.stringify(params.profile)}`,
    `JD RAW: ${sanitizeJobDescription(params.jdRaw)}`,
  ].join("\n");

  return generateJsonWithGemini({
    client: params.client,
    prompt,
    outputSchema: matchSchema,
    retries: 3,
  });
}
