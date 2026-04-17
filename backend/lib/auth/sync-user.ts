import { createSupabaseAdminClient } from "@/lib/supabase/server";

interface ClerkUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

export async function ensureClerkUserInSupabase(user: ClerkUser) {
  const supabase = createSupabaseAdminClient();

  // Try to upsert user into profiles table
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      email: user.email,
      full_name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Failed to sync user to Supabase:", error);
    // Don't throw - allow upload to continue even if sync fails
  }

  return true;
}
