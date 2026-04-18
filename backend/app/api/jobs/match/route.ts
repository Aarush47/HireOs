import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { askGrok, parseGrokJSON } from "@/lib/ai/grok";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
}

interface UserProfile {
  tone_style: string;
  communication_style: string;
  personality_traits: string[];
  career_preferences: {
    work_environment: string;
    motivation_drivers: string[];
    values: string[];
    career_aspiration: string;
    strengths_they_own: string[];
  };
}

interface JobMatch {
  job_id: string;
  title: string;
  company: string;
  location: string;
  match_score: number; // 0-100
  match_reasons: string[];
  alignment_with_values: string;
  growth_potential: string;
  communication_fit: string;
}

interface MatchRequest {
  jobs: Job[];
  tonality_session_id?: string;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body: MatchRequest = await request.json();
    const { jobs, tonality_session_id } = body;

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { error: "Jobs required" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("🎯 JOB MATCHING — jobs:", jobs.length, "user:", userId);

    // Get user's tonality profile (completed chat results)
    let userProfile: UserProfile | null = null;

    if (tonality_session_id) {
      const { data: session } = await supabaseAdmin
        .from("tonality_conversations")
        .select("analysis_result")
        .eq("id", tonality_session_id)
        .eq("user_id", userId)
        .single();

      if (session?.analysis_result) {
        userProfile = session.analysis_result as UserProfile;
      }
    }

    // If no session or profile, try to get latest from user_profiles
    if (!userProfile) {
      const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("tonality_analysis")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (profile?.tonality_analysis) {
        userProfile = profile.tonality_analysis as UserProfile;
      }
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found. Complete the profile chat first." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Match each job using Gemini
    const matchedJobs: JobMatch[] = [];

    for (const job of jobs) {
      const systemPrompt = `You are a career matching AI. You have a job seeker's profile and a job description.
Your job is to score how well they match (0-100) and explain why.

USER PROFILE:
- Tone: ${userProfile.tone_style}
- Communication: ${userProfile.communication_style}
- Personality: ${userProfile.personality_traits.join(", ")}
- Values: ${userProfile.career_preferences.values.join(", ")}
- Work Environment: ${userProfile.career_preferences.work_environment}
- Motivation: ${userProfile.career_preferences.motivation_drivers.join(", ")}
- Career Aspiration: ${userProfile.career_preferences.career_aspiration}
- Strengths: ${userProfile.career_preferences.strengths_they_own.join(", ")}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description}
${job.salary_min ? `Salary: ${job.salary_currency} ${job.salary_min} - ${job.salary_max}` : ""}

Analyze the match. Consider:
1. Does the work environment align with their preferences?
2. Do their values match the company culture hints?
3. Will their strengths be utilized?
4. Does this align with their career aspiration?
5. Will their communication style work in this role?

Respond ONLY in this JSON format:
{
  "match_score": <number 0-100>,
  "match_reasons": [<reason 1>, <reason 2>, <reason 3>],
  "alignment_with_values": "<1-2 sentences>",
  "growth_potential": "<1-2 sentences>",
  "communication_fit": "<1-2 sentences>"
}`;

      interface MatchResult {
        match_score: number;
        match_reasons: string[];
        alignment_with_values: string;
        growth_potential: string;
        communication_fit: string;
      }

      const raw = await askGrok(systemPrompt);
      const matchResult = parseGrokJSON<MatchResult>(raw);

      matchedJobs.push({
        job_id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        match_score: matchResult.match_score,
        match_reasons: matchResult.match_reasons,
        alignment_with_values: matchResult.alignment_with_values,
        growth_potential: matchResult.growth_potential,
        communication_fit: matchResult.communication_fit,
      });
    }

    // Sort by match score (highest first)
    matchedJobs.sort((a, b) => b.match_score - a.match_score);

    console.log("✅ MATCHING COMPLETE — top score:", matchedJobs[0]?.match_score);

    return NextResponse.json(
      {
        success: true,
        matched_jobs: matchedJobs,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Job matching error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
