import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-navy/5 dark:bg-white/5",
        className,
      )}
      {...props}
    />
  );
}

/** Pre-built skeleton matching a deck card layout */
export function DeckCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 space-y-4">
      <Skeleton className="w-full aspect-video rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/** Pre-built skeleton for stat cards */
export function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
