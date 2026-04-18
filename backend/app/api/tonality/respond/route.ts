import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { askGrok, askGrokJSON } from "@/lib/grok";
import { sanitizeAnswer, sanitizeTextForAI } from "@/lib/utils/sanitize";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface RequestBody {
  session_id: string;
  user_answer: string;
}

interface ConversationMessage {
  role: "assistant" | "user";
  content: string;
  theme?: string;
}

interface NextQuestionResponse {
  type: "question" | "complete";
  question?: string;
  question_theme?: string;
  conversation_stage: number;
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
    const { session_id, user_answer } = body;

    if (!session_id || !user_answer) {
      return NextResponse.json(
        { error: "Missing session_id or user_answer" },
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

    // Rate limit check
    const conversationHistory: ConversationMessage[] =
      session.conversation_history || [];
    const userAnswers = conversationHistory.filter(
      (m) => m.role === "user"
    ).length;

    if (userAnswers >= 20) {
      return NextResponse.json(
        { error: "Session limit reached" },
        { status: 429, headers: corsHeaders }
      );
    }

    // Get user profile and resume text
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("raw_cv")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const sanitizedAnswer = sanitizeAnswer(user_answer);
    const resumeText = sanitizeTextForAI(profile.raw_cv || "");

    // Append user answer to conversation history
    const updatedHistory: ConversationMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: sanitizedAnswer,
      },
    ];

    const nextStage = Math.floor(updatedHistory.length / 2) + 1;

    // Build conversation history string
    const historyStr = updatedHistory
      .map((m) => `${m.role === "assistant" ? "AI" : "User"}: ${m.content}`)
      .join("\n\n");

    // Determine if we have enough responses for completion
    const shouldComplete = userAnswers >= 5;

    const systemPrompt = shouldComplete
      ? `You are completing a career personality interview.

Conversation so far:
${historyStr}

Resume:
${resumeText}

This conversation is complete. Respond ONLY in this JSON format:
{
  "type": "complete",
  "question": null,
  "question_theme": null,
  "conversation_stage": ${nextStage}
}`
      : `You are continuing a career personality interview.

Conversation so far:
${historyStr}

Resume:
${resumeText}

Rules:
- Ask the next most insightful question based on what they just said
- Never repeat themes already covered
- Build naturally on their answer
- Keep it conversational, not like a form
- Never ask yes/no questions

Respond ONLY in this JSON format:
{
  "type": "question",
  "question": "your question here",
  "question_theme": "communication_style | personality | values | work_style | aspirations",
  "conversation_stage": ${nextStage}
}`;

    const raw = await askGrok(systemPrompt);
    const nextResponse = parseGrokJSON<NextQuestionResponse>(raw);

    // Add AI response to history
    let finalHistory = updatedHistory;
    if (nextResponse.type === "question" && nextResponse.question) {
      finalHistory = [
        ...updatedHistory,
        {
          role: "assistant",
          content: nextResponse.question,
          theme: nextResponse.question_theme,
        },
      ];
    }

    // Update session
    const { error: updateError } = await supabaseAdmin
      .from("tonality_conversations")
      .update({
        conversation_history: finalHistory,
        stage: nextResponse.conversation_stage,
        is_complete: nextResponse.type === "complete",
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id);

    if (updateError) {
      console.error("Session update error:", updateError);
    }

    return NextResponse.json(
      {
        type: nextResponse.type,
        question: nextResponse.question || null,
        question_theme: nextResponse.question_theme || null,
        stage: nextResponse.conversation_stage,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Tonality respond error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
