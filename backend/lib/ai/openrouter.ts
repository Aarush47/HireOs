const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not set in environment variables");
}

export async function askOpenRouter(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const payload = {
    model: "meta-llama/llama-2-70b-chat",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
    temperature: 0.5,
    max_tokens: 2048,
  };

  console.log("[OpenRouter] Sending request...");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "HireOS Resume Parser",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error("[OpenRouter] API Error:", {
      status: response.status,
      response: responseText.slice(0, 500),
    });
    throw new Error(`OpenRouter API error: ${response.status} - ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error("[OpenRouter] Invalid JSON response:", responseText.slice(0, 200));
    throw new Error("Invalid JSON response from OpenRouter API");
  }

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    console.error("[OpenRouter] No content in response:", JSON.stringify(data).slice(0, 300));
    throw new Error("No content in OpenRouter response");
  }

  console.log("[OpenRouter] Response received, length:", text.length);
  return text;
}

export async function askOpenRouterJSON<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  const text = await askOpenRouter(systemPrompt, userMessage);

  console.log("[OpenRouter] Parsing JSON response...");

  let jsonText = text;

  if (text.includes("```json")) {
    jsonText = text.split("```json")[1]?.split("```")[0] || text;
  } else if (text.includes("```")) {
    jsonText = text.split("```")[1]?.split("```")[0] || text;
  }

  jsonText = jsonText.trim();

  const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("[OpenRouter] No JSON found in response:", text.slice(0, 300));
    throw new Error("No valid JSON found in OpenRouter response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as T;
    console.log("[OpenRouter] JSON parsed successfully");
    return parsed;
  } catch (parseError) {
    console.error("[OpenRouter] JSON parse error:", parseError);
    console.error("[OpenRouter] Raw JSON string:", jsonMatch[0].slice(0, 300));
    throw new Error(`Failed to parse JSON: ${parseError}`);
  }
}
