import type { SVGProps } from "react";

type GlyphProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** First Year (Common) — orientation / a drafting compass rose. */
export function CompassGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
      <path d="M12 8l2 4-2 4-2-4z" />
    </svg>
  );
}

/** Chemical Engineering — a beaker. */
export function BeakerGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 3h6M10 3v6l-4.5 8a1.5 1.5 0 0 0 1.3 2.2h10.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3" />
      <path d="M7.5 15h9" />
      <circle cx="10.5" cy="12" r="0.4" fill="currentColor" />
      <circle cx="13" cy="18" r="0.4" fill="currentColor" />
    </svg>
  );
}

/** Civil Engineering — a Warren truss. */
export function TrussGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 17h18M3 7h18" />
      <path d="M3 17 8 7l5 10 5-10" />
    </svg>
  );
}

/** Electrical Engineering — a signal wave. */
export function WaveGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2 12c1.5 0 1.5-6 3-6s1.5 12 3 12 1.5-12 3-12 1.5 12 3 12 1.5-6 3-6 1.5-6 3-6" />
    </svg>
  );
}

/** Green Process Engineering — a leaf. */
export function LeafGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15Z" />
      <path d="M5 19c3-4 6.5-7.5 11-11" />
    </svg>
  );
}

/** Integrated Engineering — a small connected node graph. */
export function NodeGraphGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="8" cy="18" r="2" />
      <path d="M7.6 7.2 16.4 8.4M6.8 7.8 7.6 16.4M17.2 9.6 8.8 17.2" />
    </svg>
  );
}

/** Mechanical Engineering — a gear. */
export function GearGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.4M12 18.1v2.4M20.5 12h-2.4M5.9 12H3.5M17.8 6.2l-1.7 1.7M7.9 16.1l-1.7 1.7M17.8 17.8l-1.7-1.7M7.9 7.9 6.2 6.2" />
    </svg>
  );
}

/** Mechatronic Systems Engineering — an IC chip. */
export function ChipGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="6" width="12" height="12" rx="1" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </svg>
  );
}

/** Software Engineering — angle brackets. */
export function BracketGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 6 3 12l6 6M15 6l6 6-6 6" />
    </svg>
  );
}

export const GLYPHS = {
  compass: CompassGlyph,
  beaker: BeakerGlyph,
  truss: TrussGlyph,
  wave: WaveGlyph,
  leaf: LeafGlyph,
  "node-graph": NodeGraphGlyph,
  gear: GearGlyph,
  chip: ChipGlyph,
  bracket: BracketGlyph,
} as const;

export type GlyphKey = keyof typeof GLYPHS;

export function DisciplineGlyph({
  glyphKey,
  ...props
}: GlyphProps & { glyphKey: string }) {
  const Glyph = GLYPHS[glyphKey as GlyphKey] ?? CompassGlyph;
  return <Glyph {...props} />;
}
