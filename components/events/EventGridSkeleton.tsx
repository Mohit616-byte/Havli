type EventGridSkeletonProps = { count?: number };

function CardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-[var(--color-surface-2)]" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-[var(--color-border-light)] rounded-full w-3/4" />
        <div className="h-3 bg-[var(--color-border)] rounded-full w-1/2" />
        <div className="flex gap-3 mt-3">
          <div className="h-3 bg-[var(--color-border)] rounded-full w-20" />
          <div className="h-3 bg-[var(--color-border)] rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}

export default function EventGridSkeleton({ count = 6 }: EventGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      aria-label="Loading events"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
