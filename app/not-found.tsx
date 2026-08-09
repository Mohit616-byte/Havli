import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-7xl mb-4">🌆</p>
        <h1 className="text-3xl font-black text-[var(--color-foreground)] mb-2">Page not found</h1>
        <p className="text-[var(--color-muted)] mb-8">
          This page doesn&apos;t exist, but great events do.
        </p>
        <Button href="/explore">Explore events</Button>
      </div>
    </div>
  );
}
