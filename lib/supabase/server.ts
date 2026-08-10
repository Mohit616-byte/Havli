import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://gclfissygfxfshsvrqnn.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Gets the authenticated user from the request's Authorization header or cookie.
 * NEVER trusts client-provided user IDs. Returns null if unauthenticated.
 */
export async function getAuthUser(request: NextRequest) {
  let token = "";

  const authHeader = request.headers.get("Authorization");
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    token = authHeader.replace(/^Bearer\s+/i, "").trim();
  } else {
    // Check cookies for sb-access-token if present
    const authCookie = request.cookies.get("sb-access-token")?.value;
    if (authCookie) token = authCookie;
  }

  if (!token) return null;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);

  if (error || !user) return null;
  return user;
}
