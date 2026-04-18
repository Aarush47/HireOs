export function sanitizeAnswer(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[<>{}]/g, "")
    .trim()
    .slice(0, 1000);
}

// Renamed: sanitizeForGemini → sanitizeTextForAI (AI-agnostic)
export function sanitizeTextForAI(text: string): string {
  return text.replace(/[<>{}]/g, "").slice(0, 3000);
}

// Backwards compatibility
export const sanitizeForGemini = sanitizeTextForAI;
