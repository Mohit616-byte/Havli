import { createClient } from "@supabase/supabase-js";

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseUrl =
  rawUrl?.trim().replace(/^["']|["']$/g, "") ||
  "https://gclfissygfxfshsvrqnn.supabase.co";

const rawAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;
const supabaseAnonKey = rawAnonKey?.trim().replace(/^["']|["']$/g, "") || "";

const rawServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseServiceRoleKey =
  rawServiceRoleKey?.trim().replace(/^["']|["']$/g, "") || "";

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
