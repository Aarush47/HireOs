import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type DbClientConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type AdminClientConfig = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
};

export function createSupabaseBrowserClient(config: DbClientConfig): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

export function createSupabaseAdminClient(config: AdminClientConfig): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
