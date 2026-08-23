import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ConfirmationErrorPage() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 text-center space-y-6">
        <div>
          <Link
            href="/"
            className="inline-block font-black text-2xl tracking-tight text-[var(--color-foreground)] mb-3"
          >
            <span className="text-[var(--color-primary)]">●</span> HAVLI
          </Link>
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center text-xl font-bold mb-3">
            !
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
            Confirmation Link Invalid
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-2">
            Your confirmation link is invalid or has expired. Please request a
            new confirmation email or try logging in.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/login" className="block w-full">
            <Button fullWidth size="lg">
              Back to Login
            </Button>
          </Link>
          <Link href="/" className="block w-full">
            <Button variant="outline" fullWidth size="lg">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
