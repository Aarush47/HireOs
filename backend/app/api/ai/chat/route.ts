import { auth } from "@clerk/nextjs/server";
import { askGrok } from "@/lib/grok";
import { NextResponse } from "next/server";

interface ChatRequest {
  profile?: {
    parsed_skills?: string[];
    career_story?: string;
    target_roles?: string[];
  };
  message: string;
}

interface ChatResponse {
  reply: string;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ChatRequest = await request.json();
    const { profile, message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log("[CHAT] User:", userId, "Message length:", message.length);

    let prompt = `You are an AI job search copilot. Help the user with career guidance, resume advice, and job strategy. Be helpful, professional, and specific.`;

    if (profile) {
      prompt += `

CANDIDATE PROFILE:
Skills: ${(profile.parsed_skills || []).join(", ")}
Background: ${profile.career_story || "Not provided"}
Target Roles: ${(profile.target_roles || []).join(", ")}`;
    }

    prompt += `

User Message: ${message}`;

    const reply = await askGrok(prompt);

    console.log("[CHAT] Reply length:", reply.length);

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed";
    console.error("[CHAT] Error:", message);
    return NextResponse.json(
      { error: "Failed to process message", details: message },
      { status: 500 }
    );
  }
}
