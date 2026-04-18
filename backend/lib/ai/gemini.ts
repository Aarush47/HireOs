if (!process.env.GROK_API_KEY) {
  throw new Error("GROK_API_KEY is not set in environment");
}

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

export async function generateWithGemini(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-2",
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
    throw new Error(`Grok API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("No content in Grok response");
  }

  return text;
}

export async function generateJsonWithGemini<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  const text = await generateWithGemini(systemPrompt, userMessage);

  // Extract JSON from response - handle markdown code blocks
  let jsonText = text;
  
  // Remove markdown code blocks if present
  if (text.includes("```json")) {
    jsonText = text.split("```json")[1].split("```")[0];
  } else if (text.includes("```")) {
    jsonText = text.split("```")[1].split("```")[0];
  }

  // Clean up whitespace
  jsonText = jsonText.trim();

  // Extract JSON object/array if there's other text
  const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Grok response");
  }

  return JSON.parse(jsonMatch[0]) as T;
}
