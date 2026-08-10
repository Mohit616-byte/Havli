import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://gclfissygfxfshsvrqnn.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/** Standard client for server-side queries respecting RLS */
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: false,
    },
  }
);

/** Privileged admin client for server operations requiring elevated access (e.g. host submissions) */
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    })
  : supabase;
