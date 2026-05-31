import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function PostSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex gap-3 px-4 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-3.5 rounded"
              style={{ width: i === lines - 1 ? "65%" : "100%" }}
            />
          ))}
        </div>
        <div className="flex max-w-md justify-between pt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

type SkeletonProps = {
  count?: number;
  className?: string;
};

export function PostsSkeleton({ count = 4, className }: SkeletonProps) {
  return (
    <div className={className ?? "divide-y divide-border"}>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} lines={i % 2 === 0 ? 2 : 3} />
      ))}
    </div>
  );
}

type SuspenseProps = {
  count?: number;
  children: React.ReactNode;
};

export function PostsSuspense({ count = 4, children }: SuspenseProps) {
  return (
    <Suspense fallback={<PostsSkeleton count={count} />}>{children}</Suspense>
  );
}
