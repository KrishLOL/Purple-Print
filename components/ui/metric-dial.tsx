"use client";

import { useAnimatedNumber } from "@/lib/use-animated-number";

const SWEEP_START = -135;
const SWEEP_END = 135;
const SWEEP_TOTAL = SWEEP_END - SWEEP_START;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  if (endAngle - startAngle >= 359.99) endAngle = startAngle + 359.99;
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function valueToAngle(value: number) {
  return SWEEP_START + (Math.min(100, Math.max(0, value)) / 100) * SWEEP_TOTAL;
}

const TONE_VARS = {
  accent: "var(--accent)",
  good: "var(--good)",
  warn: "var(--warn)",
  bad: "var(--bad)",
} as const;

export function MetricDial({
  label,
  value,
  sampleSize,
  tone = "accent",
  size = 140,
}: {
  label: string;
  /** 0-100, or null for "not enough ratings". */
  value: number | null;
  sampleSize: number;
  tone?: keyof typeof TONE_VARS;
  size?: number;
}) {
  const animated = useAnimatedNumber(value ?? 0);
  const cx = 60;
  const cy = 60;
  const r = 48;

  const trackPath = describeArc(cx, cy, r, SWEEP_START, SWEEP_END);
  const valuePath =
    value != null ? describeArc(cx, cy, r, SWEEP_START, valueToAngle(animated)) : "";

  const ticks = [0, 25, 50, 75, 100].map((t) => {
    const angle = valueToAngle(t);
    const inner = polarToCartesian(cx, cy, r - 6, angle);
    const outer = polarToCartesian(cx, cy, r + 2, angle);
    return { t, inner, outer };
  });

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`${label}: ${value == null ? "not enough ratings" : `${Math.round(value)} percent`}`}>
        <path d={trackPath} fill="none" stroke="var(--border)" strokeWidth={8} strokeLinecap="round" />
        {ticks.map((tick) => (
          <line
            key={tick.t}
            x1={tick.inner.x}
            y1={tick.inner.y}
            x2={tick.outer.x}
            y2={tick.outer.y}
            stroke="var(--text-muted)"
            strokeWidth={1}
          />
        ))}
        {value != null && (
          <path
            d={valuePath}
            fill="none"
            stroke={TONE_VARS[tone]}
            strokeWidth={8}
            strokeLinecap="round"
          />
        )}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="font-num"
          fontSize={22}
          fill="var(--text)"
        >
          {value == null ? "—" : Math.round(animated)}
        </text>
        {value != null && (
          <text x={cx} y={cy + 16} textAnchor="middle" className="font-num" fontSize={10} fill="var(--text-muted)">
            %
          </text>
        )}
      </svg>
      <p className="mt-1 text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className="font-num text-[11px] text-text-muted">
        {sampleSize === 0 ? "no reviews" : `${sampleSize} review${sampleSize === 1 ? "" : "s"}`}
      </p>
    </div>
  );
}
