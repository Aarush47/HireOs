import { supabaseAdmin } from "@/lib/supabase/admin";

export async function upsertClerkUser(clerkUser: {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}) {
  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
  const first_name = clerkUser.firstName ?? "";
  const last_name = clerkUser.lastName ?? "";
  const full_name = `${first_name} ${last_name}`.trim();

  const { error } = await supabaseAdmin.from("users").upsert({
    id: clerkUser.id,
    email,
    first_name,
    last_name,
    full_name,
    avatar_url: clerkUser.imageUrl ?? "",
  });

  if (error) throw new Error(`Failed to sync Clerk user: ${error.message}`);

  // Create empty profile if not exists
  await supabaseAdmin
    .from("profiles")
    .upsert({ id: clerkUser.id }, { onConflict: "id", ignoreDuplicates: true });
}