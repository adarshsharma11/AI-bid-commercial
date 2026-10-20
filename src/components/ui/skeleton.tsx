import type { CSSProperties } from "react";

import { cn } from "@/lib/utils/cn";

const pulse =
  "bg-line/80 motion-safe:animate-pulse rounded-md motion-reduce:animate-none";

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={cn(pulse, className)} style={style} />;
}

export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn("h-3", index === lines - 1 && lines > 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton className={cn("h-8 w-8 rounded-full", className)} />;
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-9 w-24", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("border-line bg-surface grid gap-3 border p-4", className)}>
      <Skeleton className="h-4 w-1/3" />
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonTable({
  rows = 6,
  columns = 5,
  label = "Loading table",
}: {
  rows?: number;
  columns?: number;
  label?: string;
}) {
  return (
    <div className="border-line bg-surface border" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div
        className="border-line grid gap-3 border-b px-3 py-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} className="h-3" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="grid gap-3 px-3 py-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="px-4 py-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-2 h-7 w-20" />
    </div>
  );
}

export function SkeletonChart({ label = "Loading chart" }: { label?: string }) {
  const heights = ["40%", "72%", "55%", "88%", "36%", "64%"];
  return (
    <div
      className="border-line bg-surface flex h-72 items-end gap-3 border p-4"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      {heights.map((height) => (
        <Skeleton key={height} className="flex-1 rounded-sm" style={{ height }} />
      ))}
    </div>
  );
}

export function PageSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid gap-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="border-line bg-surface grid grid-cols-2 border sm:grid-cols-4">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>
      <SkeletonTable />
    </div>
  );
}

export function DocumentListSkeleton({
  label = "Loading documents",
}: {
  label?: string;
}) {
  return (
    <div className="grid gap-2" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="border-line bg-surface flex items-center gap-3 border px-3 py-3"
        >
          <Skeleton className="h-8 w-8" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
