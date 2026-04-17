import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileCreateInput = {
  id: string;
  full_name?: string;
};

export async function upsertProfileFromClerk(
  supabase: SupabaseClient,
  input: ProfileCreateInput,
): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: input.id,
      full_name: input.full_name ?? null,
    },
    { onConflict: "id", ignoreDuplicates: false },
  );

  if (error) {
    throw new Error(`Failed to upsert profile row: ${error.message}`);
  }
}
