"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name, // Pass name in metadata for handle_new_user DB trigger
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("This email is already registered.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.session) {
        // Direct to profile onboarding
        router.push("/onboarding");
        router.refresh();
      } else {
        router.push("/login?message=Account created successfully. Please log in.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="inline-block font-black text-2xl tracking-tight text-[var(--color-foreground)] mb-2"
          >
            <span className="text-[var(--color-primary)]">●</span> HAVLI
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
            Create your account
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Find your people. Find your plans.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            id="signup-name"
            label="Full name"
            placeholder="Riya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            id="signup-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="signup-password"
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            id="signup-confirm-password"
            label="Confirm password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth disabled={loading} size="lg">
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <div className="text-center text-sm text-[var(--color-muted)] pt-2 border-t border-[var(--color-border)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-primary)] hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
