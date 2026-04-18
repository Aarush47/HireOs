const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";

if (!TOGETHER_API_KEY) {
  throw new Error("TOGETHER_API_KEY is not set in environment");
}

export async function askTogether(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await fetch(TOGETHER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOGETHER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3-70b-chat-hf",
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
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Together API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("No content in Together response");
  }

  return text;
}

export async function askTogetherJSON<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  const text = await askTogether(systemPrompt, userMessage);

  // Try to extract JSON from response
  let jsonText = text;

  if (text.includes("```json")) {
    jsonText = text.split("```json")[1].split("```")[0];
  } else if (text.includes("```")) {
    jsonText = text.split("```")[1].split("```")[0];
  }

  jsonText = jsonText.trim();

  const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Together response");
  }

  return JSON.parse(jsonMatch[0]) as T;
}
