import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { profile, jd } = await req.json();
  const result = await askGeminiJSON<{
    score: number;
    gaps: string[];
    strengths: string[];
    verdict: string;
  }>(`
    Profile: ${JSON.stringify(profile)}
    Job Description: ${jd}
    Score this match 0-100.
    Return JSON: { "score": number, "gaps": string[], "strengths": string[], "verdict": string }
  `);
  return NextResponse.json(result);
}
