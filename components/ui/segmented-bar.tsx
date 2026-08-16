const SEGMENTS = 10;

export function SegmentedBar({
  percent,
  label,
  tone = "accent",
}: {
  /** 0-100. Pass null/undefined to render an empty "not enough ratings" state. */
  percent: number | null | undefined;
  label: string;
  tone?: "accent" | "good" | "warn" | "bad";
}) {
  const filled =
    percent == null ? 0 : Math.round((Math.min(100, Math.max(0, percent)) / 100) * SEGMENTS);

  const toneVar = {
    accent: "var(--accent)",
    good: "var(--good)",
    warn: "var(--warn)",
    bad: "var(--bad)",
  }[tone];

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wider text-text-muted">{label}</span>
        <span className="font-num text-sm text-text">
          {percent == null ? "—" : `${Math.round(percent)}%`}
        </span>
      </div>
      <div
        className="flex gap-1"
        role="img"
        aria-label={`${label}: ${percent == null ? "not enough ratings" : `${Math.round(percent)} percent`}`}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className="h-3 flex-1 border border-border"
            style={{ background: i < filled ? toneVar : "transparent" }}
          />
        ))}
      </div>
    </div>
  );
}
