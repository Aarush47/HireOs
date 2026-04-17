import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateJsonWithGemini } from "@/lib/ai/gemini";
import { sanitizeForGemini } from "@/lib/utils/sanitize";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface AnalysisResult {
  tone_style: string;
  communication_style: string;
  personality_traits: string[];
  career_preferences: {
    work_environment: string;
    motivation_drivers: string[];
    values: string[];
    communication_preference: string;
    career_aspiration: string;
    strengths_they_own: string[];
  };
}

interface RequestBody {
  session_id: string;
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

    const body: RequestBody = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch conversation session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tonality_conversations")
      .select("*")
      .eq("id", session_id)
      .eq("user_id", userId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Get user profile and resume text
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("resume_text")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const resumeText = sanitizeForGemini(profile.resume_text || "");
    const conversationHistory = session.conversation_history || [];

    // Build conversation history string
    const historyStr = conversationHistory
      .map(
        (m: any) =>
          `${m.role === "assistant" ? "AI" : "User"}: ${m.content}`
      )
      .join("\n\n");

    const systemPrompt = `Based on this complete career interview conversation, extract a precise
personality and communication profile for this job seeker.

Full conversation:
${historyStr}

Resume:
${resumeText}

Analyze and respond ONLY in this JSON format:
{
  "tone_style": "single string describing their overall tone",
  "communication_style": "single string describing how they communicate",
  "personality_traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "career_preferences": {
    "work_environment": "what kind of environment they thrive in",
    "motivation_drivers": ["driver1", "driver2", "driver3"],
    "values": ["value1", "value2", "value3"],
    "communication_preference": "how they prefer to work with others",
    "career_aspiration": "where they want to go",
    "strengths_they_own": ["strength1", "strength2", "strength3"]
  }
}

Be specific and personal — generic traits are useless. Extract what makes THIS person distinct.`;

    const analysis = await generateJsonWithGemini<AnalysisResult>(
      systemPrompt,
      "Generate the personality profile."
    );

    // Update profiles table with analysis results
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        tone_style: analysis.tone_style,
        communication_style: analysis.communication_style,
        personality_traits: analysis.personality_traits,
        career_preferences: analysis.career_preferences,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save profile" },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        analysis,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Tonality analyze error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
