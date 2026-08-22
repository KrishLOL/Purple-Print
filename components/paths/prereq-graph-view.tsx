"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { GraphEdge } from "@/lib/prereq-graph";

export type PathNode = {
  id: string;
  code: string;
  title: string;
  yearLevel: number;
  prerequisitesText: string | null;
  disciplineSlug: string | null;
  disciplineName: string | null;
  colorAccent: string;
  isExternal: boolean;
  column: number;
};

const COLUMN_WIDTH = 264;
const ROW_HEIGHT = 84;
const NODE_WIDTH = 224;
const NODE_HEIGHT = 68;
const PADDING = 24;

function elbowPath(x1: number, y1: number, x2: number, y2: number): string {
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
}

export function PrereqGraphView({
  disciplines,
  selectedSlug,
  nodes,
  edges,
}: {
  disciplines: { slug: string; name: string; colorAccent: string }[];
  selectedSlug: string;
  nodes: PathNode[];
  edges: GraphEdge[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const layout = useMemo(() => {
    const byColumn = new Map<number, PathNode[]>();
    for (const node of nodes) {
      const list = byColumn.get(node.column) ?? [];
      list.push(node);
      byColumn.set(node.column, list);
    }
    for (const list of byColumn.values()) {
      list.sort((a, b) => Number(a.isExternal) - Number(b.isExternal) || a.code.localeCompare(b.code));
    }

    const positions = new Map<string, { x: number; y: number }>();
    let maxRows = 0;
    for (const [column, list] of byColumn) {
      maxRows = Math.max(maxRows, list.length);
      list.forEach((node, row) => {
        positions.set(node.id, {
          x: PADDING + column * COLUMN_WIDTH,
          y: PADDING + row * ROW_HEIGHT,
        });
      });
    }

    const maxColumn = nodes.reduce((max, n) => Math.max(max, n.column), 0);
    const width = PADDING * 2 + (maxColumn + 1) * COLUMN_WIDTH - (COLUMN_WIDTH - NODE_WIDTH);
    const height = PADDING * 2 + Math.max(1, maxRows) * ROW_HEIGHT - (ROW_HEIGHT - NODE_HEIGHT);

    return { positions, width, height };
  }, [nodes]);

  const connected = useMemo(() => {
    if (!hoveredId) return null;
    const nodeIds = new Set([hoveredId]);
    const edgeKeys = new Set<string>();
    for (const edge of edges) {
      if (edge.fromId === hoveredId || edge.toId === hoveredId) {
        nodeIds.add(edge.fromId);
        nodeIds.add(edge.toId);
        edgeKeys.add(`${edge.fromId}->${edge.toId}`);
      }
    }
    return { nodeIds, edgeKeys };
  }, [hoveredId, edges]);

  function changeDiscipline(slug: string) {
    router.push(`${pathname}?discipline=${slug}`, { scroll: false });
  }

  const hoveredNode = hoveredId ? nodes.find((n) => n.id === hoveredId) : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={selectedSlug}
          onChange={(e) => changeDiscipline(e.target.value)}
          className="font-num border border-border bg-surface px-3 py-2 text-xs uppercase tracking-wider text-text focus:border-accent focus:outline-none"
          aria-label="Choose a discipline"
        >
          {disciplines.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="inline-block h-3 w-6 border border-solid border-text-muted bg-bg" aria-hidden />
          this discipline
        </span>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="inline-block h-3 w-6 border border-dashed border-text-muted bg-bg" aria-hidden />
          prerequisite from elsewhere
        </span>
      </div>

      <p className="font-num mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
        Prerequisite <span aria-hidden>→</span> the course that needs it
      </p>

      {nodes.length === 0 ? (
        <p className="border border-border bg-surface p-6 text-center text-sm text-text-muted">
          No courses found for this discipline.
        </p>
      ) : (
        <div className="overflow-x-auto border border-border bg-surface">
          <div className="relative" style={{ width: layout.width, height: layout.height }}>
            <svg
              width={layout.width}
              height={layout.height}
              className="pointer-events-none absolute inset-0"
              aria-hidden
            >
              <defs>
                <marker
                  id="prereq-arrow"
                  viewBox="0 0 8 8"
                  refX="7"
                  refY="4"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0 L8 4 L0 8 Z" fill="var(--border)" />
                </marker>
                <marker
                  id="prereq-arrow-active"
                  viewBox="0 0 8 8"
                  refX="7"
                  refY="4"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0 L8 4 L0 8 Z" fill="var(--accent)" />
                </marker>
              </defs>
              {edges.map((edge) => {
                const from = layout.positions.get(edge.fromId);
                const to = layout.positions.get(edge.toId);
                if (!from || !to) return null;
                const x1 = from.x + NODE_WIDTH;
                const y1 = from.y + NODE_HEIGHT / 2;
                const x2 = to.x;
                const y2 = to.y + NODE_HEIGHT / 2;
                const key = `${edge.fromId}->${edge.toId}`;
                const highlighted = connected?.edgeKeys.has(key) ?? false;
                const dimmed = connected !== null && !highlighted;
                return (
                  <path
                    key={key}
                    d={elbowPath(x1, y1, x2, y2)}
                    fill="none"
                    stroke={highlighted ? "var(--accent)" : "var(--border)"}
                    strokeWidth={highlighted ? 2 : 1}
                    opacity={dimmed ? 0.25 : 1}
                    markerEnd={`url(#${highlighted ? "prereq-arrow-active" : "prereq-arrow"})`}
                  />
                );
              })}
            </svg>

            {nodes.map((node) => {
              const pos = layout.positions.get(node.id);
              if (!pos) return null;
              const isHovered = hoveredId === node.id;
              const isConnected = connected?.nodeIds.has(node.id) ?? false;
              const dimmed = connected !== null && !isConnected;
              return (
                <Link
                  key={node.id}
                  href={`/course/${encodeURIComponent(node.code)}`}
                  title={node.isExternal ? `${node.title} (${node.disciplineName})` : node.title}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(node.id)}
                  onBlur={() => setHoveredId(null)}
                  className={`absolute flex flex-col justify-center gap-0.5 overflow-hidden border bg-bg px-3 py-1.5 transition-opacity ${
                    isHovered ? "border-accent" : "border-border"
                  } ${node.isExternal ? "border-dashed" : "border-solid"}`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    borderTopColor: node.colorAccent,
                    borderTopWidth: 3,
                    opacity: dimmed ? 0.35 : 1,
                  }}
                >
                  <span className="font-num text-[11px] uppercase tracking-wider text-text-muted">
                    {node.code} · Y{node.yearLevel}
                  </span>
                  <span
                    className={`${node.isExternal ? "line-clamp-1" : "line-clamp-2"} text-xs leading-tight font-semibold`}
                  >
                    {node.title}
                  </span>
                  {node.isExternal && (
                    <span className="truncate text-[10px] text-text-muted">{node.disciplineName}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {hoveredNode?.prerequisitesText && (
        <p className="mt-3 border border-border bg-surface p-3 text-xs text-text-muted">
          <span className="font-num uppercase tracking-wider text-text">{hoveredNode.code}</span>
          {" — full prerequisite text: "}
          {hoveredNode.prerequisitesText}
        </p>
      )}
    </div>
  );
}
