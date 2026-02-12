import { Skeleton } from "@/components/ui/skeleton";

export function WatchCardSkeleton() {
  return (
    <div className="rounded-sm border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        <div className="flex items-end justify-between pt-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}
