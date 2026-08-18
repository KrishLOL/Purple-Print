import { DisciplineGlyph } from "@/components/glyphs";

export function DisciplineBadge({
  name,
  colorAccent,
  glyphKey,
}: {
  name: string;
  colorAccent: string;
  glyphKey: string;
}) {
  return (
    <span
      className="font-num inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs uppercase tracking-wider"
      style={{ borderColor: colorAccent, color: colorAccent }}
    >
      <DisciplineGlyph glyphKey={glyphKey} className="h-3.5 w-3.5" />
      {name}
    </span>
  );
}
