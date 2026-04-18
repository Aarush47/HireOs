import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { askOpenRouter } from "@/lib/ai/openrouter";
import { sanitizeTextForAI, sanitizeAnswer } from "@/lib/utils/sanitize";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface ChatRequest {
  message: string;
  resume_text?: string;
}

export async function POST(request: Request) {
  try {
    let userId: string | null = null;

    try {
      const authResult = await auth();
      userId = authResult?.userId || null;
    } catch (e) {
      userId = "test-user-" + Date.now();
    }

    if (!userId) {
      userId = "test-user-" + Date.now();
    }

    const body: ChatRequest = await request.json();
    const { message, resume_text } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const sanitizedMessage = sanitizeAnswer(message);
    let resumeContext = "";

    // If resume_text not provided, try to fetch from database
    if (!resume_text) {
      try {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("raw_cv")
          .eq("id", userId)
          .single();

        if (profile?.raw_cv) {
          resumeContext = sanitizeTextForAI(profile.raw_cv);
        }
      } catch (e) {
        console.warn("Could not fetch resume from DB:", e);
      }
    } else {
      resumeContext = sanitizeTextForAI(resume_text);
    }

    const systemPrompt = `You are a helpful career advisor who knows the user's resume intimately.
You have read their resume and can discuss their experience, skills, and career path in detail.
Be conversational, encouraging, and provide specific advice based on their resume.
Keep responses concise (2-3 sentences) for a chat interface.

User's Resume:
${resumeContext}

Answer the user's question about their resume, experience, or career.`;

    const response = await askOpenRouter(systemPrompt, sanitizedMessage);

    console.log("✅ Chat response generated for userId:", userId);

    return NextResponse.json(
      {
        success: true,
        message: response,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Chat error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
