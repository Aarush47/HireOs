// @ts-ignore - pdf-parse doesn't have proper ESM exports
const pdf = require("pdf-parse");

export async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    console.log("[PDF] Parsing PDF, size:", buffer.length);
    const data = await pdf(buffer);
    const text = data.text
      .replace(/\s+/g, " ")
      .trim();
    console.log("[PDF] Extracted text length:", text.length);
    return text;
  } catch (error) {
    console.error("[PDF] Parse error:", error);
    throw new Error(`Failed to parse PDF: ${error}`);
  }
}
