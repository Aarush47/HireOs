export function sanitizeAnswer(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[<>{}]/g, "")
    .trim()
    .slice(0, 1000);
}

export function sanitizeForGemini(text: string): string {
  return text.replace(/[<>{}]/g, "").slice(0, 2000);
}
