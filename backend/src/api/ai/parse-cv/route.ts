import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { cvText } = await req.json();
  const result = await askGeminiJSON<{
    skills: string[];
    experience_years: number;
    career_story: string;
    target_roles: string[];
  }>(`
    Parse this CV text and extract:
    - skills (array of strings)
    - experience_years (number)
    - career_story (3 sentences about the person)
    - target_roles (array of 3 suitable job titles)
    CV Text: ${cvText.slice(0, 8000)}
    Return JSON only.
  `);
  return NextResponse.json(result);
}
