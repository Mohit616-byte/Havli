"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Mail } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_BASE_URL || "https://havli.vercel.app";

      const supabase = createBrowserClient();
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/confirm`,
          data: {
            name: name.trim(), // Pass name in metadata for handle_new_user DB trigger
          },
        },
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("already registered") ||
          authError.message.toLowerCase().includes("user already exists")
        ) {
          setError("An account with this email already exists. Please log in instead.");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Check if user already exists (Supabase returns empty identities array when user enumeration protection is enabled)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setError("An account with this email already exists. Please log in instead.");
        return;
      }

      if (data.session) {
        // Direct to profile onboarding if session is already active (e.g. email confirmation turned off)
        router.push("/onboarding");
        router.refresh();
      } else {
        // Email confirmation is required — show "Check your email" screen
        // Do NOT attempt automatic login
        setIsSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 text-center">
          <Link
            href="/"
            className="inline-block font-black text-2xl tracking-tight text-[var(--color-foreground)] mb-1"
          >
            <span className="text-[var(--color-primary)]">●</span> HAVLI
          </Link>

          <div className="w-16 h-16 rounded-full bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 text-[var(--color-primary)] mx-auto flex items-center justify-center">
            <Mail size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
              Check your email
            </h1>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              We&apos;ve sent a verification link to{" "}
              <strong className="text-[var(--color-foreground)] font-semibold">{email}</strong>.
            </p>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed pt-1">
              Please click the link in your email to confirm your account and get started on Havli.
            </p>
          </div>

          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-3.5 text-xs text-[var(--color-muted)] text-left space-y-1">
            <p className="font-semibold text-[var(--color-foreground)]">Didn&apos;t receive it?</p>
            <p>Check your spam or junk folder. Verification links remain valid for 24 hours.</p>
          </div>

          <div className="space-y-3 pt-2">
            <Link href="/login" className="block w-full">
              <Button fullWidth size="lg">
                Go to Login
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setError(null);
              }}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            >
              ← Back to sign up
            </button>
          </div>
        </div>
      </div>
    );
  }

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
