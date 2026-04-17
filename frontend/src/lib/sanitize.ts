const MAX_JOB_DESCRIPTION_CHARS = 10000;

const TAG_REGEX = /<[^>]*>/g;
const WS_REGEX = /\s+/g;

export function sanitizeForAi(input: string): string {
  return input.replace(TAG_REGEX, " ").replace(WS_REGEX, " ").trim();
}

export function sanitizeJobDescription(input: string): string {
  const sanitized = sanitizeForAi(input);

  if (sanitized.length <= MAX_JOB_DESCRIPTION_CHARS) {
    return sanitized;
  }

  return sanitized.slice(0, MAX_JOB_DESCRIPTION_CHARS);
}

export function assertNonEmpty(value: string, fieldName: string): void {
  if (!value.trim()) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}
