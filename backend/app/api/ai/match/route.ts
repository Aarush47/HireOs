import { auth } from "@clerk/nextjs/server";
import { askGrokJSON } from "@/lib/grok";
import { NextResponse } from "next/server";

interface MatchRequest {
  profile: {
    parsed_skills?: string[];
    career_story?: string;
    target_roles?: string[];
  };
  jd: string;
}

interface MatchResult {
  score: number;
  strengths: string[];
  gaps: string[];
  verdict: string;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: MatchRequest = await request.json();
    const { profile, jd } = body;

    if (!profile || !jd) {
      return NextResponse.json(
        { error: "Profile and JD are required" },
        { status: 400 }
      );
    }

    console.log("[MATCH] User:", userId);

    const prompt = `Analyze the match between this candidate and the job.

CANDIDATE PROFILE:
Skills: ${(profile.parsed_skills || []).join(", ")}
Background: ${profile.career_story || "Not provided"}

JOB DESCRIPTION:
${jd}

Return JSON:
{
  "score": <0-100>,
  "strengths": ["strength 1", "strength 2"],
  "gaps": ["gap 1", "gap 2"],
  "verdict": "brief recommendation"
}`;

    const result = await askGrokJSON<MatchResult>(prompt);

    console.log("[MATCH] Score:", result.score);

    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Match failed";
    console.error("[MATCH] Error:", message);
    return NextResponse.json(
      { error: "Failed to analyze match", details: message },
      { status: 500 }
    );
  }
}
