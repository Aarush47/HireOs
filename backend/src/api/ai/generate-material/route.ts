import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { profile, job, type } = await req.json();
  const prompts: Record<string, string> = {
    cover_letter: `Write a 300-word cover letter for ${profile.full_name} applying to ${job.title} at ${job.company}. Use this profile: ${JSON.stringify(profile)}. Reference this JD: ${job.description}. Professional tone.`,
    resume_summary: `Write a 3-sentence resume summary for ${profile.full_name} tailored to ${job.title} at ${job.company}. Profile: ${JSON.stringify(profile)}`,
    follow_up: `Write a professional follow-up email for ${profile.full_name} who applied to ${job.title} at ${job.company} 10 days ago. Keep it under 100 words.`,
  };
  const content = await askGemini(prompts[type] || prompts.cover_letter);
  return NextResponse.json({ content });
}
