import { auth } from "@clerk/nextjs/server";
import { askGrokJSON } from "@/lib/grok";
import { NextResponse } from "next/server";

interface ParsedCV {
  skills: string[];
  experience_years: number;
  career_story: string;
  target_roles: string[];
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cvText } = await request.json();

    if (!cvText || typeof cvText !== "string") {
      return NextResponse.json({ error: "CV text is required" }, { status: 400 });
    }

    console.log("[PARSE-CV] User:", userId, "CV length:", cvText.length);

    const prompt = `Parse this resume/CV and extract structured information:

${cvText}

Return JSON with:
- skills: array of key technical and soft skills
- experience_years: estimated years of experience (number)
- career_story: 1-2 sentence summary of career trajectory
- target_roles: array of 2-3 target job positions`;

    const parsed = await askGrokJSON<ParsedCV>(prompt);

    // Validate structure
    if (!Array.isArray(parsed.skills) || !Array.isArray(parsed.target_roles)) {
      throw new Error("Invalid parsed structure");
    }

    console.log("[PARSE-CV] Success - skills:", parsed.skills.length, "roles:", parsed.target_roles);

    return NextResponse.json({ parsed }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Parse failed";
    console.error("[PARSE-CV] Error:", message);
    return NextResponse.json(
      { error: "Failed to parse CV", details: message },
      { status: 500 }
    );
  }
}
