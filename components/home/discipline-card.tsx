import Link from "next/link";
import { DisciplineGlyph } from "@/components/glyphs";
import type { DisciplineSummary } from "@/lib/landing";

export function DisciplineCard({ discipline }: { discipline: DisciplineSummary }) {
  return (
    <Link
      href={`/browse?discipline=${discipline.slug}`}
      className="group relative border border-border bg-surface p-4 transition-colors hover:border-accent"
      style={{ borderTopColor: discipline.colorAccent, borderTopWidth: 3 }}
    >
      <DisciplineGlyph
        glyphKey={discipline.glyphKey}
        className="h-6 w-6"
        style={{ color: discipline.colorAccent }}
      />
      <h3 className="mt-3 text-sm font-semibold group-hover:text-accent">{discipline.name}</h3>
      <p className="font-num mt-1 text-xs text-text-muted">
        {discipline.courseCount} course{discipline.courseCount === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
