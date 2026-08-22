"use client";

import { useState } from "react";
import { DisciplineCard } from "@/components/home/discipline-card";
import type { DisciplineSummary } from "@/lib/landing";

const TABS = [
  { value: "core", label: "Disciplines" },
  { value: "combined", label: "Double Degree Programs" },
] as const;

export function DisciplineTabs({
  coreDisciplines,
  combinedDegreeDisciplines,
}: {
  coreDisciplines: DisciplineSummary[];
  combinedDegreeDisciplines: DisciplineSummary[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("core");

  return (
    <div>
      <div className="font-num mb-6 flex border border-border text-xs uppercase tracking-wider" role="tablist">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 transition-colors ${
                active ? "bg-accent text-accent-contrast" : "text-text-muted hover:text-text"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "core" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {coreDisciplines.map((d) => (
            <DisciplineCard key={d.slug} discipline={d} />
          ))}
        </div>
      )}

      {tab === "combined" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {combinedDegreeDisciplines.map((d) => (
            <DisciplineCard key={d.slug} discipline={d} />
          ))}
        </div>
      )}
    </div>
  );
}
