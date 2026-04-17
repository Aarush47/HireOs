import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateWithGemini(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}\n\nUser input:\n${userMessage}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  const text = result.response.text();
  return text;
}

export async function generateJsonWithGemini<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  const text = await generateWithGemini(systemPrompt, userMessage);

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Gemini response");
  }

  return JSON.parse(jsonMatch[0]) as T;
}
