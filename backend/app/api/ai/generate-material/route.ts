import { auth } from "@clerk/nextjs/server";
import { askGrok } from "@/lib/grok";
import { NextResponse } from "next/server";

interface GenerateRequest {
  profile: {
    parsed_skills?: string[];
    career_story?: string;
    target_roles?: string[];
  };
  job: {
    title: string;
    company: string;
    description?: string;
  };
  type: "cover_letter" | "email" | "summary";
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { profile, job, type } = body;

    if (!profile || !job || !type) {
      return NextResponse.json(
        { error: "Profile, job, and type are required" },
        { status: 400 }
      );
    }

    console.log("[GENERATE]", type, "for:", job.title);

    let prompt = "";

    if (type === "cover_letter") {
      prompt = `Generate a professional cover letter:

CANDIDATE:
Skills: ${(profile.parsed_skills || []).join(", ")}
Background: ${profile.career_story || "Not provided"}

JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description || "Not provided"}

Write a compelling 3-paragraph cover letter. Start with "Dear Hiring Manager,". Make it specific and powerful.`;
    } else if (type === "email") {
      prompt = `Generate a professional email:

CANDIDATE:
Skills: ${(profile.parsed_skills || []).join(", ")}

JOB:
Title: ${job.title}
Company: ${job.company}

Write a 2-paragraph email with subject line. Professional and concise.`;
    } else if (type === "summary") {
      prompt = `Generate a professional summary:

CANDIDATE:
Skills: ${(profile.parsed_skills || []).join(", ")}
Background: ${profile.career_story || "Not provided"}

JOB:
Title: ${job.title}

Write a 2-3 sentence professional summary highlighting relevant experience.`;
    }

    const generated = await askGrok(prompt);

    console.log("[GENERATE] Content length:", generated.length);

    return NextResponse.json({ generated }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("[GENERATE] Error:", message);
    return NextResponse.json(
      { error: "Failed to generate material", details: message },
      { status: 500 }
    );
  }
}
