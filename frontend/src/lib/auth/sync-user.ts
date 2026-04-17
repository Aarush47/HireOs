/**
 * NOTE: User sync is handled on the backend in /api/auth/sync-clerk-user
 * This client-side function is deprecated and should not be used.
 * The backend handles Supabase operations with proper service role credentials.
 */

export async function upsertClerkUser(clerkUser: {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}) {
  // This is now handled by the backend after successful Clerk authentication
  // The backend endpoint /api/auth/sync-clerk-user creates the user record
  return;
}
