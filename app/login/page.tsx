"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { isProfileComplete } from "@/lib/utils/profile";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password.");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Check profile completion to route to /onboarding vs /explore
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.profile && isProfileComplete(json.data.profile)) {
          router.push("/explore");
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/onboarding");
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="text-center">
        <Link
          href="/"
          className="inline-block font-black text-2xl tracking-tight text-[var(--color-foreground)] mb-2"
        >
          <span className="text-[var(--color-primary)]">●</span> HAVLI
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Log in to manage your plans and profile
        </p>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <p className="text-sm text-emerald-400">{message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          id="login-email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          id="login-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" fullWidth disabled={loading} size="lg">
          {loading ? "Signing in..." : "Log in"}
        </Button>
      </form>

      <div className="text-center text-sm text-[var(--color-muted)] pt-2 border-t border-[var(--color-border)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[var(--color-primary)] hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
