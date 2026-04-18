import { NextResponse } from "next/server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

export async function GET() {
  console.log("[TEST] Starting Anthropic API test...");
  console.log("[TEST] API Key configured:", !!ANTHROPIC_KEY);
  console.log("[TEST] API Key first 30 chars:", ANTHROPIC_KEY?.substring(0, 30));

  if (!ANTHROPIC_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const testPrompt = "Say hello briefly.";

    console.log("[TEST] Sending request to:", ANTHROPIC_API_URL);
    console.log("[TEST] Headers being sent:");
    console.log("  - Content-Type: application/json");
    console.log("  - x-api-key: [REDACTED]");
    console.log("  - anthropic-version: 2023-06-01");

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: testPrompt,
          },
        ],
      }),
    });

    const responseText = await response.text();
    console.log("[TEST] Response status:", response.status);
    console.log("[TEST] Response body:", responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Anthropic API error",
          status: response.status,
          message: responseText,
        },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);
    const responseContent = data.content?.[0]?.text;

    return NextResponse.json({
      success: true,
      status: response.status,
      response: responseContent,
      fullData: data,
    });
  } catch (error) {
    console.error("[TEST] Error:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
