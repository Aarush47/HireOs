import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function askGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function askGeminiJSON<T>(prompt: string): Promise<T> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const fullPrompt = `You are a JSON API. Return ONLY valid JSON. No markdown. No explanation.\n\n${prompt}`;
  const result = await model.generateContent(fullPrompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text) as T;
}
