import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("code");

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

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Handled if called from context where setting cookies is restricted
        }
      },
    },
  });

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirectTo.pathname = "/login";
      redirectTo.searchParams.set(
        "message",
        "Email verified successfully! You can now log in."
      );
      return NextResponse.redirect(redirectTo);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirectTo.pathname = "/login";
      redirectTo.searchParams.set(
        "message",
        "Email verified successfully! You can now log in."
      );
      return NextResponse.redirect(redirectTo);
    }
  }

  // If token verification fails or params are missing, redirect to custom error page
  redirectTo.pathname = "/auth/confirm/error";
  return NextResponse.redirect(redirectTo);
}
