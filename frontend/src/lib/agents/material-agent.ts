import { z } from "zod";
import { generateJsonWithGemini, type GeminiClientOptions } from "@/lib/ai/gemini";
import { sanitizeJobDescription } from "@/lib/sanitize";
import type {
  JobSnapshot,
  MaterialAgentResult,
  MaterialType,
  UserProfile,
} from "@/lib/agents/types";

const materialSchema = z.object({
  content: z.string().min(1),
});

export async function runMaterialAgent(params: {
  client: GeminiClientOptions;
  profile: UserProfile;
  job: JobSnapshot;
  type: MaterialType;
}): Promise<MaterialAgentResult> {
  const typeInstruction =
    params.type === "cover_letter"
      ? "Generate a cover letter under 400 words."
      : "Generate tailored resume bullets and summary sections aligned to the role.";

  const prompt = [
    "Task: create job-specific material. Never be generic.",
    typeInstruction,
    "Must use user's tone_profile and career_story.",
    "Reference concrete JD keywords where relevant.",
    "Do not invent employers, tools, or achievements.",
    `Profile JSON: ${JSON.stringify(params.profile)}`,
    `Job JSON: ${JSON.stringify({ ...params.job, jd_raw: sanitizeJobDescription(params.job.jd_raw) })}`,
  ].join("\n");

  return generateJsonWithGemini({
    client: params.client,
    prompt,
    outputSchema: materialSchema,
    retries: 3,
  });
}
