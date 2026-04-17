import { createHmac } from "node:crypto";

type ClerkWebhookVerifyInput = {
  payload: string;
  clerkWebhookSecret: string;
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
};

// Minimal verification helper for environments where @clerk backend SDK is not yet wired.
// Replace with Clerk SDK verification in production route handlers.
export function verifyClerkWebhookSignature(input: ClerkWebhookVerifyInput): boolean {
  const signedPayload = `${input.svixId}.${input.svixTimestamp}.${input.payload}`;
  const expected = createHmac("sha256", input.clerkWebhookSecret)
    .update(signedPayload)
    .digest("base64");

  return input.svixSignature.includes(expected);
}
