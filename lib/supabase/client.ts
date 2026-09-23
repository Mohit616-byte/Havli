import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseUrl =
  rawUrl?.trim().replace(/^["']|["']$/g, "") ||
  "https://gclfissygfxfshsvrqnn.supabase.co";

const rawAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;
const supabaseAnonKey =
  rawAnonKey?.trim().replace(/^["']|["']$/g, "") || "placeholder-anon-key";

let browserClient: SupabaseClient | null = null;

/** Singleton Supabase client for browser usage */
export const createBrowserClient = (): SupabaseClient => {
  if (browserClient) return browserClient;
  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
};

