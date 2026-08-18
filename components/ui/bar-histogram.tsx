import type { HistogramBucket } from "@/lib/review-stats";

export function BarHistogram({
  buckets,
  emptyLabel = "No data yet",
}: {
  buckets: HistogramBucket[];
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  if (total === 0) {
    return <p className="text-sm text-text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="flex h-32 items-end gap-2" role="img" aria-label={buckets.map((b) => `${b.label}: ${b.count}`).join(", ")}>
      {buckets.map((bucket) => (
        <div key={bucket.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="font-num text-xs text-text-muted">{bucket.count || ""}</span>
          <div
            className="w-full border border-t-2 border-border border-t-accent bg-surface"
            style={{ height: `${Math.max(2, (bucket.count / max) * 100)}%` }}
          />
          <span className="font-num text-[10px] text-text-muted">{bucket.label}</span>
        </div>
      ))}
    </div>
  );
}
