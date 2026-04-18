import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { askGrok, askGrokJSON } from "@/lib/grok";
import { sanitizeTextForAI } from "@/lib/utils/sanitize";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
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

    // Get user profile and resume text
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("raw_cv")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const resumeText = sanitizeTextForAI(profile.raw_cv || "");

    // Create a conversation session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tonality_conversations")
      .insert({
        user_id: userId,
        conversation_history: [],
        stage: 1,
        is_complete: false,
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500, headers: corsHeaders }
      );
    }

    interface FirstQuestion {
      question: string;
      question_theme: string;
      conversation_stage: number;
    }

    const systemPrompt = `You are a career intelligence agent. Your job is to understand a job seeker's
communication style, tone, personality, and work preferences through natural
conversation — so you can write job applications that sound exactly like them.

You have already read their resume. Now ask ONE open-ended question at a time.
Your questions must feel like a thoughtful human conversation, not a form.

Rules:
- Never ask yes/no questions
- Never ask more than one question at a time
- Each question should build on the previous answer
- After 5-6 exchanges, you will have enough to generate their profile
- Questions should uncover: communication style, work values, personality traits,
  career motivations, how they describe their own work, what excites them
- Vary question types: storytelling ("tell me about a time..."),
  values ("what matters most to you in..."), self-reflection ("how would your
  teammates describe..."), aspiration ("what kind of work energizes you...")

Resume context:
${resumeText}

Start with one warm, specific, opening question based on something interesting
in their resume. Make it personal, not generic.

Respond ONLY with valid JSON, no markdown fences:
{
  "question": "your question here",
  "question_theme": "communication_style | personality | values | work_style | aspirations",
  "conversation_stage": 1
}`;

    const firstQuestion = await askGrokJSON<FirstQuestion>(systemPrompt);
    console.log("✅ PARSED QUESTION:", firstQuestion);

    // Update session with first message
    const { error: updateError } = await supabaseAdmin
      .from("tonality_conversations")
      .update({
        conversation_history: [
          {
            role: "assistant",
            content: firstQuestion.question,
            theme: firstQuestion.question_theme,
          },
        ],
        stage: 1,
      })
      .eq("id", session.id);

    if (updateError) {
      console.error("Session update error:", updateError);
    }

    return NextResponse.json(
      {
        session_id: session.id,
        question: firstQuestion.question,
        question_theme: firstQuestion.question_theme,
        stage: 1,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Tonality start error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
