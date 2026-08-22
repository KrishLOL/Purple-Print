"use client";

import { useMemo, useState } from "react";
import { MAX_COMPARE_ITEMS } from "@/lib/compare/params";
import { useCompareParams } from "./use-compare-params";

type Option = { id: string; label: string; sublabel?: string; groupLabel?: string };

const ALL_DISCIPLINES = "__all__";

export function ComparePicker({ options }: { options: Option[] }) {
  const { params, updateParams } = useCompareParams();
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState(ALL_DISCIPLINES);

  const disciplines = useMemo(
    () => [...new Set(options.map((o) => o.groupLabel).filter((g): g is string => Boolean(g)))].sort(),
    [options],
  );

  const selected = params.ids
    .map((id) => options.find((o) => o.id === id))
    .filter((o): o is Option => Boolean(o));

  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    let remaining = options.filter((o) => !params.ids.includes(o.id));
    if (discipline !== ALL_DISCIPLINES) remaining = remaining.filter((o) => o.groupLabel === discipline);
    if (!q) return remaining;
    return remaining.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q),
    );
  }, [options, params.ids, query, discipline]);

  const filtered = matching.slice(0, 20);

  const atMax = params.ids.length >= MAX_COMPARE_ITEMS;

  function add(id: string) {
    if (atMax) return;
    updateParams({ ids: [...params.ids, id] });
  }

  function remove(id: string) {
    updateParams({ ids: params.ids.filter((i) => i !== id) });
  }

  return (
    <div>
      <div className="mb-4 flex border border-border text-xs uppercase tracking-wider">
        {(["courses", "professors"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              updateParams({ type: t, ids: [] });
              setDiscipline(ALL_DISCIPLINES);
              setQuery("");
            }}
            className={`font-num px-4 py-2 ${
              params.type === t ? "bg-accent text-accent-contrast" : "text-text-muted hover:text-text"
            }`}
          >
            {t === "courses" ? "Courses" : "Professors"}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selected.map((s) => (
            <span
              key={s.id}
              className="font-num flex items-center gap-2 border border-accent bg-accent px-3 py-1.5 text-xs text-accent-contrast"
            >
              {s.label}
              <button type="button" onClick={() => remove(s.id)} aria-label={`Remove ${s.label}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {atMax ? (
        <p className="text-xs text-text-muted">
          Comparing the max of {MAX_COMPARE_ITEMS} — remove one to add another.
        </p>
      ) : (
        <div>
          <div className="mb-2 flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={params.type === "courses" ? "Add a course to compare" : "Add a professor to compare"}
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            {disciplines.length > 0 && (
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="font-num shrink-0 border border-border bg-surface px-2 py-2 text-xs uppercase tracking-wider text-text focus:border-accent focus:outline-none"
                aria-label="Filter by discipline"
              >
                <option value={ALL_DISCIPLINES}>All disciplines</option>
                {disciplines.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => add(o.id)}
                className="font-num flex w-full items-center justify-between border border-border px-3 py-2 text-left text-sm hover:border-accent"
              >
                <span>{o.label}</span>
                {o.sublabel && <span className="truncate pl-3 text-xs text-text-muted">{o.sublabel}</span>}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-text-muted">No matches.</p>}
          </div>
          {matching.length > filtered.length && (
            <p className="mt-1 text-xs text-text-muted">
              Showing {filtered.length} of {matching.length} — refine your search or pick a discipline to
              narrow it down.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
