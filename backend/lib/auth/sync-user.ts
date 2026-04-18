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

  // Create/update user in users table
  const { error: userError } = await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
      created_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (userError) {
    console.error("Failed to sync user to Supabase:", userError);
    // Don't throw - allow upload to continue even if sync fails
  }

  // Ensure profile exists
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("Failed to create profile for user:", profileError);
  }

  return true;
}
